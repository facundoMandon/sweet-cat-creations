import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class ProductoPedido extends Model<
  InferAttributes<ProductoPedido>,
  InferCreationAttributes<ProductoPedido>
> {
  declare ProdPedidoID: number;
  declare PedidoID: number;
  declare ProdID: number;
  declare Cantidad: number;
  declare ProdPrecioUnitario: number;
  declare TextoPersonalizado: string | null;
}

ProductoPedido.init(
  {
    ProdPedidoID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    PedidoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ProdID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    Cantidad: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },

    ProdPrecioUnitario: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false,
    },

    TextoPersonalizado: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: "producto_pedidos",
    timestamps: false,
  }
);