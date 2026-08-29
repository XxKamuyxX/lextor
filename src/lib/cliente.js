/**
 * Helpers para a tabela `clientes` e `aportes`.
 * Vínculo preferencial: user_id = auth.users.id; fallback por e-mail.
 */

import {
  fetchClienteByEmail,
  isAcessoLiberado,
  linkClienteSession,
} from "@/lib/acesso";

export { linkClienteSession, isAcessoLiberado, fetchClienteByEmail };

export async function getSessionUser(supabase) {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

export async function fetchCliente(supabase, user) {
  if (!user) return null;

  const byUser = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (byUser.data) return byUser.data;

  if (user.email) {
    return fetchClienteByEmail(supabase, user.email);
  }

  return null;
}

/** @deprecated Use linkClienteSession — clientes devem ser cadastrados previamente pelo admin. */
export async function ensureCliente(supabase, user, extras = {}) {
  const cliente = await linkClienteSession(supabase, user);
  if (!cliente) {
    throw new Error(
      "Cliente não encontrado ou sem acesso liberado. Solicite cadastro à consultoria."
    );
  }

  if (Object.keys(extras).length > 0) {
    const { data, error } = await supabase
      .from("clientes")
      .update(extras)
      .eq("id", cliente.id)
      .select("*")
      .single();

    if (error) throw error;
    return data;
  }

  return cliente;
}

export async function fetchAportes(supabase, clienteId) {
  if (!clienteId) return [];

  let query = supabase.from("aportes").select("*").eq("cliente_id", clienteId);

  const { data, error } = await query.order("created_at", {
    ascending: false,
  });

  if (!error) return data ?? [];

  // Fallback sem ordenação (caso created_at não exista)
  const fallback = await supabase
    .from("aportes")
    .select("*")
    .eq("cliente_id", clienteId);

  if (fallback.error) throw fallback.error;
  return fallback.data ?? [];
}

export function displayName(cliente, user) {
  return (
    cliente?.nome ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    user?.email?.split("@")[0] ||
    "Cliente"
  );
}

export function summarizeAportes(aportes) {
  let totalAportado = 0;
  let patrimonio = 0;

  for (const a of aportes) {
    const qtd = Number(a.quantidade ?? 0);
    const preco = Number(a.preco_medio ?? a.preco ?? 0);
    const valor =
      a.valor_aportado != null
        ? Number(a.valor_aportado)
        : a.valor != null
          ? Number(a.valor)
          : qtd * preco;

    totalAportado += valor;
    patrimonio += qtd * preco || valor;
  }

  const rentabilidade =
    totalAportado > 0 ? ((patrimonio - totalAportado) / totalAportado) * 100 : 0;

  return { patrimonio, totalAportado, rentabilidade };
}

export function formatBRL(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value) || 0);
}

export function formatPercent(value) {
  const n = Number(value) || 0;
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(2)}%`;
}

export function formatTaxa(aporte) {
  const tipo = String(aporte.tipo_ativo || aporte.tipo || "").toLowerCase();
  const isRF =
    tipo.includes("renda fixa") ||
    tipo.includes("rf") ||
    tipo.includes("cdb") ||
    tipo.includes("tesouro") ||
    tipo.includes("lci") ||
    tipo.includes("lca");

  if (!isRF) return "—";

  const taxa = aporte.taxa_contratada ?? aporte.taxa;
  if (taxa == null || taxa === "") return "—";

  const n = Number(taxa);
  if (Number.isNaN(n)) return String(taxa);
  return `${n.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%`;
}
