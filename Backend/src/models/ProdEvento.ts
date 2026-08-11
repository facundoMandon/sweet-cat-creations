import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class ProdEvento extends Model<
  InferAttributes<ProdEvento>,
  InferCreationAttributes<ProdEvento>
> {
  declare ProdID: number;
  declare EventoID: number;
}

ProdEvento.init(
  {
    ProdID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },

    EventoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "prod_eventos",
    timestamps: false,
  }
);