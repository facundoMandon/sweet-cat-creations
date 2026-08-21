# Subcategorías numeradas por categoría (clave compuesta)

Objetivo: que `subcat_id` reinicie en 1 dentro de cada categoría, quedando la identidad de una subcategoría definida por el par `(cat_id, subcat_id)`.

Resultado esperado:

```text
cat_id | subcat_id | subcat_descripcion
-------+-----------+--------------------
     1 |         1 | Paletas de chocolate
     1 |         2 | Huevos de pascua
     1 |         3 | Conejo de chocolate
     2 |         1 | Torta
     2 |         2 | Postres
```

## Qué cambia

1. **Subcategorías**: la clave primaria pasa a ser `(CatID, SubCatID)`. `SubCatID` deja de autoincrementar globalmente; se calcula al crear como "el máximo de esa categoría + 1".
2. **Productos**: pasan a guardar `CatID` además de `SubCatID`, con clave foránea compuesta hacia subcategorías. Sin esto un producto no podría saber a qué subcategoría pertenece (el número solo ya no es único).
3. **API**: los endpoints de subcategorías y productos empiezan a identificar la subcategoría por los dos valores en vez de un solo id.
4. **Panel admin y tienda**: los selectores y filtros de subcategoría envían/reciben el par categoría + subcategoría.

## Migración de datos

Script SQL idempotente sobre Neon, en una transacción:

- Agregar `cat_id` a `productos` y completarlo desde la subcategoría actual.
- Renumerar `subcat_id` por categoría con `ROW_NUMBER() OVER (PARTITION BY cat_id ORDER BY subcat_id)`, propagando el nuevo número a `productos` mediante una tabla temporal de mapeo (viejo id -> nuevo par).
- Reemplazar la PK de `subcategorias` por `(cat_id, subcat_id)`, eliminar la secuencia de autoincremento y crear la FK compuesta `productos(cat_id, subcat_id)`.
- Restricción única adicional: `(cat_id, subcat_descripcion)` para evitar duplicados dentro de una categoría.

## Detalles técnicos

- `Backend/src/models/SubCategoria.ts`: `CatID` y `SubCatID` ambos `primaryKey: true`, sin `autoIncrement`.
- `Backend/src/models/Producto.ts`: nuevo campo `CatID` obligatorio.
- `Backend/src/models/index.ts`: `Producto.belongsTo(SubCategoria)` con `foreignKey: ["CatID","SubCatID"]` (Sequelize no soporta FK compuestas en asociaciones), por lo que la relación se resuelve así:
  - se mantiene la asociación `Producto -> Categoria` y `Categoria -> SubCategoria` para los `include`,
  - la subcategoría de un producto se resuelve por consulta explícita/`include` sobre `Categoria.subcategorias` filtrando en memoria, o con un `scope` que aplique el `where` del par.
- `catalogo.service.ts`: `createSubCategoria` calcula el próximo `SubCatID` con `MAX(SubCatID)+1` dentro de una transacción con bloqueo de la categoría (evita colisiones concurrentes); `get/update/delete` reciben `catId` y `subCatId`.
- `catalogo.routes.ts` / `catalogo.controller.ts`: rutas pasan a `/:catId/:subCatId` para obtener, actualizar y borrar; el listado admite `?catId=`.
- `producto.service.ts`: validación y filtros usan el par; `SubCatID` solo ya no es válido como input.
- `Backend/src/scripts/seed.ts`: `findOrCreate` por `(CatID, SubCatDescripcion)` y asignación manual del número.
- Frontend (`src/lib/types.ts`, `src/lib/services/catalog.ts`, `products.ts`, `admin.catalogo.tsx`, `admin.productos.tsx`, `_store.catalogo.tsx`, `_store.producto.$id.tsx`, `product-card.tsx`): el identificador de subcategoría pasa a ser la clave `${catId}-${subCatId}` en selects y filtros, con envío de ambos campos al backend.

## Riesgos

- Es un cambio con efecto en casi todo el catálogo: cualquier URL o dato guardado que use el `subcat_id` viejo deja de resolver.
- La renumeración debe correrse una sola vez y con backup previo de la base.
