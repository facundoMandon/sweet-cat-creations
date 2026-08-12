import type { AccessTokenPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      /** Usuario autenticado (lo setea authMiddleware). */
      user?: {
        id: string;
        email: string;
        rol: "admin" | "cliente";
        clienteId?: number | undefined;
        raw: AccessTokenPayload;
      };
    }
  }
}

export {};
