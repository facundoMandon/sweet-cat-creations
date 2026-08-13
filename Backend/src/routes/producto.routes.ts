import { Router } from 'express';
import * as productoCtrl from '../controllers/producto.controller.js';
import { authMiddleware, optionalAuth } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const requireAuth = authMiddleware;
const router = Router();

// Catálogo público (activos y sin stock). Auth opcional: no es obligatorio
// estar logueado para navegar, pero si hay token se respeta igual.
router.get('/catalogo', optionalAuth, productoCtrl.listCatalogo);
router.get('/catalogo/:id', optionalAuth, productoCtrl.getCatalogoProducto);

// Administración (incluye productos inactivos).
router.get('/', requireAuth, requireAdmin, productoCtrl.listProductos);
router.get('/:id', requireAuth, requireAdmin, productoCtrl.getProducto);
router.post('/', requireAuth, requireAdmin, productoCtrl.createProducto);
router.patch('/:id', requireAuth, requireAdmin, productoCtrl.updateProducto);
router.patch('/:id/desactivar', requireAuth, requireAdmin, productoCtrl.desactivarProducto);
router.delete('/:id', requireAuth, requireAdmin, productoCtrl.deleteProducto);

export default router;