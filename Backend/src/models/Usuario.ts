import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

/** Roles persistidos. "visitante" = usuario sin sesión (no se guarda). */
export const ROLES_PERSISTIDOS = ["admin", "cliente"] as const;
export type RolPersistido = (typeof ROLES_PERSISTIDOS)[number];
export type Rol = RolPersistido | "visitante";

/**
 * Generalización de la identidad: todo el que se autentica es un Usuario.
 * El perfil de compra (teléfono/dirección) vive en `clientes` (1:1 opcional).
 */
export class Usuario extends Model<
  InferAttributes<Usuario>,
  InferCreationAttributes<Usuario>
> {
  declare UsuarioID: CreationOptional<number>;
  declare UsuarioNombre: string;
  declare UsuarioApellido: string | null;
  declare UsuarioEmail: string;
  declare UsuarioContraseniaHash: string;
  declare Rol: RolPersistido;
  declare Activo: CreationOptional<boolean>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

Usuario.init(
  {
    UsuarioID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UsuarioNombre: {
      type: DataTypes.STRING(150),
      allowNull: false,
    },
    UsuarioApellido: {
      type: DataTypes.STRING(150),
      allowNull: true,
    },
    UsuarioEmail: {
      type: DataTypes.STRING(150),
      allowNull: false,
      unique: true,
    },
    UsuarioContraseniaHash: {
      type: DataTypes.STRING(256),
      allowNull: false,
    },
    Rol: {
      type: DataTypes.ENUM("admin", "cliente"),
      allowNull: false,
      defaultValue: "cliente",
    },
    Activo: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
