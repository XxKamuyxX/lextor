import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkClienteSession, MENSAGEM_ACESSO_NEGADO } from "@/lib/acesso";
import { mustChangePassword } from "@/lib/auth-guards";

async function resolveUser(request: Request) {
  const authHeader = request.headers.get("authorization");
  const admin = createAdminClient();

  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) {
      const { data, error } = await admin.auth.getUser(token);
      if (!error && data.user) return { user: data.user, supabase: await createClient() };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) return { user: null, supabase };
  return { user, supabase };
}

export async function POST(request: Request) {
  try {
    const { user, supabase } = await resolveUser(request);

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Sessão inválida. Tente entrar novamente." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const cliente = await linkClienteSession(admin, user);

    if (!cliente) {
      if (supabase) await supabase.auth.signOut();
      return NextResponse.json(
        {
          ok: false,
          message: `${MENSAGEM_ACESSO_NEGADO} Confira se o e-mail é exatamente o cadastrado no admin.`,
        },
        { status: 403 }
      );
    }

    let redirect = "/dashboard";
    if (mustChangePassword(user)) {
      redirect = "/alterar-senha";
    } else if (!cliente.perfil_suitability) {
      redirect = "/onboarding";
    }

    return NextResponse.json({
      ok: true,
      redirect,
      clienteId: cliente.id,
      mustChangePassword: mustChangePassword(user),
      perfil_suitability: cliente.perfil_suitability ?? null,
    });
  } catch (err) {
    const message =
      err instanceof Error &&
      err.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "Configuração do servidor incompleta (SUPABASE_SERVICE_ROLE_KEY). Contate o suporte."
        : MENSAGEM_ACESSO_NEGADO;

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
