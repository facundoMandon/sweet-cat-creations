import express from "express";
import cors from 'cors';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const app = express();

// Orígenes permitidos: producción, previews de Lovable y desarrollo local.
const allowedOrigins = [
  'https://blackcats.lovable.app',
  'http://localhost:8080',
  'http://localhost:5173',
];

const originAllowed = (origin: string) =>
  allowedOrigins.includes(origin) || /\.lovable\.app$/.test(new URL(origin).hostname);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / server-to-server
      try {
        return callback(null, originAllowed(origin));
      } catch {
        return callback(null, false);
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

// 404 handler (debe ir después de las rutas)
app.use(notFoundHandler);

// error handler global al final
app.use(errorHandler);

export default app;
