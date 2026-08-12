import { Router } from 'express';
import clienteRoutes from './cliente.routes';
import pedidoRoutes from './pedido.routes';
// importar más rutas si existen (productos, catalogo, etc.)

const router = Router();

router.use('/clientes', clienteRoutes);
router.use('/pedidos', pedidoRoutes);

export default router;
