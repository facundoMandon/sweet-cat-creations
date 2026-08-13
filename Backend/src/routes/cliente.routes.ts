import { Router } from 'express';
import * as clienteCtrl from '../controllers/cliente.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const requireAuth = authMiddleware;
const router = Router();

router.post('/', clienteCtrl.createCliente);
router.get('/', requireAuth, clienteCtrl.listClientes);
router.get('/:id', requireAuth, clienteCtrl.getCliente);
router.patch('/:id', requireAuth, clienteCtrl.updateCliente);
router.delete('/:id', requireAuth, requireAdmin, clienteCtrl.deleteCliente);

export default router;
