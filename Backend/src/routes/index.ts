import { Router } from 'express';
import clienteRoutes from './cliente.routes.js';
import pedidoRoutes from './pedido.routes.js';
import productoRoutes from './producto.routes.js';
import { categoriaRouter, subCategoriaRouter, eventoRouter, estadoRouter } from './catalogo.routes.js';
// importar más rutas si existen (productos, catalogo, etc.)

const router = Router();

router.use('/clientes', clienteRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/categorias', categoriaRouter);
router.use('/subcategorias', subCategoriaRouter);
router.use('/eventos', eventoRouter);
router.use('/estados', estadoRouter);
router.use('/productos', productoRoutes);
// agregar más rutas si existen (productos, catalogo, etc.)
export default router;
