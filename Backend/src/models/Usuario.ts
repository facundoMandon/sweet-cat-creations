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

/** Proveedores de autenticación soportados. */
export const AUTH_PROVEEDORES = ["local", "google", "ambos"] as const;
export type AuthProveedor = (typeof AUTH_PROVEEDORES)[number];

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
  /** Nulo en cuentas creadas sólo con Google (todavía sin contraseña local). */
  declare UsuarioContraseniaHash: CreationOptional<string | null>;
  declare Rol: RolPersistido;
  declare Activo: CreationOptional<boolean>;
  declare AuthProveedor: CreationOptional<AuthProveedor>;
  declare GoogleSub: CreationOptional<string | null>;
  declare EmailVerificado: CreationOptional<boolean>;
  declare AvatarURL: CreationOptional<string | null>;

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
      allowNull: true,
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
    AuthProveedor: {
      type: DataTypes.ENUM("local", "google", "ambos"),
      allowNull: false,
      defaultValue: "local",
    },
    GoogleSub: {
      type: DataTypes.STRING(64),
      allowNull: true,
      unique: true,
    },
    EmailVerificado: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    AvatarURL: {
      type: DataTypes.STRING(500),
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
