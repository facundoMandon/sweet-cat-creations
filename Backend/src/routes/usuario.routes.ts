import { Router } from "express";
import * as usuarioCtrl from "../controllers/usuario.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { requireAdmin } from "../middlewares/role.middleware.js";

const router = Router();

// Listado y alta: sólo administradores.
router.get("/", authMiddleware, requireAdmin, usuarioCtrl.listUsuarios);
router.post("/", authMiddleware, requireAdmin, usuarioCtrl.createUsuario);

// Detalle/edición: el propio usuario o un admin (validado en el servicio).
router.get("/:id", authMiddleware, usuarioCtrl.getUsuario);
router.patch("/:id", authMiddleware, usuarioCtrl.updateUsuario);
router.patch("/:id/password", authMiddleware, usuarioCtrl.cambiarPassword);

router.delete("/:id", authMiddleware, requireAdmin, usuarioCtrl.deleteUsuario);

export default router;
