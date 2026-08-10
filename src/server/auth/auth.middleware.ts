import { verifyJwt, type JwtPayload } from "./crypto";

export interface AuthUser {
  id: string;
  email: string;
  rol: "admin" | "cliente";
}

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

export function json(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });
}

export function errorResponse(error: unknown): Response {
  if (error instanceof HttpError) return json({ message: error.message }, error.status);
  console.error("[auth]", error);
  return json({ message: "Error interno del servidor" }, 500);
}

/**
 * authMiddleware: valida el header `Authorization: Bearer <access token>`.
 * Devuelve el usuario del token o lanza HttpError 401.
 */
export async function authMiddleware(request: Request): Promise<AuthUser> {
  const header = request.headers.get("authorization") ?? "";
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    throw new HttpError(401, "Token no provisto");
  }
  const secret = process.env["JWT_ACCESS_SECRET"];
  if (!secret) throw new HttpError(500, "JWT_ACCESS_SECRET no configurado");

  const payload: JwtPayload | null = await verifyJwt(token, secret);
  if (!payload || payload.type !== "access") {
    throw new HttpError(401, "Token inválido o expirado");
  }
  return { id: payload.sub, email: payload.email, rol: payload.rol };
}

/** requireAdmin: exige un usuario autenticado con rol admin. */
export async function requireAdmin(request: Request): Promise<AuthUser> {
  const user = await authMiddleware(request);
  if (user.rol !== "admin") throw new HttpError(403, "Requiere rol de administrador");
  return user;
}
