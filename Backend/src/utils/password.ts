import crypto from "node:crypto";

/**
 * Hashing PBKDF2-SHA256 con el mismo formato que ya usa la app:
 * `pbkdf2$<iteraciones>$<saltB64>$<hashB64>`
 * (así las cuentas creadas previamente siguen funcionando).
 */

const ITERATIONS = 100_000;
const KEYLEN = 32;

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16);
  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEYLEN, "sha256");
  return `pbkdf2$${ITERATIONS}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const parts = stored.split("$");
  if (parts.length !== 4 || parts[0] !== "pbkdf2") return false;
  const iterations = Number(parts[1]);
  if (!Number.isFinite(iterations) || iterations <= 0) return false;
  const salt = Buffer.from(parts[2]!, "base64");
  const expected = Buffer.from(parts[3]!, "base64");
  const hash = crypto.pbkdf2Sync(password, salt, iterations, expected.length, "sha256");
  return hash.length === expected.length && crypto.timingSafeEqual(hash, expected);
}
