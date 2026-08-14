import { Router } from 'express';
import * as clienteCtrl from '../controllers/cliente.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = Router();

// El alta pública de clientes se hace por /api/auth/register.
router.post('/', authMiddleware, requireAdmin, clienteCtrl.createCliente);
router.get('/', authMiddleware, requireAdmin, clienteCtrl.listClientes);
router.get('/:id', authMiddleware, clienteCtrl.getCliente);
router.patch('/:id', authMiddleware, clienteCtrl.updateCliente);
router.delete('/:id', authMiddleware, requireAdmin, clienteCtrl.deleteCliente);

export default router;
