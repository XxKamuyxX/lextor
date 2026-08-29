import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
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

    const supabase = await createClient();
    const autorizado = await verificarAcessoPorEmail(supabase, email);

    return NextResponse.json({
      autorizado,
      message: autorizado ? null : MENSAGEM_ACESSO_NEGADO,
    });
  } catch {
    return NextResponse.json(
      { autorizado: false, message: MENSAGEM_ACESSO_NEGADO },
      { status: 500 }
    );
  }
}
