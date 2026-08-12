import { Router } from 'express';
import * as pedidoCtrl from '../controllers/pedido.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', requireAuth, pedidoCtrl.createPedido);
router.get('/:id', requireAuth, pedidoCtrl.getPedido);
router.patch('/:id/status', requireAuth, pedidoCtrl.changeStatus);

export default router;
