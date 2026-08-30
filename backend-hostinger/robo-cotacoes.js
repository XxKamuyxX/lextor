/**
 * Robô de cotações diárias
 * 1) Lê tickers únicos de renda variável (Ações / FIIs) em `aportes`
 * 2) Busca preço de fechamento (Yahoo Finance → fallback Brapi.dev)
 * 3) Grava em `cotacoes_historicas`
 *
 * Uso: npm run cotacoes
 */
import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import YahooFinance from "yahoo-finance2";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    "Defina SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY no arquivo .env"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const yahooFinance = new YahooFinance({
  suppressNotices: ["yahooSurvey"],
});

/** Tipos considerados renda variável (Ações e FIIs). */
const TIPOS_RENDA_VARIAVEL = [
  "ação",
  "acoes",
  "ações",
  "acao",
  "fii",
  "fiis",
  "fundo imobiliário",
  "fundo imobiliario",
  "renda variável",
  "renda variavel",
  "rv",
];

function normaliza(texto) {
  return String(texto ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g)
    .toLowerCase()
    .trim();
}

function ehRendaVariavel(tipoAtivo) {
  const t = normaliza(tipoAtivo);
  if (!t) return false;
  return TIPOS_RENDA_VARIAVEL.some(
    (chave) => t === normaliza(chave) || t.includes(normaliza(chave))
  );
}

/** Data de cotação no fuso de São Paulo (YYYY-MM-DD). */
function dataCotacaoHoje() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** Normaliza ticker B3 (PETR4) e símbolo Yahoo (PETR4.SA). */
function simbolosDoTicker(ticker) {
  const limpo = String(ticker ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");

  if (!limpo) return null;

  const semSa = limpo.replace(/\.SA$/i, "");
  return {
    ativo: semSa,
    yahoo: `${semSa}.SA`,
  };
}

async function buscarTickersUnicos() {
  // Schema real: ativo + tipo_ativo (sem colunas ticker/tipo)
  const { data, error } = await supabase
    .from("aportes")
    .select("ativo, tipo_ativo")
    .not("ativo", "is", null);

  if (error) throw error;

  const unicos = new Map();

  for (const row of data ?? []) {
    if (!ehRendaVariavel(row.tipo_ativo)) continue;

    const simbolos = simbolosDoTicker(row.ativo);
    if (!simbolos) continue;

    unicos.set(simbolos.ativo, simbolos);
  }

  return [...unicos.values()];
}

async function precoYahoo(simboloYahoo) {
  const quote = await yahooFinance.quote(simboloYahoo, {
    fields: ["symbol", "regularMarketPrice", "regularMarketPreviousClose"],
  });

  const preco =
    quote?.regularMarketPreviousClose ?? quote?.regularMarketPrice;

  if (preco == null || Number.isNaN(Number(preco))) {
    throw new Error(`Yahoo sem preço para ${simboloYahoo}`);
  }

  return Number(preco);
}

async function precoBrapi(ticker) {
  const token = process.env.BRAPI_TOKEN;
  const qs = token ? `?token=${encodeURIComponent(token)}` : "";
  const url = `https://brapi.dev/api/quote/${encodeURIComponent(ticker)}${qs}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Brapi HTTP ${res.status} para ${ticker}`);
  }

  const json = await res.json();
  const item = json?.results?.[0];
  if (!item) throw new Error(`Brapi sem resultado para ${ticker}`);

  const preco =
    item.regularMarketPreviousClose ??
    item.regularMarketPrice ??
    item.close ??
    item.price;

  if (preco == null || Number.isNaN(Number(preco))) {
    throw new Error(`Brapi sem preço para ${ticker}`);
  }

  return Number(preco);
}

async function buscarPrecoFechamento({ ativo, yahoo }) {
  try {
    const preco = await precoYahoo(yahoo);
    return { preco, fonte: "yahoo" };
  } catch (errYahoo) {
    console.warn(`  Yahoo falhou (${ativo}): ${errYahoo.message}`);
    try {
      const preco = await precoBrapi(ativo);
      return { preco, fonte: "brapi" };
    } catch (errBrapi) {
      throw new Error(
        `Yahoo: ${errYahoo.message} | Brapi: ${errBrapi.message}`
      );
    }
  }
}

async function salvarCotacoes(registros) {
  if (registros.length === 0) return { count: 0 };

  // Upsert evita duplicar o mesmo ativo no mesmo dia
  // (requer UNIQUE em ativo + data_cotacao — ver schema-cotacoes.sql)
  const { data, error } = await supabase
    .from("cotacoes_historicas")
    .upsert(registros, {
      onConflict: "ativo,data_cotacao",
      ignoreDuplicates: false,
    })
    .select("ativo");

  if (error) throw error;
  return { count: data?.length ?? registros.length };
}

async function main() {
  console.log("=== Robô de cotações ===");
  const dataCotacao = dataCotacaoHoje();
  console.log(`Data de cotação: ${dataCotacao}`);

  const tickers = await buscarTickersUnicos();
  console.log(`Tickers de renda variável únicos: ${tickers.length}`);

  if (tickers.length === 0) {
    console.log("Nada a cotar. Encerrando.");
    return;
  }

  const registros = [];
  const falhas = [];

  for (const item of tickers) {
    process.stdout.write(`→ ${item.ativo} ... `);
    try {
      const { preco, fonte } = await buscarPrecoFechamento(item);
      console.log(`R$ ${preco.toFixed(2)} (${fonte})`);
      registros.push({
        ativo: item.ativo,
        preco_fechamento: preco,
        data_cotacao: dataCotacao,
      });
    } catch (err) {
      console.log("ERRO");
      falhas.push({ ativo: item.ativo, erro: err.message });
    }

    // Pausa leve para não saturar as APIs gratuitas
    await new Promise((r) => setTimeout(r, 400));
  }

  if (registros.length > 0) {
    const { count } = await salvarCotacoes(registros);
    console.log(`\nSalvos/atualizados em cotacoes_historicas: ${count}`);
  }

  if (falhas.length > 0) {
    console.log("\nFalhas:");
    for (const f of falhas) {
      console.log(`  - ${f.ativo}: ${f.erro}`);
    }
    process.exitCode = 1;
  }

  console.log("\nConcluído.");
}

main().catch((err) => {
  console.error("Falha fatal:", err.message ?? err);
  process.exit(1);
});
