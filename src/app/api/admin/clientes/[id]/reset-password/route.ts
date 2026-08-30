import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  provisionarSenhaCliente,
  salvarSenhaAcesso,
} from "@/lib/auth-users";

type Params = { params: Promise<{ id: string }> };

function errPayload(err: unknown) {
  const e = err as { status?: number; message?: string };
  return {
    status: e?.status || 500,
    message: e?.message || "Erro inesperado.",
  };
}

export async function POST(_request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: cliente, error: fetchError } = await supabase
      .from("clientes")
      .select("id, email, nome, user_id")
      .eq("id", id)
      .maybeSingle();

    if (fetchError) throw fetchError;
    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    const { userId, senhaTemporaria } = await provisionarSenhaCliente(supabase, {
      email: cliente.email,
      nome: cliente.nome,
      userId: cliente.user_id,
    });

    const { error: updateError } = await supabase
      .from("clientes")
      .update({ user_id: userId, senha_acesso: senhaTemporaria, acesso_liberado: true })
      .eq("id", cliente.id);

    if (updateError) {
      await supabase
        .from("clientes")
        .update({ user_id: userId, acesso_liberado: true })
        .eq("id", cliente.id);
      await salvarSenhaAcesso(supabase, cliente.id, senhaTemporaria);
    }

    return NextResponse.json({
      senhaTemporaria,
      message:
        "Nova senha temporária gerada. O cliente precisará trocá-la no próximo login.",
    });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao gerar nova senha." },
      { status }
    );
  }
}
