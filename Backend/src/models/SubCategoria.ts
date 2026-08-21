import { Model, DataTypes, InferAttributes, InferCreationAttributes } from "sequelize";
import { sequelize } from "../config/database.js";

/**
 * Subcategoría con numeración por categoría.
 * La identidad es el par (CatID, SubCatID): el número reinicia en 1 dentro de
 * cada categoría, por lo que NO hay autoincremento global.
 */
export class SubCategoria extends Model<InferAttributes<SubCategoria>, InferCreationAttributes<SubCategoria>> {
  declare CatID: number;
  declare SubCatID: number;
  declare SubCatDescripcion: string;
}

SubCategoria.init(
  {
    CatID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
    },

    SubCatID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: false,
    },

    SubCatDescripcion: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "subcategorias",
    timestamps: false,
    indexes: [
      {
        name: "subcategorias_cat_descripcion_unique",
        unique: true,
        fields: ["CatID", "SubCatDescripcion"],
      },
    ],
  },
);
