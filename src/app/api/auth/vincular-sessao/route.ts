import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkClienteSession, MENSAGEM_ACESSO_NEGADO } from "@/lib/acesso";
import { mustChangePassword } from "@/lib/auth-guards";

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      return NextResponse.json(
        { ok: false, message: "Sessão inválida. Tente entrar novamente." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const cliente = await linkClienteSession(admin, user);

    if (!cliente) {
      await supabase.auth.signOut();
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

    return NextResponse.json({ ok: true, redirect });
  } catch (err) {
    const message =
      err instanceof Error &&
      err.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "Configuração do servidor incompleta (SUPABASE_SERVICE_ROLE_KEY). Contate o suporte."
        : MENSAGEM_ACESSO_NEGADO;

    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
