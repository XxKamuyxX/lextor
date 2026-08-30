import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkClienteSession, MENSAGEM_ACESSO_NEGADO } from "@/lib/acesso";
import { resolveAuthUser } from "@/lib/resolve-auth-user";

function sanitizeCliente(cliente: Record<string, unknown>) {
  const { senha_acesso: _senha, ...safe } = cliente;
  return safe;
}

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

    let { data: aportes, error: aportesError } = await admin
      .from("aportes")
      .select("*")
      .eq("cliente_id", cliente.id)
      .order("created_at", { ascending: false });

    if (aportesError) {
      const fallback = await admin
        .from("aportes")
        .select("*")
        .eq("cliente_id", cliente.id);
      if (fallback.error) throw fallback.error;
      aportes = fallback.data ?? [];
    }

    return NextResponse.json({
      ok: true,
      cliente: sanitizeCliente(cliente as Record<string, unknown>),
      aportes: aportes ?? [],
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao carregar dados do cliente.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
