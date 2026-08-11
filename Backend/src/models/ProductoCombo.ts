import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class ProductoCombo extends Model<
  InferAttributes<ProductoCombo>,
  InferCreationAttributes<ProductoCombo>
> {
  declare ComboProdID: number;
  declare ItemProdID: number;
}

ProductoCombo.init(
  {
    ComboProdID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },

    ItemProdID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },
  },
  {
    sequelize,
    tableName: "producto_combos",
    timestamps: false,
  }
);