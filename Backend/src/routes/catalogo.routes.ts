import { Router } from 'express';
import * as catalogoCtrl from '../controllers/catalogo.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const requireAuth = authMiddleware;

/* ------------------------------- Categorías ------------------------------ */
export const categoriaRouter = Router();
categoriaRouter.get('/', catalogoCtrl.listCategorias);
categoriaRouter.get('/:id', catalogoCtrl.getCategoria);
categoriaRouter.post('/', requireAuth, requireAdmin, catalogoCtrl.createCategoria);
categoriaRouter.patch('/:id', requireAuth, requireAdmin, catalogoCtrl.updateCategoria);
categoriaRouter.delete('/:id', requireAuth, requireAdmin, catalogoCtrl.deleteCategoria);

/* ----------------------------- Subcategorías ----------------------------- */
export const subCategoriaRouter = Router();
subCategoriaRouter.get('/', catalogoCtrl.listSubCategorias);
subCategoriaRouter.get('/:id', catalogoCtrl.getSubCategoria);
subCategoriaRouter.post('/', requireAuth, requireAdmin, catalogoCtrl.createSubCategoria); 
subCategoriaRouter.patch('/:id', requireAuth, requireAdmin, catalogoCtrl.updateSubCategoria);
subCategoriaRouter.delete('/:id', requireAuth, requireAdmin, catalogoCtrl.deleteSubCategoria);

/* -------------------------------- Eventos -------------------------------- */
export const eventoRouter = Router();
eventoRouter.get('/', catalogoCtrl.listEventos);
eventoRouter.get('/:id', catalogoCtrl.getEvento);
eventoRouter.post('/', requireAuth, requireAdmin, catalogoCtrl.createEvento);
eventoRouter.patch('/:id', requireAuth, requireAdmin, catalogoCtrl.updateEvento);
eventoRouter.delete('/:id', requireAuth, requireAdmin, catalogoCtrl.deleteEvento);

/* --------------------- Estados (referencia, sólo lectura) ---------------- */
export const estadoRouter = Router();
estadoRouter.get('/productos', catalogoCtrl.listProdEstados);
estadoRouter.get('/pedidos', catalogoCtrl.listPedidoEstados);