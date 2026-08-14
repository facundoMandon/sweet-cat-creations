import { Router } from "express";
import * as authCtrl from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Públicas: cualquier visitante puede registrarse o iniciar sesión.
router.post("/register", authCtrl.register);
router.post("/login", authCtrl.login);
router.post("/refresh", authCtrl.refresh);
router.post("/logout", authCtrl.logout);

// Requiere access token válido.
router.get("/me", authMiddleware, authCtrl.me);

export default router;
