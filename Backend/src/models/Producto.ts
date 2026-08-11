import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Producto extends Model<
  InferAttributes<Producto>,
  InferCreationAttributes<Producto>
> {
  declare ProdID: number;
  declare ProdNombre: string;
  declare ProdDescripcion: string | null;
  declare SubCatID: number;
  declare ProdEstadoID: number;
  declare ProdImg: string | null;
  declare EsCombo: boolean;
  declare ProdPrecio: number;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Producto.init(
  {
    ProdID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    ProdNombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    ProdDescripcion: {
      type: DataTypes.TEXT,
      allowNull: true,
    },

    SubCatID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ProdEstadoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ProdImg: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },

    EsCombo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },

    ProdPrecio: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },

    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    tableName: "productos",
    timestamps: true,
  }
);