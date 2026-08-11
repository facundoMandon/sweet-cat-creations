import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class ProdEstado extends Model<
  InferAttributes<ProdEstado>,
  InferCreationAttributes<ProdEstado>
> {
  declare ProdEstadoID: number;
  declare ProdEstadoDescripcion: string;
}

ProdEstado.init(
  {
    ProdEstadoID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    ProdEstadoDescripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "prod_estados",
    timestamps: false,
  }
);