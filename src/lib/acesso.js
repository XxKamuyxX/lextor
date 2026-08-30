/**
 * Controle de acesso à área de membros.
 * Apenas e-mails cadastrados em `clientes` com acesso_liberado = true.
 */

export function normalizeEmail(email) {
  return String(email || "")
    .replace(/\s+/g, "")
    .trim()
    .toLowerCase();
}

export function isAcessoLiberado(cliente) {
  if (!cliente) return false;
  const valor = cliente.acesso_liberado;
  return valor === true || valor === "true" || valor === "t" || valor === 1;
}

export async function fetchClienteByEmail(supabase, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return null;

  const { data, error } = await supabase
    .from("clientes")
    .select("*")
    .ilike("email", normalized)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Resolve o cliente da sessão (user_id + e-mail), preferindo registro com perfil.
 */
export async function resolveClienteSession(supabase, user) {
  if (!user) return null;

  let byUser = null;
  const userQuery = await supabase
    .from("clientes")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();
  if (userQuery.data) byUser = userQuery.data;

  let byEmail = null;
  if (user.email) {
    byEmail = await fetchClienteByEmail(supabase, user.email);
  }

  if (byUser && byEmail && byUser.id !== byEmail.id) {
    const userTemPerfil = String(byUser.perfil_suitability ?? "").trim();
    const emailTemPerfil = String(byEmail.perfil_suitability ?? "").trim();
    if (!userTemPerfil && emailTemPerfil) return byEmail;
    if (userTemPerfil && !emailTemPerfil) return byUser;
  }

  return byUser ?? byEmail;
}

export async function verificarAcessoPorEmail(supabase, email) {
  const normalized = normalizeEmail(email);
  if (!normalized) return false;

  const { data: viaRpc, error: rpcError } = await supabase.rpc(
    "verificar_acesso_membro",
    { p_email: normalized }
  );

  if (!rpcError && viaRpc === true) return true;

  const cliente = await fetchClienteByEmail(supabase, normalized);
  return isAcessoLiberado(cliente);
}

/**
 * Vincula a sessão auth a um cliente já cadastrado (não cria registro novo).
 * Use service role (admin) para garantir leitura/gravação sem depender de RLS.
 */
export async function linkClienteSession(supabase, user) {
  if (!user) return null;

  const cliente = await resolveClienteSession(supabase, user);

  if (!isAcessoLiberado(cliente)) return null;

  if (!cliente.user_id || cliente.user_id !== user.id) {
    const { error: linkError } = await supabase
      .from("clientes")
      .update({ user_id: user.id })
      .eq("id", cliente.id);

    if (linkError) throw linkError;
    cliente.user_id = user.id;
  }

  return cliente;
}

export const MENSAGEM_ACESSO_NEGADO =
  "Este e-mail não possui acesso à área de membros. Entre em contato com a consultoria para contratar o plano.";
