import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { linkClienteSession, MENSAGEM_ACESSO_NEGADO } from "@/lib/acesso";
import { resolveAuthUser } from "@/lib/resolve-auth-user";
import { tickerDoAporte } from "@/lib/cliente";
import {
  buildBenchmarkSeries,
  buildCarteiraSeries,
  mergeComparisonSeries,
  parseIndicadoresParam,
  resolvePeriodoRange,
  totalReturnPercent,
} from "@/lib/benchmarks";

type CotacaoRow = {
  ativo: string;
  preco_fechamento: number;
  data_cotacao: string;
};

type BenchmarkRow = {
  indicador: string;
  data_referencia: string;
  valor_mensal: number;
};

export async function GET(request: Request) {
  try {
    const user = await resolveAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { ok: false, message: "Sessão inválida." },
        { status: 401 }
      );
    }

    const admin = createAdminClient();
    const cliente = await linkClienteSession(admin, user);
    if (!cliente) {
      return NextResponse.json(
        { ok: false, message: MENSAGEM_ACESSO_NEGADO },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const periodo = searchParams.get("periodo") || "12m";
    const indicadores = parseIndicadoresParam(searchParams.get("indicadores"));

    let { data: aportes, error: aportesError } = await admin
      .from("aportes")
      .select("*")
      .eq("cliente_id", cliente.id);

    if (aportesError) throw aportesError;

    const tickers = [...new Set((aportes ?? []).map(tickerDoAporte).filter(Boolean))];
    const { inicio, fim } = resolvePeriodoRange(periodo, aportes ?? []);

    let cotacoesRows: CotacaoRow[] = [];
    if (tickers.length) {
      const { data, error } = await admin
        .from("cotacoes_historicas")
        .select("ativo, preco_fechamento, data_cotacao")
        .in("ativo", tickers)
        .gte("data_cotacao", inicio.toISOString().slice(0, 10))
        .lte("data_cotacao", fim.toISOString().slice(0, 10))
        .order("data_cotacao", { ascending: true });

      if (!error) cotacoesRows = (data ?? []) as CotacaoRow[];
    }

    let benchmarkRows: BenchmarkRow[] = [];
    const benchQuery = await admin
      .from("benchmarks_historicos")
      .select("indicador, data_referencia, valor_mensal")
      .gte("data_referencia", inicio.toISOString().slice(0, 10))
      .lte("data_referencia", fim.toISOString().slice(0, 10))
      .order("data_referencia", { ascending: true });

    if (!benchQuery.error) {
      benchmarkRows = (benchQuery.data ?? []) as BenchmarkRow[];
    }

    const carteiraSeries = buildCarteiraSeries(
      aportes ?? [],
      cotacoesRows,
      inicio,
      fim
    );

    const benchmarks: Record<string, ReturnType<typeof buildBenchmarkSeries>> = {};
    for (const id of indicadores) {
      benchmarks[id] = buildBenchmarkSeries(id, benchmarkRows, inicio, fim);
    }

    const series = mergeComparisonSeries(carteiraSeries, benchmarks, indicadores);

    const resumo: Record<string, number> = {
      carteira: totalReturnPercent(carteiraSeries),
    };
    for (const id of indicadores) {
      resumo[id] = totalReturnPercent(benchmarks[id]);
    }

    return NextResponse.json({
      ok: true,
      periodo,
      indicadores,
      resumo,
      series,
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Erro ao carregar benchmarks.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
