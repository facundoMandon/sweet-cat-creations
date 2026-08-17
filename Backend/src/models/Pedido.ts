import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Pedido extends Model<
  InferAttributes<Pedido>,
  InferCreationAttributes<Pedido>
> {
  declare PedidoID: number;
  declare PedidoFechaEntrega: Date;
  declare PedidoEstadoID: number;
  declare ClienteID: number;
  declare PedidoMontoTotal: number;
  declare PedidoDireccion: string | null;
  declare PedidoLat: number | null;
  declare PedidoLng: number | null;
  declare PedidoPlaceID: string | null;
  declare PedidoReferencias: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Pedido.init(
  {
    PedidoID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    PedidoFechaEntrega: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    PedidoEstadoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    ClienteID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    PedidoMontoTotal: {
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
    tableName: "pedidos",
    timestamps: true,
  }
);