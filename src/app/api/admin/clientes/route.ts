import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/acesso";
import { isCpfValido, normalizeCpf } from "@/lib/cpf";

function errPayload(err: unknown) {
  const e = err as { status?: number; message?: string };
  return {
    status: e?.status || 500,
    message: e?.message || "Erro inesperado.",
  };
}

export async function GET() {
  try {
    await requireAdminSession();
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("clientes")
      .select(
        "id, email, nome, cpf, acesso_liberado, perfil_suitability, created_at, user_id"
      )
      .order("created_at", { ascending: false });

    if (error) {
      const fallback = await supabase
        .from("clientes")
        .select("id, email, nome, cpf, acesso_liberado, perfil_suitability, user_id");
      if (fallback.error) throw fallback.error;
      return NextResponse.json({ clientes: fallback.data ?? [] });
    }

    return NextResponse.json({ clientes: data ?? [] });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao listar clientes." },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const body = await request.json();
    const email = normalizeEmail(body?.email);
    const nome = String(body?.nome || "").trim() || email.split("@")[0];
    const cpf = normalizeCpf(body?.cpf);
    const acesso_liberado = body?.acesso_liberado !== false;

    if (!email) {
      return NextResponse.json(
        { message: "Informe um e-mail válido." },
        { status: 400 }
      );
    }

    if (!isCpfValido(cpf)) {
      return NextResponse.json(
        { message: "Informe um CPF válido com 11 dígitos." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data: existing } = await supabase
      .from("clientes")
      .select("id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      const { data, error } = await supabase
        .from("clientes")
        .update({ nome, cpf, acesso_liberado })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) throw error;
      return NextResponse.json({
        cliente: data,
        message: "Cliente já existia — dados atualizados.",
      });
    }

    const { data, error } = await supabase
      .from("clientes")
      .insert({ id: randomUUID(), email, nome, cpf, acesso_liberado })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      cliente: data,
      message: "Cliente cadastrado com sucesso.",
    });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao cadastrar cliente." },
      { status }
    );
  }
}
