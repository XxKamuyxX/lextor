import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { tickerDoAporte } from "@/lib/cliente";

type Params = { params: Promise<{ id: string }> };

const TIPOS_VENDA = ["Ação", "FII", "ETF"] as const;

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

async function mediaCustoTicker(
  supabase: ReturnType<typeof createAdminClient>,
  clienteId: string,
  ticker: string
) {
  const { data, error } = await supabase
    .from("aportes")
    .select("*")
    .eq("cliente_id", clienteId);

  if (error) throw error;

  let qtd = 0;
  let custo = 0;

  for (const aporte of data ?? []) {
    const t = tickerDoAporte(aporte);
    if (t !== ticker) continue;
    const quantidade = Number(aporte.quantidade ?? 0);
    const preco = Number(aporte.preco_medio ?? aporte.preco ?? 0);
    if (quantidade <= 0 || !Number.isFinite(preco)) continue;
    qtd += quantidade;
    custo += quantidade * preco;
  }

  if (qtd <= 0) return null;
  return custo / qtd;
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id, nome, email, prejuizos_acumulados")
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
      .from("vendas")
      .select("*")
      .eq("cliente_id", id)
      .order("data_venda", { ascending: false });

    if (error) throw error;

    return NextResponse.json({
      ok: true,
      cliente,
      vendas: data ?? [],
    });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao carregar vendas." },
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
    const quantidade = Number(String(body.quantidade ?? "").replace(",", "."));
    const precoVenda = Number(String(body.preco_venda ?? "").replace(",", "."));
    const dataVenda = String(body.data_venda ?? body.data ?? "").trim();

    if (!ticker) {
      return NextResponse.json(
        { message: "Informe o ticker do ativo." },
        { status: 400 }
      );
    }
    if (!(TIPOS_VENDA as readonly string[]).includes(tipo)) {
      return NextResponse.json(
        { message: "Tipo inválido. Use Ação, FII ou ETF." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      return NextResponse.json(
        { message: "Quantidade deve ser maior que zero." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(precoVenda) || precoVenda < 0) {
      return NextResponse.json(
        { message: "Preço de venda inválido." },
        { status: 400 }
      );
    }
    if (!dataVenda) {
      return NextResponse.json(
        { message: "Informe a data da venda." },
        { status: 400 }
      );
    }

    const precoMedioInformado =
      body.preco_medio != null && body.preco_medio !== ""
        ? Number(String(body.preco_medio).replace(",", "."))
        : null;
    const precoMedio =
      Number.isFinite(precoMedioInformado as number)
        ? (precoMedioInformado as number)
        : await mediaCustoTicker(supabase, clienteId, ticker);

    const valorVenda = quantidade * precoVenda;
    const lucro =
      precoMedio != null && Number.isFinite(precoMedio)
        ? (precoVenda - precoMedio) * quantidade
        : null;

    const { data, error } = await supabase
      .from("vendas")
      .insert({
        cliente_id: clienteId,
        ticker,
        tipo,
        quantidade,
        preco_venda: precoVenda,
        preco_medio: precoMedio,
        valor_venda: valorVenda,
        lucro,
        data_venda: dataVenda,
      })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ ok: true, venda: data }, { status: 201 });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao registrar venda." },
      { status }
    );
  }
}
