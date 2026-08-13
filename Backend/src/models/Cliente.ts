import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Cliente extends Model<
  InferAttributes<Cliente>,
  InferCreationAttributes<Cliente>
> {
  declare ClienteID: number;
  declare ClienteNombre: string;
  declare ClienteTelefono: string;
  declare ClienteDireccion: string;
  declare Rol: "cliente" | "admin" ;
  declare ClienteContraseniaHash: string;
  /** Email del usuario asociado (permite resolver la propiedad del recurso). */
  declare ClienteEmail: string | null;


  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Cliente.init(
  {
    ClienteID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },

    ClienteNombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    ClienteTelefono: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },

    ClienteDireccion: {
      type: DataTypes.STRING(250),
      allowNull: false,
    },

    ClienteEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    ClienteContraseniaHash: {
      type: DataTypes.STRING(256),
      allowNull: false, // Obligatorio para poder hacer login
    },


    Rol: {
      type: DataTypes.ENUM("cliente", "admin"),
      allowNull: false,
      defaultValue: "cliente",
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