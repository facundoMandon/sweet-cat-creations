import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler.js';
import { forbidden } from '../utils/AppError.js';

const router = Router();

/**
 * Carga inicial de datos (admin, cliente demo y productos).
 * Sólo funciona si la variable de entorno SEED_TOKEN está definida y el
 * request la envía en el header `x-seed-token`. Es idempotente.
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const esperado = process.env['SEED_TOKEN'];
    if (!esperado) throw forbidden('El seed por API está deshabilitado');
    if (req.headers['x-seed-token'] !== esperado) throw forbidden();

    const { runSeed } = await import('../scripts/seed.js');
    res.json({ success: true, data: await runSeed() });
  })
);

export default router;
