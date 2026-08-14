import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import clienteRoutes from './cliente.routes.js';
import pedidoRoutes from './pedido.routes.js';
import productoRoutes from './producto.routes.js';
import { categoriaRouter, subCategoriaRouter, eventoRouter, estadoRouter } from './catalogo.routes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/categorias', categoriaRouter);
router.use('/subcategorias', subCategoriaRouter);
router.use('/eventos', eventoRouter);
router.use('/estados', estadoRouter);
router.use('/productos', productoRoutes);

export default router;
