export function mustChangePassword(user) {
  return user?.user_metadata?.must_change_password === true;
}

/** Perfil de suitability válido (evita loop com string vazia). */
export function hasPerfilSuitability(perfil) {
  return Boolean(String(perfil ?? "").trim());
}
