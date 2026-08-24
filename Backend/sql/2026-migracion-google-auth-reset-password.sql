-- Migración idempotente: login con Google + recupero de contraseña.
-- Correr en Neon (con backup previo) antes de desplegar el backend.

BEGIN;

-- 1) Cuentas sólo-Google: el hash local pasa a ser opcional.
ALTER TABLE usuarios ALTER COLUMN "UsuarioContraseniaHash" DROP NOT NULL;

-- 2) Nuevas columnas de identidad.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_usuarios_AuthProveedor') THEN
    CREATE TYPE "enum_usuarios_AuthProveedor" AS ENUM ('local', 'google', 'ambos');
  END IF;
END $$;

ALTER TABLE usuarios
  ADD COLUMN IF NOT EXISTS "AuthProveedor" "enum_usuarios_AuthProveedor"
    NOT NULL DEFAULT 'local',
  ADD COLUMN IF NOT EXISTS "GoogleSub" VARCHAR(64),
  ADD COLUMN IF NOT EXISTS "EmailVerificado" BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS "AvatarURL" VARCHAR(500);

CREATE UNIQUE INDEX IF NOT EXISTS usuarios_google_sub_uidx
  ON usuarios ("GoogleSub")
  WHERE "GoogleSub" IS NOT NULL;

-- 3) Tokens de recupero de contraseña (se guarda sólo el hash SHA-256).
CREATE TABLE IF NOT EXISTS password_resets (
  "ResetID"    SERIAL PRIMARY KEY,
  "UsuarioID"  INTEGER NOT NULL REFERENCES usuarios("UsuarioID") ON DELETE CASCADE,
  "TokenHash"  VARCHAR(64) NOT NULL UNIQUE,
  "ExpiraEn"   TIMESTAMPTZ NOT NULL,
  "UsadoEn"    TIMESTAMPTZ,
  "createdAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS password_resets_usuario_idx
  ON password_resets ("UsuarioID");
CREATE INDEX IF NOT EXISTS password_resets_expira_idx
  ON password_resets ("ExpiraEn");

COMMIT;
