import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkClienteSession } from "@/lib/acesso";
import { resolveAuthUser } from "@/lib/resolve-auth-user";

export async function POST(request: Request) {
  try {
    const user = await resolveAuthUser(request);

    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Sessão inválida. Tente entrar novamente." },
        { status: 401 }
      );
    }

    const body = await request.json();
    const perfil = String(body?.perfil_suitability || "").trim();
    const answers = body?.answers ?? null;

    if (!perfil) {
      return NextResponse.json(
        { ok: false, message: "Perfil de suitability inválido." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const cliente = await linkClienteSession(admin, user);

    if (!cliente) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Cliente não encontrado ou sem acesso liberado. Solicite cadastro à consultoria.",
        },
        { status: 403 }
      );
    }

    const termosAceitosEm = new Date().toISOString();
    const payload = {
      perfil_suitability: perfil,
      termos_aceitos_em: termosAceitosEm,
      suitability_respostas: answers,
    };

    let { error: updateError } = await admin
      .from("clientes")
      .update(payload)
      .eq("id", cliente.id);

    if (updateError) {
      ({ error: updateError } = await admin
        .from("clientes")
        .update({
          perfil_suitability: perfil,
          termos_aceitos_em: termosAceitosEm,
        })
        .eq("id", cliente.id));
    }

    if (updateError) throw updateError;

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Não foi possível salvar o perfil.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
