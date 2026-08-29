import { generateRandomPassword } from "@/lib/password";

async function findAuthUserByEmail(supabase, email) {
  const normalized = String(email || "").toLowerCase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });

    if (error) throw error;

    const match = data.users.find(
      (user) => user.email?.toLowerCase() === normalized
    );
    if (match) return match;

    if (data.users.length < 100) break;
    page += 1;
  }

  return null;
}

export async function salvarSenhaAcesso(supabase, clienteId, senha) {
  const { error } = await supabase
    .from("clientes")
    .update({ senha_acesso: senha })
    .eq("id", clienteId);

  if (error && !String(error.message).includes("senha_acesso")) {
    throw error;
  }
}

/**
 * Cria usuário Auth ou redefine senha temporária (admin).
 * Se o e-mail já existir no Auth, vincula e atualiza a senha.
 */
export async function provisionarSenhaCliente(
  supabase,
  { email, nome, userId = null }
) {
  const senhaTemporaria = generateRandomPassword();
  const metadata = {
    must_change_password: true,
    full_name: nome || email.split("@")[0],
  };

  let resolvedUserId = userId;

  if (!resolvedUserId) {
    const existing = await findAuthUserByEmail(supabase, email);
    if (existing) resolvedUserId = existing.id;
  }

  if (resolvedUserId) {
    const { error } = await supabase.auth.admin.updateUserById(resolvedUserId, {
      password: senhaTemporaria,
      user_metadata: metadata,
    });

    if (error) throw error;
    return { userId: resolvedUserId, senhaTemporaria };
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password: senhaTemporaria,
    email_confirm: true,
    user_metadata: metadata,
  });

  if (error) {
    const msg = error.message?.toLowerCase() ?? "";
    if (msg.includes("already been registered") || msg.includes("already exists")) {
      const existing = await findAuthUserByEmail(supabase, email);
      if (!existing) throw error;

      const { error: updateError } = await supabase.auth.admin.updateUserById(
        existing.id,
        { password: senhaTemporaria, user_metadata: metadata }
      );
      if (updateError) throw updateError;
      return { userId: existing.id, senhaTemporaria };
    }

    throw error;
  }

  return { userId: data.user.id, senhaTemporaria };
}
