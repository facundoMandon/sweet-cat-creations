import express from "express";
import cors from 'cors';
import apiRouter from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';

const app = express();

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRouter);

// 404 handler (debe ir después de las rutas)
app.use(notFoundHandler);

// error handler global al final
app.use(errorHandler);

export default app;
