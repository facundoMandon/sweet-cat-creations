-- ============================================================================
-- Migración: subcategorías numeradas por categoría (clave compuesta)
--
--   subcategorias PK  : ("CatID", "SubCatID")   -- SubCatID reinicia en 1 por categoría
--   productos     FK  : ("CatID", "SubCatID") -> subcategorias
--
-- Idempotente: se puede correr más de una vez sin romper nada.
-- IMPORTANTE: hacer backup de la base antes de ejecutarlo.
-- ============================================================================

BEGIN;

-- 1. Productos: agregar CatID y completarlo desde la subcategoría actual ------
ALTER TABLE productos ADD COLUMN IF NOT EXISTS "CatID" INTEGER;

UPDATE productos p
SET "CatID" = s."CatID"
FROM subcategorias s
WHERE p."SubCatID" = s."SubCatID"
  AND p."CatID" IS DISTINCT FROM s."CatID"
  AND (SELECT COUNT(*) FROM subcategorias x WHERE x."SubCatID" = p."SubCatID") = 1;

-- 2. Quitar la FK vieja (SubCatID simple) ------------------------------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'productos'
      AND con.contype = 'f'
      AND pg_get_constraintdef(con.oid) LIKE '%subcategorias%'
  LOOP
    EXECUTE format('ALTER TABLE productos DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- 3. Renumerar SubCatID por categoría ----------------------------------------
DROP TABLE IF EXISTS _mapa_subcat;
CREATE TEMP TABLE _mapa_subcat AS
SELECT
  "CatID",
  "SubCatID"                        AS old_sub,
  ROW_NUMBER() OVER (PARTITION BY "CatID" ORDER BY "SubCatID") AS new_sub
FROM subcategorias;

UPDATE productos p
SET "SubCatID" = m.new_sub
FROM _mapa_subcat m
WHERE p."CatID" = m."CatID" AND p."SubCatID" = m.old_sub;

UPDATE subcategorias s
SET "SubCatID" = m.new_sub
FROM _mapa_subcat m
WHERE s."CatID" = m."CatID" AND s."SubCatID" = m.old_sub;

-- 4. Nueva clave primaria compuesta y fin del autoincremento -----------------
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    WHERE rel.relname = 'subcategorias' AND con.contype = 'p'
  LOOP
    EXECUTE format('ALTER TABLE subcategorias DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

ALTER TABLE subcategorias ALTER COLUMN "SubCatID" DROP DEFAULT;
DROP SEQUENCE IF EXISTS "subcategorias_SubCatID_seq" CASCADE;

ALTER TABLE subcategorias
  ADD CONSTRAINT subcategorias_pkey PRIMARY KEY ("CatID", "SubCatID");

-- Descripción única dentro de cada categoría
DROP INDEX IF EXISTS subcategorias_cat_descripcion_unique;
CREATE UNIQUE INDEX subcategorias_cat_descripcion_unique
  ON subcategorias ("CatID", "SubCatDescripcion");

-- 5. FK compuesta en productos ------------------------------------------------
ALTER TABLE productos ALTER COLUMN "CatID" SET NOT NULL;

ALTER TABLE productos DROP CONSTRAINT IF EXISTS productos_subcategoria_fkey;
ALTER TABLE productos
  ADD CONSTRAINT productos_subcategoria_fkey
  FOREIGN KEY ("CatID", "SubCatID")
  REFERENCES subcategorias ("CatID", "SubCatID")
  ON UPDATE CASCADE;

CREATE INDEX IF NOT EXISTS productos_cat_subcat_idx ON productos ("CatID", "SubCatID");

COMMIT;

-- Verificación
-- SELECT "CatID", "SubCatID", "SubCatDescripcion" FROM subcategorias ORDER BY 1, 2;
