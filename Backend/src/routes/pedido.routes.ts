import { Router } from 'express';
import * as pedidoCtrl from '../controllers/pedido.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';

const requireAuth = authMiddleware;

const router = Router();

router.post('/', requireAuth, pedidoCtrl.createPedido);
router.get('/:id', requireAuth, pedidoCtrl.getPedido);
router.patch('/:id/status', requireAuth, pedidoCtrl.cambiarEstado);

export default router;
