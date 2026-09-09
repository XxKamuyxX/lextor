import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkClienteSession, MENSAGEM_ACESSO_NEGADO } from "@/lib/acesso";
import { resolveAuthUser } from "@/lib/resolve-auth-user";

export async function GET(request: Request) {
  try {
    const user = await resolveAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Sessão inválida. Tente entrar novamente." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const cliente = await linkClienteSession(admin, user);

    if (!cliente) {
      return NextResponse.json(
        { ok: false, message: MENSAGEM_ACESSO_NEGADO },
        { status: 403 }
      );
    }

    const { data, error } = await admin
      .from("dividendos")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("data_pagamento", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      dividendos: data ?? [],
    });
  } catch (err) {
    const message =
      err instanceof Error
        ? err.message
        : "Erro ao carregar renda passiva.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
