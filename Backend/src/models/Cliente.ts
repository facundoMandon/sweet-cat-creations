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
