// Arranque real del backend.
// Este archivo se encarga de iniciar el servidor y conectarse a la base de datos.

import "dotenv/config";
import app from "./app.js";
import { sequelize } from "./config/database.js";
import "./models/index.js";

const PORT = process.env.PORT || 3001;

async function start() {
  try {
    await sequelize.authenticate();

    console.log("Conectado a Neon PostgreSQL");

    await sequelize.sync();

    console.log("Tablas sincronizadas");

    app.listen(PORT, () => {
      console.log(`Backend ejecutándose en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Error iniciando backend:", error);
    process.exit(1);
  }
}

start();