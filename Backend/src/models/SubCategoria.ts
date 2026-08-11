import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class SubCategoria extends Model<
  InferAttributes<SubCategoria>,
  InferCreationAttributes<SubCategoria>
> {
  declare SubCatID: number;
  declare SubCatDescripcion: string;
  declare CatID: number;
}

SubCategoria.init(
  {
    SubCatID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    SubCatDescripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },

    CatID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "subcategorias",
    timestamps: false,
  }
);