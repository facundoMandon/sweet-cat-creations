import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Categoria extends Model<
  InferAttributes<Categoria>,
  InferCreationAttributes<Categoria>
> {
  declare CatID: number;
  declare CatDescripcion: string;
}

Categoria.init(
  {
    CatID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    CatDescripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "categorias",
    timestamps: false,
  }
);