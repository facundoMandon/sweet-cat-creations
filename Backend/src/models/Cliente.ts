import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

/**
 * Perfil de compra. La identidad (nombre, email, contraseña, rol) vive en
 * `usuarios`; acá sólo quedan los datos necesarios para entregar un pedido.
 */
export class Cliente extends Model<
  InferAttributes<Cliente>,
  InferCreationAttributes<Cliente>
> {
  declare ClienteID: CreationOptional<number>;
  declare UsuarioID: number;
  declare ClienteTelefono: string;
  declare ClienteDireccion: string;
  declare ClienteLat: number | null;
  declare ClienteLng: number | null;
  declare ClientePlaceID: string | null;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Cliente.init(
  {
    ClienteID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    UsuarioID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },

    ClienteTelefono: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: "",
    },

    ClienteDireccion: {
      type: DataTypes.STRING(250),
      allowNull: false,
      defaultValue: "",
    },

    ClienteLat: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    ClienteLng: {
      type: DataTypes.DECIMAL(10, 7),
      allowNull: true,
    },

    ClientePlaceID: {
      type: DataTypes.STRING(200),
      allowNull: true,
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
    tableName: "clientes",
    timestamps: true,
  }
);
