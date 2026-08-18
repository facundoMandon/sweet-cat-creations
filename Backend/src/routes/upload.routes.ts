import { Router } from 'express';
import { firmarSubida } from '../controllers/upload.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
import { requireAdmin } from '../middlewares/role.middleware.js';

const router = Router();

router.post('/firma', authMiddleware, requireAdmin, firmarSubida);

export default router;
