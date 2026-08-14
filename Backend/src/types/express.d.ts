import type { AccessTokenPayload } from "../utils/jwt.js";

declare global {
  namespace Express {
    interface Request {
      /**
       * Usuario del request. `authMiddleware` exige sesión;
       * `optionalAuth` deja rol "visitante" cuando no hay token.
       */
      user?: {
        id: string;
        email: string;
        rol: "admin" | "cliente" | "visitante";
        clienteId?: number | undefined;
        raw?: AccessTokenPayload | undefined;
      };
    }
  }
}

export {};
