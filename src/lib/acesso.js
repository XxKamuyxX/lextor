/**
 * Controle de acesso à área de membros.
 * Apenas e-mails cadastrados em `clientes` com acesso_liberado = true.
 */

export function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

export function isAcessoLiberado(cliente) {
  if (!cliente) return false;
  return cliente.acesso_liberado === true;
}

export async function fetchClienteByEmail(supabase, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .eq("email", normalized)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function verificarAcessoPorEmail(supabase, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  const { data: viaRpc, error: rpcError } = await supabase.rpc(
    "verificar_acesso_membro",
    { p_email: normalized }
  );

  if (!rpcError) return viaRpc === true;

  const cliente = await fetchClienteByEmail(supabase, normalized);
  return isAcessoLiberado(cliente);
}

/**
 * Vincula a sessão auth a um cliente já cadastrado (não cria registro novo).
 */
export async function linkClienteSession(supabase, user) {
  if (!user) return null;

  let cliente = null;

  const byUser = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  if (byUser.data) {
    cliente = byUser.data;
  } else if (user.email) {
    cliente = await fetchClienteByEmail(supabase, user.email);
  }

  if (!isAcessoLiberado(cliente)) return null;

  if (!cliente.user_id) {
    await supabase
      .from("clientes")
      .update({ user_id: user.id })
      .eq("id", cliente.id);
    cliente = { ...cliente, user_id: user.id };
  }

  return cliente;
}

export const MENSAGEM_ACESSO_NEGADO =
  "Este e-mail não possui acesso à área de membros. Entre em contato com a consultoria para contratar o plano.";
