import {
  Model,
  DataTypes,
  InferAttributes,
  InferCreationAttributes,
  CreationOptional,
} from "sequelize";
import { sequelize } from "../config/database.js";

/**
 * Tokens de recupero de contraseña. Nunca se guarda el token en claro:
 * sólo su hash SHA-256, de un solo uso y con vencimiento corto.
 */
export class PasswordReset extends Model<
  InferAttributes<PasswordReset>,
  InferCreationAttributes<PasswordReset>
> {
  declare ResetID: CreationOptional<number>;
  declare UsuarioID: number;
  declare TokenHash: string;
  declare ExpiraEn: Date;
  declare UsadoEn: CreationOptional<Date | null>;

  declare readonly createdAt: CreationOptional<Date>;
  declare readonly updatedAt: CreationOptional<Date>;
}

PasswordReset.init(
  {
    ResetID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UsuarioID: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TokenHash: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    ExpiraEn: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    UsadoEn: {
      type: DataTypes.DATE,
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
    tableName: "password_resets",
    timestamps: true,
    indexes: [{ fields: ["UsuarioID"] }, { fields: ["ExpiraEn"] }],
  }
);
