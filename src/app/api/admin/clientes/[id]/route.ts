import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeEmail } from "@/lib/acesso";

type Params = { params: Promise<{ id: string }> };

function errPayload(err: unknown) {
  const e = err as { status?: number; message?: string };
  return {
    status: e?.status || 500,
    message: e?.message || "Erro inesperado.",
  };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from("clientes")
      .select(
        "id, email, nome, cpf, acesso_liberado, perfil_suitability, created_at, user_id, preferencias_investimento"
      )
      .eq("id", id)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return NextResponse.json(
        { message: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    return NextResponse.json({ cliente: data });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao carregar cliente." },
      { status }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const body = await request.json();
    const updates: Record<string, unknown> = {};

    if (body.nome != null) updates.nome = String(body.nome).trim();
    if (body.email != null) updates.email = normalizeEmail(body.email);
    if (typeof body.acesso_liberado === "boolean") {
      updates.acesso_liberado = body.acesso_liberado;
    }
    if (body.preferencias_investimento != null) {
      if (
        typeof body.preferencias_investimento !== "object" ||
        Array.isArray(body.preferencias_investimento)
      ) {
        return NextResponse.json(
          { message: "preferencias_investimento deve ser um objeto JSON." },
          { status: 400 }
        );
      }
      updates.preferencias_investimento = body.preferencias_investimento;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { message: "Nada para atualizar." },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("clientes")
      .update(updates)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return NextResponse.json({ cliente: data });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao atualizar cliente." },
      { status }
    );
  }
}

export async function DELETE(_request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: cliente } = await supabase
      .from("clientes")
      .select("user_id")
      .eq("id", id)
      .maybeSingle();

    const { error } = await supabase.from("clientes").delete().eq("id", id);
    if (error) throw error;

    if (cliente?.user_id) {
      await supabase.auth.admin.deleteUser(cliente.user_id);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao remover cliente." },
      { status }
    );
  }
}
