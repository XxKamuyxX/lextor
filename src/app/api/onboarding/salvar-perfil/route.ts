import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkClienteSession } from "@/lib/acesso";
import { resolveAuthUser } from "@/lib/resolve-auth-user";

function colunaAusenteNoErro(message: string) {
  const match = String(message || "").match(/Could not find the '([^']+)' column/);
  return match?.[1] ?? null;
}

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
    let payload: Record<string, unknown> = {
      perfil_suitability: perfil,
      termos_aceitos_em: termosAceitosEm,
      suitability_respostas: answers,
      user_id: user.id,
    };

    let updateError: { message?: string } | null = null;
    let updated = false;

    for (let i = 0; i < 5; i += 1) {
      const { error } = await admin
        .from("clientes")
        .update(payload)
        .eq("id", cliente.id);

      if (!error) {
        updateError = null;
        updated = true;
        break;
      }

      updateError = error;
      const coluna = colunaAusenteNoErro(error.message || "");
      if (coluna && coluna in payload) {
        delete payload[coluna];
        continue;
      }
      break;
    }

    if (!updated && updateError) throw updateError;

    const { data: confirmado, error: readError } = await admin
      .from("clientes")
      .select("id, perfil_suitability")
      .eq("id", cliente.id)
      .maybeSingle();

    if (readError) throw readError;

    const perfilSalvo = String(confirmado?.perfil_suitability ?? "").trim();
    if (!perfilSalvo) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "Perfil não foi gravado. Execute o SQL de schema em clientes (coluna perfil_suitability) no Supabase.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      perfil_suitability: perfilSalvo,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Não foi possível salvar o perfil.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
