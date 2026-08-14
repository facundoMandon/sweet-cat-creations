import { Router } from 'express';
import * as notiCtrl from '../controllers/notificacion.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = Router();

// Las notificaciones son una herramienta administrativa.
router.use(authMiddleware, requireAdmin);

router.get('/', notiCtrl.listNotificaciones);
router.post('/:id/reenviar', notiCtrl.reenviarNotificacion);

export default router;
