import crypto from "node:crypto";

/**
 * Firma y verificación de JWT HS256, compatible con los access tokens que ya
 * emite la aplicación (mismo secreto JWT_ACCESS_SECRET y mismo payload).
 */

/** Roles con sesión. `visitante` nunca se firma: es la ausencia de token. */
export type RolToken = "admin" | "cliente";

export interface AccessTokenPayload {
  sub: string;
  email: string;
  rol: RolToken;
  type?: "access" | "refresh";
  exp: number;
  iat?: number;
  clienteId?: number;
}

export const ACCESS_TTL_SECONDS = 15 * 60;
export const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

function toBase64Url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(input: string): Buffer {
  return Buffer.from(input.replace(/-/g, "+").replace(/_/g, "/"), "base64");
}

function secretFor(type: "access" | "refresh"): string {
  const key = type === "access" ? "JWT_ACCESS_SECRET" : "JWT_REFRESH_SECRET";
  const secret = process.env[key] ?? process.env["JWT_ACCESS_SECRET"];
  if (!secret) throw new Error(`${key} no está configurado`);
  return secret;
}

export function signToken(
  payload: Omit<AccessTokenPayload, "exp" | "iat" | "type">,
  type: "access" | "refresh" = "access"
): { token: string; expiresIn: number } {
  const expiresIn = type === "access" ? ACCESS_TTL_SECONDS : REFRESH_TTL_SECONDS;
  const iat = Math.floor(Date.now() / 1000);
  const body: AccessTokenPayload = {
    ...payload,
    type,
    iat,
    exp: iat + expiresIn,
  };
  const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const claims = toBase64Url(JSON.stringify(body));
  const signature = crypto
    .createHmac("sha256", secretFor(type))
    .update(`${header}.${claims}`)
    .digest();
  return { token: `${header}.${claims}.${toBase64Url(signature)}`, expiresIn };
}

function verify(
  token: string,
  type: "access" | "refresh"
): AccessTokenPayload | null {
  let secret: string;
  try {
    secret = secretFor(type);
  } catch (err) {
    console.error(err);
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts as [string, string, string];

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${header}.${body}`)
    .digest();
  const received = fromBase64Url(signature);
  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(
      fromBase64Url(body).toString("utf8")
    ) as AccessTokenPayload;
    if (typeof payload.exp !== "number" || payload.exp * 1000 < Date.now()) {
      return null;
    }
    if ((payload.type ?? "access") !== type) return null;
    return payload;
  } catch {
    return null;
  }
}

export function verifyAccessToken(token: string): AccessTokenPayload | null {
  return verify(token, "access");
}

export function verifyRefreshToken(token: string): AccessTokenPayload | null {
  return verify(token, "refresh");
}
