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

/* ------------------------------------------------------------------ */
/* Inicio de sesión con Google                                         */
/* ------------------------------------------------------------------ */

/**
 * Login/registro con una cuenta de Google.
 * - Si el email ya existe, se vincula automáticamente (puede usar ambos métodos).
 * - Si no existe, se crea un usuario con rol cliente + su perfil vacío
 *   (teléfono y dirección se completan luego en el checkout).
 * El rol nunca viene de Google: se lee/asigna en la base.
 */
export async function loginConGoogle(idToken: unknown): Promise<SesionEmitida> {
  const perfil = await verifyGoogleIdToken(idToken);

  let usuario = await Usuario.findOne({ where: { GoogleSub: perfil.sub } });
  if (!usuario) usuario = await findByEmail(perfil.email);

  if (usuario) {
    if (!usuario.Activo) throw unauthorized("La cuenta está desactivada");
    const cambios: Record<string, unknown> = { EmailVerificado: true };
    if (!usuario.GoogleSub) cambios["GoogleSub"] = perfil.sub;
    if (!usuario.AvatarURL && perfil.avatar) cambios["AvatarURL"] = perfil.avatar;
    cambios["AuthProveedor"] = usuario.UsuarioContraseniaHash ? "ambos" : "google";
    await usuario.update(cambios as never);
    return emitirSesion(usuario);
  }

  const creado = await sequelize.transaction(async (t) => {
    const nuevo = await Usuario.create(
      {
        UsuarioNombre: perfil.nombre ?? perfil.email.split("@")[0]!,
        UsuarioApellido: perfil.apellido,
        UsuarioEmail: perfil.email,
        UsuarioContraseniaHash: null,
        Rol: "cliente",
        AuthProveedor: "google",
        GoogleSub: perfil.sub,
        EmailVerificado: true,
        AvatarURL: perfil.avatar,
      } as never,
      { transaction: t }
    );
    await Cliente.create(
      {
        UsuarioID: nuevo.UsuarioID,
        ClienteTelefono: "",
        ClienteDireccion: "",
      } as never,
      { transaction: t }
    );
    return nuevo;
  });

  return emitirSesion(creado);
}

/* ------------------------------------------------------------------ */
/* Recupero de contraseña                                              */
/* ------------------------------------------------------------------ */

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora
const RESET_MIN_INTERVAL_MS = 60 * 1000;
const intentos = new Map<string, number>();

function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Pide un email de recupero. Siempre resuelve igual (no revela si el email
 * existe) y limita un pedido por minuto por email.
 */
export async function solicitarReset(body: Record<string, unknown>): Promise<void> {
  const email = requiredEmail(body["email"]).toLowerCase();

  const ultimo = intentos.get(email) ?? 0;
  if (Date.now() - ultimo < RESET_MIN_INTERVAL_MS) return;
  intentos.set(email, Date.now());

  const usuario = await findByEmail(email);
  if (!usuario || !usuario.Activo) return;

  const token = crypto.randomBytes(32).toString("base64url");
  await PasswordReset.create({
    UsuarioID: usuario.UsuarioID,
    TokenHash: hashToken(token),
    ExpiraEn: new Date(Date.now() + RESET_TTL_MS),
  } as never);

  const link = `${APP_BASE_URL}/restablecer?token=${encodeURIComponent(token)}`;
  const mail = passwordResetTemplate(usuario.UsuarioNombre, link);
  await sendMail({ ...mail, to: usuario.UsuarioEmail });
}

/** Consume el token y fija la nueva contraseña. */
export async function restablecerPassword(
  body: Record<string, unknown>
): Promise<void> {
  const token = requiredString(body["token"], "token", 200);
  const password = requiredString(body["password"], "password", 128);
  if (password.length < 6) {
    throw badRequest("La contraseña debe tener al menos 6 caracteres");
  }

  const registro = await PasswordReset.findOne({
    where: { TokenHash: hashToken(token) },
  });
  if (!registro || registro.UsadoEn || registro.ExpiraEn.getTime() < Date.now()) {
    throw badRequest("El enlace no es válido o ya venció. Pedí uno nuevo.");
  }

  const usuario = await getUsuarioEntity(registro.UsuarioID);
  if (!usuario.Activo) throw unauthorized("La cuenta está desactivada");

  await sequelize.transaction(async (t) => {
    await usuario.update(
      {
        UsuarioContraseniaHash: hashPassword(password),
        AuthProveedor: usuario.GoogleSub ? "ambos" : "local",
      } as never,
      { transaction: t }
    );
    await registro.update({ UsadoEn: new Date() } as never, { transaction: t });
    // Invalida cualquier otro pedido de recupero pendiente.
    await PasswordReset.update(
      { UsadoEn: new Date() } as never,
      {
        where: { UsuarioID: usuario.UsuarioID, UsadoEn: null },
        transaction: t,
      }
    );
  });
}
