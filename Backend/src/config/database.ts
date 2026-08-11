// Se encarga de la configuración de la base de datos y la conexión a la misma

import { Sequelize } from "sequelize";

export const sequelize = new Sequelize(
  process.env.DATABASE_URL!,
  {
    dialect: "postgres",
    logging: false,
  }
);