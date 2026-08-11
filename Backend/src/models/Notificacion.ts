import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Notificacion extends Model<
  InferAttributes<Notificacion>,
  InferCreationAttributes<Notificacion>
> {
  declare NotifID: number;
  declare NotiEstado: "enviado" | "fallido" | "pendiente";
  declare NotiFecha: Date;
  declare PedidoID: number;
}

Notificacion.init(
  {
    NotifID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    NotiEstado: {
      type: DataTypes.ENUM(
        "enviado",
        "fallido",
        "pendiente"
      ),
      allowNull: false,
    },

    NotiFecha: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    PedidoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    sequelize,
    tableName: "notificaciones",
    timestamps: false,
  }
);