import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Evento extends Model<
  InferAttributes<Evento>,
  InferCreationAttributes<Evento>
> {
  declare EventoID: number;
  declare EventoNombre: string;
}

Evento.init(
  {
    EventoID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    EventoNombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "eventos",
    timestamps: false,
  }
);