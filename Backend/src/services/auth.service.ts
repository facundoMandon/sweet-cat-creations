import { Cliente, Usuario } from "../models/index.js";
import { badRequest, unauthorized } from "../utils/AppError.js";
import { requiredEmail, requiredString } from "../utils/validation.js";
import { verifyPassword } from "../utils/password.js";
import {
  signToken,
  verifyRefreshToken,
  ACCESS_TTL_SECONDS,
  REFRESH_TTL_SECONDS,
} from "../utils/jwt.js";
import {
  createUsuario,
  findByEmail,
  getUsuarioEntity,
  publicUsuario,
} from "./usuario.service.js";

export interface SesionEmitida {
  token: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
  usuario: ReturnType<typeof publicUsuario>;
}

async function emitirSesion(usuario: Usuario): Promise<SesionEmitida> {
  const perfil = await Cliente.findOne({ where: { UsuarioID: usuario.UsuarioID } });
  const claims = {
    sub: String(usuario.UsuarioID),
    email: usuario.UsuarioEmail,
    rol: usuario.Rol,
    ...(perfil ? { clienteId: perfil.ClienteID } : {}),
  };
  const access = signToken(claims, "access");
  const refresh = signToken(claims, "refresh");
  return {
    token: access.token,
    refreshToken: refresh.token,
    expiresIn: ACCESS_TTL_SECONDS,
    refreshExpiresIn: REFRESH_TTL_SECONDS,
    usuario: publicUsuario(usuario, perfil),
  };
}

/** Registro público: siempre crea un usuario con rol cliente + su perfil. */
export async function register(body: Record<string, unknown>): Promise<SesionEmitida> {
  await createUsuario(body, { forzarRolCliente: true });
  const usuario = await findByEmail(String(body["email"] ?? body["UsuarioEmail"]));
  if (!usuario) throw badRequest("No se pudo crear el usuario");
  return emitirSesion(usuario);
}

/** Login: verifica email, contraseña y que la cuenta esté activa. */
export async function login(body: Record<string, unknown>): Promise<SesionEmitida> {
  const email = requiredEmail(body["email"]);
  const password = requiredString(body["password"], "password", 128);

  const usuario = await findByEmail(email);
  if (!usuario || !verifyPassword(password, usuario.UsuarioContraseniaHash)) {
    throw unauthorized("Email o contraseña incorrectos");
  }
  if (!usuario.Activo) throw unauthorized("La cuenta está desactivada");

  return emitirSesion(usuario);
}

/** Renueva el access token a partir de un refresh token válido. */
export async function refresh(token: string | undefined): Promise<SesionEmitida> {
  if (!token) throw unauthorized("No hay sesión para renovar");
  const payload = verifyRefreshToken(token);
  if (!payload) throw unauthorized("Sesión expirada, iniciá sesión de nuevo");

  const usuario = await getUsuarioEntity(Number(payload.sub));
  if (!usuario.Activo) throw unauthorized("La cuenta está desactivada");
  // El rol se relee de la base: nunca se confía en el rol del token viejo.
  return emitirSesion(usuario);
}

/** Datos del usuario del access token (revalidados contra la base). */
export async function me(usuarioId: number) {
  const usuario = await getUsuarioEntity(usuarioId);
  if (!usuario.Activo) throw unauthorized("La cuenta está desactivada");
  return publicUsuario(usuario);
}
