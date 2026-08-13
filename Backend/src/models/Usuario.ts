import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
} from "sequelize";
import { sequelize } from "../config/database.js";

export class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare id: string;
  declare nombre: string;
  declare rol: "admin" | "cliente";
  declare email: string;
  declare passwordHash: string;
  declare telefono?: string | null;
  declare direccion?: string | null;

  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Usuario.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    nombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },

    email: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },

    passwordHash: {
      type: DataTypes.STRING(512),
      allowNull: false,
    },

    rol: {
      type: DataTypes.ENUM("cliente", "admin"),
      allowNull: false,
      defaultValue: "cliente",
    },

    telefono: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },

    direccion: {
      type: DataTypes.STRING(250),
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
    tableName: "usuarios",
    timestamps: true,
  }
);
