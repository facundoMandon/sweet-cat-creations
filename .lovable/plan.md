# Imágenes de productos con Cloudinary

Sí, se puede, y encaja bien con el modelo actual: hoy `Producto` tiene un solo campo `ProdImg` con una URL suelta. Cloudinary aporta subida directa, almacenamiento y, sobre todo, transformaciones on-the-fly: con un solo `public_id` se generan automáticamente miniatura de catálogo, imagen grande de detalle y thumbnail de carrito/admin, sin subir varias versiones.

## Qué cambia

### 1. Modelo de datos
- Nuevo campo `ProdImgPublicId` (string, nullable) en `Backend/src/models/Producto.ts`.
- Se mantiene `ProdImg` como URL de respaldo (productos ya cargados o imágenes externas). Regla de render: si hay `ProdImgPublicId` se usa Cloudinary; si no, `ProdImg`; si no, la mascota por defecto.
- Sequelize crea la columna sola en el redeploy (sync con `alter`).

### 2. Subida desde el panel admin
- Firma segura: endpoint backend `POST /api/uploads/firma` (solo admin) que devuelve una firma de Cloudinary generada con el `API_SECRET`. El secreto nunca sale del servidor ni entra al bundle del frontend.
- El navegador sube el archivo directo a Cloudinary con esa firma (no pasa por el backend, más rápido y sin límite de payload).
- El formulario de producto en `admin.productos` reemplaza el input de URL por un uploader con arrastrar-y-soltar, vista previa, barra de progreso y botón para quitar la imagen.
- Al guardar el producto se persiste el `public_id` devuelto.
- Opcional: al borrar/reemplazar la imagen, el backend elimina el asset viejo en Cloudinary.

### 3. Tamaños automáticos (lo que pedís)
Un helper `src/lib/cloudinary.ts` construye la URL según el uso, con recorte inteligente, `f_auto` (WebP/AVIF) y `q_auto`:

```text
thumb    64x64    carrito, tabla admin, notificaciones
card     400x400  tarjeta de catálogo (con srcset 2x)
detail   900x900  página de producto
og      1200x630  imagen de redes / SEO
```

Se aplica en `ProductCard`, detalle de producto, carrito, checkout y tablas admin. Beneficio directo: el catálogo carga imágenes chicas y la ficha una grande, sin trabajo manual.

### 4. White-label
- `src/config/brand.ts` suma `media.cloudName` y los presets de tamaño, para que otro emprendimiento use su propia cuenta cambiando la config.
- Imagen por defecto (`mascot-cat.png`) también configurable.

## Detalles técnicos
- Backend (Render): dependencia `cloudinary` (SDK oficial) solo para firmar y borrar. Variables de entorno en Render, cargadas por vos:
  - `CLOUDINARY_CLOUD_NAME=omrsrwnk`
  - `CLOUDINARY_API_KEY=735783299386975`
  - `CLOUDINARY_API_SECRET=<lo cargás vos en Render, nunca en el código>`
- Frontend: `cloud_name` (`omrsrwnk`) y la API key son públicos, así que quedan en `src/config/brand.ts` bajo `media`. El API Secret no se usa nunca del lado navegador.
- Validación en la firma: carpeta fija (`blackcats/productos`), tipos permitidos (jpg/png/webp) y tamaño máximo (~5 MB).
- Tipos actualizados en `src/lib/types.ts` y en los servicios de productos.

## Sobre el API Secret
Sí: el API Secret lo guardás vos directamente en Render (Environment → Add Secret File / Environment Variable) con el nombre `CLOUDINARY_API_SECRET`. No hace falta que me lo pases ni que quede en el repo; el backend lo lee con `process.env`. Como fallback, si Cloudinary no está configurado, el formulario sigue aceptando una URL manual.

