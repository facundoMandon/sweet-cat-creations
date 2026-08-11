//Configuración de express
//Express es el encargado de recibir las peticiones HTTP y devolver las respuestas HTTP. Es el encargado de manejar las rutas, 
//los middlewares y los controladores.
import express from "express";

const app = express();

app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
  });
});

export default app;