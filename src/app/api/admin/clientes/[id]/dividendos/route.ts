import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";

type Params = { params: Promise<{ id: string }> };

const TIPOS_PROVENTO = [
  "Dividendo",
  "JCP",
  "Rendimento FII",
  "Outros",
] as const;

function errPayload(err: unknown) {
  const e = err as { status?: number; message?: string; code?: string };
  return {
    status: e?.status || 500,
    message: e?.message || "Erro inesperado.",
    code: e?.code,
  };
}

function normalizaTicker(value: unknown) {
  return String(value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/\.SA$/i, "");
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id, nome, email")
      .eq("id", id)
      .maybeSingle();

    if (clienteError) throw clienteError;
    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    const { data, error } = await supabase
      .from("dividendos")
      .select("*")
      .eq("cliente_id", id)
      .order("data_pagamento", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      cliente,
      dividendos: data ?? [],
    });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao carregar dividendos." },
      { status }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    const { id: clienteId } = await params;
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id")
      .eq("id", clienteId)
      .maybeSingle();

    if (clienteError) throw clienteError;
    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    const ticker = normalizaTicker(body.ticker);
    const tipo = String(body.tipo ?? "").trim();
    const valorTotal = Number(
      String(body.valor_total ?? "").replace(",", ".")
    );
    const dataPagamento = String(
      body.data_pagamento ?? body.data ?? ""
    ).trim();

    if (!ticker) {
      return NextResponse.json(
        { message: "Informe o ticker do ativo." },
        { status: 400 }
      );
    }
    if (!(TIPOS_PROVENTO as readonly string[]).includes(tipo)) {
      return NextResponse.json(
        {
          message:
            "Tipo inválido. Use Dividendo, JCP, Rendimento FII ou Outros.",
        },
        { status: 400 }
      );
    }
    if (!Number.isFinite(valorTotal) || valorTotal <= 0) {
      return NextResponse.json(
        { message: "Valor total deve ser um número maior que zero." },
        { status: 400 }
      );
    }
    if (!dataPagamento) {
      return NextResponse.json(
        { message: "Informe a data do pagamento." },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("dividendos")
      .insert({
        cliente_id: clienteId,
        ticker,
        tipo,
        valor_total: valorTotal,
        data_pagamento: dataPagamento,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, dividendo: data }, { status: 201 });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao registrar provento." },
      { status }
    );
  }
}
