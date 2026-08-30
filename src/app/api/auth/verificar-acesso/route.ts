import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  MENSAGEM_ACESSO_NEGADO,
  normalizeEmail,
  verificarAcessoPorEmail,
} from "@/lib/acesso";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = normalizeEmail(body?.email);

    if (!email) {
      return NextResponse.json(
        { autorizado: false, message: MENSAGEM_ACESSO_NEGADO },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const autorizado = await verificarAcessoPorEmail(supabase, email);

    return NextResponse.json({
      autorizado,
      message: autorizado ? null : MENSAGEM_ACESSO_NEGADO,
    });
  } catch (err) {
    const message =
      err instanceof Error &&
      err.message.includes("SUPABASE_SERVICE_ROLE_KEY")
        ? "Configuração do servidor incompleta. Contate o suporte técnico."
        : MENSAGEM_ACESSO_NEGADO;

    return NextResponse.json({ autorizado: false, message }, { status: 500 });
  }
}
