import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin-auth";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  formatBRL,
  summarizeAportes,
  tickerDoAporte,
} from "@/lib/cliente";

type Params = { params: Promise<{ id: string }> };

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

async function fetchUltimosPrecosAdmin(
  supabase: ReturnType<typeof createAdminClient>,
  tickers: string[]
) {
  const unicos = [...new Set(tickers.map(normalizaTicker).filter(Boolean))];
  if (unicos.length === 0) return {} as Record<string, number>;

  const { data, error } = await supabase
    .from("cotacoes_historicas")
    .select("ativo, preco_fechamento, data_cotacao")
    .in("ativo", unicos)
    .order("data_cotacao", { ascending: false });

  if (error) throw error;

  const precos: Record<string, number> = {};
  for (const row of data ?? []) {
    const ativo = normalizaTicker(row.ativo);
    if (!ativo || precos[ativo] != null) continue;
    const preco = Number(row.preco_fechamento);
    if (!Number.isNaN(preco)) precos[ativo] = preco;
  }
  return precos;
}

async function loadAportesDoCliente(
  supabase: ReturnType<typeof createAdminClient>,
  clienteId: string
) {
  let { data, error } = await supabase
    .from("aportes")
    .select("*")
    .eq("cliente_id", clienteId)
    .order("created_at", { ascending: false });

  if (error) {
    const fallback = await supabase
      .from("aportes")
      .select("*")
      .eq("cliente_id", clienteId);
    if (fallback.error) throw fallback.error;
    data = fallback.data ?? [];
  }

  return data ?? [];
}

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireAdminSession();
    const { id } = await params;
    const supabase = createAdminClient();

    const { data: cliente, error: clienteError } = await supabase
      .from("clientes")
      .select("id, nome, email, acesso_liberado, perfil_suitability")
      .eq("id", id)
      .maybeSingle();

    if (clienteError) throw clienteError;
    if (!cliente) {
      return NextResponse.json(
        { message: "Cliente não encontrado." },
        { status: 404 }
      );
    }

    const aportes = await loadAportesDoCliente(supabase, id);
    const tickers = aportes.map(tickerDoAporte).filter(Boolean);
    const precos = await fetchUltimosPrecosAdmin(supabase, tickers);
    const summary = summarizeAportes(aportes, precos);

    const carteira = aportes.map((aporte) => {
      const ticker = tickerDoAporte(aporte);
      const qtd = Number(aporte.quantidade ?? 0);
      const precoMedio = Number(aporte.preco_medio ?? aporte.preco ?? 0);
      const precoAtual =
        ticker && precos[ticker] != null ? Number(precos[ticker]) : null;
      const precoUsado = precoAtual != null ? precoAtual : precoMedio;
      const valorAtual = qtd * precoUsado;

      return {
        ...aporte,
        ticker_normalizado: ticker || null,
        preco_atual: precoAtual,
        valor_atual: valorAtual,
      };
    });

    return NextResponse.json({
      ok: true,
      cliente,
      aportes: carteira,
      precos,
      summary: {
        ...summary,
        patrimonioFormatado: formatBRL(summary.patrimonio),
      },
    });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao carregar aportes." },
      { status }
    );
  }
}

function colunaAusenteNoErro(message: string) {
  const match = String(message || "").match(/Could not find the '([^']+)' column/);
  return match?.[1] ?? null;
}

async function insertAporteCompativel(
  supabase: ReturnType<typeof createAdminClient>,
  row: Record<string, unknown>
) {
  let payload = { ...row };
  const maxTentativas = 10;

  for (let tentativa = 0; tentativa < maxTentativas; tentativa += 1) {
    const { data, error } = await supabase
      .from("aportes")
      .insert(payload)
      .select("*")
      .single();

    if (!error) return data;

    const coluna = colunaAusenteNoErro(error.message || "");
    if (coluna && coluna in payload) {
      delete payload[coluna];
      if (Object.keys(payload).length === 0) throw error;
      continue;
    }

    throw error;
  }

  throw new Error("Não foi possível registrar o aporte após várias tentativas.");
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

    const tipoAtivo = String(body.tipo_ativo ?? "").trim();
    const ticker = normalizaTicker(body.ticker);
    const quantidade = Number(body.quantidade);
    const precoMedio = Number(body.preco_medio);
    const dataAporte = String(body.data ?? body.data_aporte ?? "").trim();

    const tiposValidos = ["Ação", "FII", "Renda Fixa"];
    if (!tiposValidos.includes(tipoAtivo)) {
      return NextResponse.json(
        { message: "Tipo de ativo inválido. Use Ação, FII ou Renda Fixa." },
        { status: 400 }
      );
    }
    if (!ticker) {
      return NextResponse.json(
        { message: "Informe o ticker do ativo." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(quantidade) || quantidade <= 0) {
      return NextResponse.json(
        { message: "Quantidade deve ser um número maior que zero." },
        { status: 400 }
      );
    }
    if (!Number.isFinite(precoMedio) || precoMedio < 0) {
      return NextResponse.json(
        { message: "Preço médio inválido." },
        { status: 400 }
      );
    }
    if (!dataAporte) {
      return NextResponse.json(
        { message: "Informe a data do aporte." },
        { status: 400 }
      );
    }

    const valorAportado = quantidade * precoMedio;

    const baseRow: Record<string, unknown> = {
      cliente_id: clienteId,
      tipo_ativo: tipoAtivo,
      ativo: ticker,
      ticker,
      quantidade,
      preco_medio: precoMedio,
      preco: precoMedio,
      valor_aportado: valorAportado,
      data_aporte: dataAporte,
    };

    const data = await insertAporteCompativel(supabase, baseRow);

    return NextResponse.json({ ok: true, aporte: data }, { status: 201 });
  } catch (err) {
    const { status, message } = errPayload(err);
    return NextResponse.json(
      { message: message || "Erro ao registrar aporte." },
      { status }
    );
  }
}
