import { Router } from 'express';
import authRoutes from './auth.routes.js';
import usuarioRoutes from './usuario.routes.js';
import clienteRoutes from './cliente.routes.js';
import pedidoRoutes from './pedido.routes.js';
import productoRoutes from './producto.routes.js';
import notificacionRoutes from './notificacion.routes.js';
import { categoriaRouter, subCategoriaRouter, eventoRouter, estadoRouter } from './catalogo.routes.js';
import { sequelize } from '../config/database.js';

const router = Router();

/** Health check: útil para Render y para saber si Neon responde. */
router.get('/health', async (_req, res) => {
  let db = 'ok';
  try {
    await sequelize.authenticate();
  } catch {
    db = 'error';
  }
  res.status(db === 'ok' ? 200 : 503).json({
    success: db === 'ok',
    service: 'blackcats-api',
    database: db,
    timestamp: new Date().toISOString(),
  });
});

router.use('/auth', authRoutes);
router.use('/usuarios', usuarioRoutes);
router.use('/clientes', clienteRoutes);
router.use('/pedidos', pedidoRoutes);
router.use('/categorias', categoriaRouter);
router.use('/subcategorias', subCategoriaRouter);
router.use('/eventos', eventoRouter);
router.use('/estados', estadoRouter);
router.use('/productos', productoRoutes);
router.use('/notificaciones', notificacionRoutes);

export default router;
