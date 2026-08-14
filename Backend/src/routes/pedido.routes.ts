import { Router } from 'express';
import * as pedidoCtrl from '../controllers/pedido.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdmin, requireCliente } from '../middlewares/role.middleware.js';

const router = Router();

// Todo /pedidos exige sesión: un visitante no puede comprar ni ver pedidos.
router.use(authMiddleware, requireCliente);

// Métricas del dashboard (antes de "/:id" para que no lo capture la ruta con parámetro).
router.get('/resumen', requireAdmin, pedidoCtrl.resumenPedidos);

router.get('/', pedidoCtrl.listPedidos);
router.post('/', pedidoCtrl.createPedido);
router.get('/:id', pedidoCtrl.getPedido);

// Modificación de renglones y/o fecha (sólo pedidos pendientes).
router.patch('/:id', pedidoCtrl.updatePedido);
router.put('/:id', pedidoCtrl.updatePedido);

router.patch('/:id/status', pedidoCtrl.cambiarEstado);
router.patch('/:id/estado', pedidoCtrl.cambiarEstado);
router.patch('/:id/reprogramar', pedidoCtrl.reprogramarPedido);

// Borrado físico: sólo admin y sólo pedidos cancelados.
router.delete('/:id', requireAdmin, pedidoCtrl.deletePedido);

export default router;
