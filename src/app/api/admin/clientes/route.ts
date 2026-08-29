import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/acesso";
import {
  provisionarSenhaCliente,
  salvarSenhaAcesso,
} from "@/lib/auth-users";
import { isCpfValido, normalizeCpf } from "@/lib/cpf";

const CLIENTE_FIELDS =
  "id, email, nome, cpf, acesso_liberado, perfil_suitability, created_at, user_id, senha_acesso";

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
      .select(CLIENTE_FIELDS)
      .order("created_at", { ascending: false });

    if (error) {
      const fallback = await supabase
        .from("clientes")
        .select(
          "id, email, nome, cpf, acesso_liberado, perfil_suitability, user_id"
        );
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
      .select("id, user_id")
      .eq("email", email)
      .maybeSingle();

    if (existing) {
      const auth = await provisionarSenhaCliente(supabase, {
        email,
        nome,
        userId: existing.user_id,
      });

      const { data, error } = await supabase
        .from("clientes")
        .update({
          nome,
          cpf,
          acesso_liberado: true,
          user_id: auth.userId,
          senha_acesso: auth.senhaTemporaria,
        })
        .eq("id", existing.id)
        .select("*")
        .single();

      if (error) {
        await salvarSenhaAcesso(supabase, existing.id, auth.senhaTemporaria);
        const { data: fallback, error: fallbackError } = await supabase
          .from("clientes")
          .update({
            nome,
            cpf,
            acesso_liberado: true,
            user_id: auth.userId,
          })
          .eq("id", existing.id)
          .select("*")
          .single();
        if (fallbackError) throw fallbackError;

        return NextResponse.json({
          cliente: { ...fallback, senha_acesso: auth.senhaTemporaria },
          senhaTemporaria: auth.senhaTemporaria,
          message:
            "Cliente já existia — dados atualizados e nova senha de acesso gerada.",
        });
      }

      return NextResponse.json({
        cliente: data,
        senhaTemporaria: auth.senhaTemporaria,
        message:
          "Cliente já existia — dados atualizados e nova senha de acesso gerada.",
      });
    }

    const auth = await provisionarSenhaCliente(supabase, { email, nome });

    const { data, error } = await supabase
      .from("clientes")
      .insert({
        email,
        nome,
        cpf,
        acesso_liberado,
        user_id: auth.userId,
        senha_acesso: auth.senhaTemporaria,
      })
      .select("*")
      .single();

    if (error) {
      const { data: fallback, error: fallbackError } = await supabase
        .from("clientes")
        .insert({
          email,
          nome,
          cpf,
          acesso_liberado,
          user_id: auth.userId,
        })
        .select("*")
        .single();

      if (fallbackError) {
        await supabase.auth.admin.deleteUser(auth.userId);
        throw fallbackError;
      }

      await salvarSenhaAcesso(supabase, fallback.id, auth.senhaTemporaria);

      return NextResponse.json({
        cliente: { ...fallback, senha_acesso: auth.senhaTemporaria },
        senhaTemporaria: auth.senhaTemporaria,
        message:
          "Cliente cadastrado. Envie a senha temporária ao cliente — no primeiro login ele deverá trocá-la.",
      });
    }

    return NextResponse.json({
      cliente: data,
      senhaTemporaria: auth.senhaTemporaria,
      message:
        "Cliente cadastrado. Envie a senha temporária ao cliente — no primeiro login ele deverá trocá-la.",
    });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao cadastrar cliente." },
      { status }
    );
  }
}
