import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class PedidoEstado extends Model<
  InferAttributes<PedidoEstado>,
  InferCreationAttributes<PedidoEstado>
> {
  declare PedidoEstadoID: number;
  declare PedidoEstadoDescripcion: string;
}

PedidoEstado.init(
  {
    PedidoEstadoID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    PedidoEstadoDescripcion: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "pedido_estados",
    timestamps: false,
  }
);