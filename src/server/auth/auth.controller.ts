import { supabaseAdmin } from "@/integrations/supabase/client.server";

import { hashPassword, randomId, sha256, signJwt, verifyJwt, verifyPassword } from "./crypto";
import { authMiddleware, HttpError, json, type AuthUser } from "./auth.middleware";

const ACCESS_TTL = 60 * 15; // 15 minutos
const REFRESH_TTL = 60 * 60 * 24 * 30; // 30 días
const REFRESH_COOKIE = "blackcats_refresh";

interface UsuarioRow {
  id: string;
  nombre: string;
  email: string;
  password_hash: string;
  rol: "admin" | "cliente";
  telefono: string | null;
  direccion: string | null;
  cliente_id: number | null;
  activo: boolean;
}

function publicUser(row: UsuarioRow) {
  return {
    id: row.id,
    nombre: row.nombre,
    email: row.email,
    rol: row.rol,
    telefono: row.telefono,
    direccion: row.direccion,
    clienteId: row.cliente_id,
  };
}

function secrets() {
  const access = process.env["JWT_ACCESS_SECRET"];
  const refresh = process.env["JWT_REFRESH_SECRET"];
  if (!access || !refresh) throw new HttpError(500, "Secretos JWT no configurados");
  return { access, refresh };
}

function refreshCookie(token: string | null): string {
  const base = `${REFRESH_COOKIE}=${token ?? ""}; Path=/; HttpOnly; SameSite=Lax; Secure`;
  return token ? `${base}; Max-Age=${REFRESH_TTL}` : `${base}; Max-Age=0`;
}

function readRefreshCookie(request: Request): string | null {
  const raw = request.headers.get("cookie");
  if (!raw) return null;
  for (const part of raw.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name === REFRESH_COOKIE) return rest.join("=") || null;
  }
  return null;
}

async function issueSession(row: UsuarioRow, request: Request) {
  const { access, refresh } = secrets();
  const jti = randomId();

  const accessToken = await signJwt(
    { sub: row.id, email: row.email, rol: row.rol, type: "access" },
    access,
    ACCESS_TTL,
  );
  const refreshToken = await signJwt(
    { sub: row.id, email: row.email, rol: row.rol, type: "refresh", jti },
    refresh,
    REFRESH_TTL,
  );

  await supabaseAdmin.from("refresh_tokens").insert({
    usuario_id: row.id,
    token_hash: await sha256(refreshToken),
    user_agent: request.headers.get("user-agent"),
    expires_at: new Date(Date.now() + REFRESH_TTL * 1000).toISOString(),
  });

  return json({ token: accessToken, expiresIn: ACCESS_TTL, usuario: publicUser(row) }, 200, {
    "set-cookie": refreshCookie(refreshToken),
  });
}

async function parseBody(request: Request): Promise<Record<string, unknown>> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    throw new HttpError(400, "Cuerpo de la petición inválido");
  }
}

function str(value: unknown, field: string, { min = 1, max = 200, optional = false } = {}) {
  if (value == null || value === "") {
    if (optional) return null;
    throw new HttpError(400, `El campo ${field} es obligatorio`);
  }
  if (typeof value !== "string") throw new HttpError(400, `El campo ${field} es inválido`);
  const trimmed = value.trim();
  if (trimmed.length < min || trimmed.length > max) {
    throw new HttpError(400, `El campo ${field} debe tener entre ${min} y ${max} caracteres`);
  }
  return trimmed;
}

/* ------------------------------- POST /register ------------------------------- */
export async function register(request: Request): Promise<Response> {
  const body = await parseBody(request);
  const nombre = str(body["nombre"], "nombre", { min: 2, max: 120 })!;
  const email = str(body["email"], "email", { max: 160 })!.toLowerCase();
  const password = str(body["password"], "contraseña", { min: 8, max: 128 })!;
  const telefono = str(body["telefono"], "teléfono", { optional: true, max: 40 });
  const direccion = str(body["direccion"], "dirección", { optional: true, max: 200 });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new HttpError(400, "El correo no tiene un formato válido");
  }

  const { data: existing } = await supabaseAdmin
    .from("usuarios")
    .select("id")
    .eq("email", email)
    .maybeSingle();
  if (existing) throw new HttpError(409, "Ese correo ya está registrado");

  // El rol nunca se toma del cliente: todo registro público es "cliente".
  const { data, error } = await supabaseAdmin
    .from("usuarios")
    .insert({
      nombre,
      email,
      password_hash: await hashPassword(password),
      rol: "cliente",
      telefono,
      direccion,
    })
    .select("*")
    .single();

  if (error || !data) throw new HttpError(500, "No se pudo crear la cuenta");
  return issueSession(data as UsuarioRow, request);
}

/* -------------------------------- POST /login -------------------------------- */
export async function login(request: Request): Promise<Response> {
  const body = await parseBody(request);
  const email = str(body["email"], "email", { max: 160 })!.toLowerCase();
  const password = str(body["password"], "contraseña", { max: 128 })!;

  const { data } = await supabaseAdmin
    .from("usuarios")
    .select("*")
    .eq("email", email)
    .maybeSingle();

  const row = data as UsuarioRow | null;
  // Mensaje genérico: no revelamos si el correo existe.
  const ok = row ? await verifyPassword(password, row.password_hash) : false;
  if (!row || !ok) throw new HttpError(401, "Correo o contraseña incorrectos");
  if (!row.activo) throw new HttpError(403, "La cuenta está desactivada");

  return issueSession(row, request);
}

/* ------------------------------- POST /refresh ------------------------------- */
export async function refresh(request: Request): Promise<Response> {
  const { refresh: refreshSecret } = secrets();
  const token = readRefreshCookie(request);
  if (!token) throw new HttpError(401, "No hay sesión para renovar");

  const payload = await verifyJwt(token, refreshSecret);
  if (!payload || payload.type !== "refresh") {
    throw new HttpError(401, "Refresh token inválido o expirado");
  }

  const tokenHash = await sha256(token);
  const { data: stored } = await supabaseAdmin
    .from("refresh_tokens")
    .select("id, revoked_at, expires_at")
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (!stored || stored.revoked_at || new Date(stored.expires_at).getTime() < Date.now()) {
    throw new HttpError(401, "Refresh token revocado o expirado");
  }

  const { data: usuario } = await supabaseAdmin
    .from("usuarios")
    .select("*")
    .eq("id", payload.sub)
    .maybeSingle();
  const row = usuario as UsuarioRow | null;
  if (!row || !row.activo) throw new HttpError(401, "La cuenta ya no está disponible");

  // Rotación: el refresh usado se revoca y se emite uno nuevo.
  await supabaseAdmin
    .from("refresh_tokens")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", stored.id);

  return issueSession(row, request);
}

/* ---------------------------------- GET /me ---------------------------------- */
export async function me(request: Request): Promise<Response> {
  const authUser: AuthUser = await authMiddleware(request);
  const { data } = await supabaseAdmin
    .from("usuarios")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();
  const row = data as UsuarioRow | null;
  if (!row || !row.activo) throw new HttpError(401, "Sesión inválida");
  return json(publicUser(row));
}

/* ------------------------------- POST /logout -------------------------------- */
export async function logout(request: Request): Promise<Response> {
  const token = readRefreshCookie(request);
  if (token) {
    await supabaseAdmin
      .from("refresh_tokens")
      .update({ revoked_at: new Date().toISOString() })
      .eq("token_hash", await sha256(token));
  }
  return json({ ok: true }, 200, { "set-cookie": refreshCookie(null) });
}
