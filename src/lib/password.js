import { randomBytes } from "crypto";

const PASSWORD_CHARS =
  "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%";

export function generateRandomPassword(length = 12) {
  const bytes = randomBytes(length);
  let password = "";

  for (let i = 0; i < length; i++) {
    password += PASSWORD_CHARS[bytes[i] % PASSWORD_CHARS.length];
  }

  return password;
}

export function isSenhaValida(senha) {
  return typeof senha === "string" && senha.length >= 8;
}
