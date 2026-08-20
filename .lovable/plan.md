# Carga de catálogo inicial (SQL para Neon)

Inserts listos para pegar en Neon: estados de producto, categorías, subcategorías y los 24 productos pedidos.

Notas:
- Las tablas usan nombres de columna en mayúsculas/minúsculas exactas (Sequelize), por eso van entre comillas dobles.
- Los IDs se resuelven por descripción con subconsultas, así no hace falta conocer los IDs generados.
- `ProdImg` queda con la imagen por defecto del sitio (`/mascot-cat.png`) y `ProdImgPublicId` en NULL, para que después el uploader de Cloudinary la reemplace.
- Los precios son valores de arranque: cambialos antes o después de correr el script.
- Es idempotente: se puede correr más de una vez sin duplicar.

## Estructura propuesta

```text
Salados
  ├── Pizzetas         → Pizzetas, Pizzetas completas
  ├── Empanadas        → Empanadas de copetín
  └── Bocaditos salados→ Frankfurt, Rolls de jamón y queso, Sándwichs con pan casero
Panadería
  ├── Panes            → Panes caseros saborizados
  └── Roscas y budines → Rosca rellena, Roscas, Pan dulce, Budines
Chocolatería
  ├── Bombones         → Bombones, Trufas dulces
  └── Pops y bañados   → Cake pops, Paletas de chocolate, Oreo pops, Frutillas bañadas en chocolate
Alfajores
  └── Alfajores        → Alfajores oreo, Alfajores de maicena
Pastelería
  ├── Tortas           → Tortas, Mini tortas
  └── Postres          → Tarteletas, Postres shot, Brownies
```

## SQL

```sql
BEGIN;

-- 1) Estados de producto
INSERT INTO prod_estados ("ProdEstadoDescripcion")
SELECT v FROM (VALUES ('Activo'), ('Inactivo'), ('Sin Stock')) AS t(v)
WHERE NOT EXISTS (
  SELECT 1 FROM prod_estados p WHERE p."ProdEstadoDescripcion" = t.v
);

-- 2) Categorías
INSERT INTO categorias ("CatDescripcion")
SELECT v FROM (VALUES
  ('Salados'), ('Panadería'), ('Chocolatería'), ('Alfajores'), ('Pastelería')
) AS t(v)
WHERE NOT EXISTS (
  SELECT 1 FROM categorias c WHERE c."CatDescripcion" = t.v
);

-- 3) Subcategorías
INSERT INTO subcategorias ("SubCatDescripcion", "CatID")
SELECT t.sub, c."CatID"
FROM (VALUES
  ('Pizzetas',          'Salados'),
  ('Empanadas',         'Salados'),
  ('Bocaditos salados', 'Salados'),
  ('Panes',             'Panadería'),
  ('Roscas y budines',  'Panadería'),
  ('Bombones',          'Chocolatería'),
  ('Pops y bañados',    'Chocolatería'),
  ('Alfajores',         'Alfajores'),
  ('Tortas',            'Pastelería'),
  ('Postres',           'Pastelería')
) AS t(sub, cat)
JOIN categorias c ON c."CatDescripcion" = t.cat
WHERE NOT EXISTS (
  SELECT 1 FROM subcategorias s
  WHERE s."SubCatDescripcion" = t.sub AND s."CatID" = c."CatID"
);

-- 4) Productos
INSERT INTO productos (
  "ProdNombre", "ProdDescripcion", "SubCatID", "ProdEstadoID",
  "ProdImg", "ProdImgPublicId", "EsCombo", "ProdPrecio", "createdAt", "updatedAt"
)
SELECT t.nombre, t.descripcion, s."SubCatID", e."ProdEstadoID",
       '/mascot-cat.png', NULL, false, t.precio, now(), now()
FROM (VALUES
  ('Pizzetas',                          'Pizzetas caseras con salsa y muzzarella.',            'Pizzetas',          4500),
  ('Pizzetas completas',                'Pizzetas con jamón, morrón y aceitunas.',             'Pizzetas',          5500),
  ('Empanadas de copetín',              'Mini empanadas surtidas ideales para picada.',        'Empanadas',         6000),
  ('Panes caseros saborizados',         'Panes artesanales con hierbas y semillas.',           'Panes',             4200),
  ('Frankfurt',                         'Panchos caseros con pan propio.',                     'Bocaditos salados', 3800),
  ('Rosca rellena',                     'Rosca salada rellena a elección.',                    'Roscas y budines',  12000),
  ('Rolls de jamón y queso',            'Rolls de masa casera con jamón y queso.',             'Bocaditos salados', 5200),
  ('Sándwichs con pan casero',          'Sándwichs surtidos con pan artesanal.',               'Bocaditos salados', 5800),
  ('Trufas dulces',                     'Trufas de chocolate artesanales.',                    'Bombones',          6500),
  ('Cake pops',                         'Bocaditos de torta bañados en chocolate.',            'Pops y bañados',    6800),
  ('Paletas de chocolate',              'Paletas decoradas de chocolate.',                     'Pops y bañados',    3500),
  ('Alfajores oreo',                    'Alfajores de galleta oreo con dulce de leche.',       'Alfajores',         7200),
  ('Alfajores de maicena',              'Clásicos de maicena con dulce de leche y coco.',      'Alfajores',         6900),
  ('Oreo pops',                         'Galletas oreo bañadas en chocolate con palito.',      'Pops y bañados',    5900),
  ('Tarteletas',                        'Tarteletas dulces con rellenos surtidos.',            'Postres',           7500),
  ('Mini tortas',                       'Tortas individuales decoradas.',                      'Tortas',            9500),
  ('Tortas',                            'Tortas decoradas por encargo.',                       'Tortas',            22000),
  ('Frutillas bañadas en chocolate',    'Frutillas frescas bañadas en chocolate.',             'Pops y bañados',    8500),
  ('Bombones',                          'Bombones artesanales con rellenos surtidos.',         'Bombones',          9200),
  ('Postres shot',                      'Postres individuales en vasito.',                     'Postres',           4800),
  ('Brownies',                          'Brownies húmedos de chocolate.',                      'Postres',           5600),
  ('Roscas',                            'Rosca dulce casera.',                                 'Roscas y budines',  11000),
  ('Pan dulce',                         'Pan dulce artesanal con frutas y nueces.',            'Roscas y budines',  13500),
  ('Budines',                           'Budines caseros de distintos sabores.',               'Roscas y budines',  5400)
) AS t(nombre, descripcion, sub, precio)
JOIN subcategorias s ON s."SubCatDescripcion" = t.sub
JOIN prod_estados e ON e."ProdEstadoDescripcion" = 'Activo'
WHERE NOT EXISTS (
  SELECT 1 FROM productos p WHERE p."ProdNombre" = t.nombre
);

COMMIT;
```

## Verificación rápida

```sql
SELECT c."CatDescripcion", s."SubCatDescripcion", p."ProdNombre", p."ProdPrecio"
FROM productos p
JOIN subcategorias s ON s."SubCatID" = p."SubCatID"
JOIN categorias c ON c."CatID" = s."CatID"
ORDER BY 1, 2, 3;
```

No hay cambios de código en la app: es solo carga de datos.
