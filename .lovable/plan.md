# Verificación de la API y plan de correcciones

Probé en vivo `https://api-blackcats.onrender.com/api`. La API está arriba y la base de Neon responde. Estos son los resultados y los arreglos.

## Resultado de las pruebas

Funciona bien:
- `POST /api/auth/register` -> 201 con token, crea usuario + perfil cliente.
- `GET /api/auth/me` (con Bearer) -> 200.
- `GET /api/categorias`, `/api/subcategorias`, `/api/eventos` -> 200.
- `GET /api/estados/productos` y `/api/estados/pedidos` -> 200 (los 3 estados ya sembrados).
- `GET /api/productos/catalogo` -> 200 pero devuelve lista vacía.
- Permisos: `/api/clientes` con token de cliente -> 403 correcto; sin token -> 401 correcto.

Fallas detectadas:
1. `POST /api/auth/login` con `admin@blackcats.com` -> 401. No existe ningún usuario admin en la base de Neon (los usuarios demo habían quedado en la base anterior).
2. `GET /api/pedidos` -> 404. `pedido.routes.ts` sólo registra POST `/`, GET `/:id` y PATCH `/:id/status`. Faltan rutas para funciones ya implementadas en el controlador: `listPedidos`, `updatePedido`, `reprogramarPedido`, `deletePedido`, `resumenPedidos`.
3. `GET /api/pedidos/resumen` -> 400 "El campo id debe ser un ID válido": cae en `GET /:id`, confirma lo anterior.
4. `GET /api/notificaciones` -> 404. Existen `notificacion.controller.ts` y su service, pero no hay `notificacion.routes.ts` ni registro en `routes/index.ts`.
5. Catálogo vacío: no hay productos cargados en Neon, así que la tienda se ve sin nada.
6. No hay endpoint de salud: `GET /` y `GET /api` devuelven 404, lo que complica el monitoreo y hace que Render parezca caído.
7. Mensaje de 404 pobre (`"Not Found"`) y archivo `middlewares/notFoundHandler.ts` duplicado con el de `errorHandler.ts` (que tiene el mensaje descriptivo).
8. Desajuste frontend/backend: `src/lib/services/*` llama a rutas que no existen (`/producto-pedidos`, `/pedido-estados`, `/producto-estados`) y espera arrays crudos, mientras la API devuelve `{ success, data, meta }`.

## Plan de solución

### 1. Completar rutas de pedidos
En `Backend/src/routes/pedido.routes.ts`:
- `GET /` (listado con filtros/paginación; cliente ve sólo los suyos).
- `GET /resumen` declarado **antes** de `GET /:id` y protegido con `requireAdmin`.
- `PUT/PATCH /:id` (modificar renglones/fecha), `PATCH /:id/reprogramar`, `DELETE /:id` (admin, sólo cancelados).

### 2. Rutas de notificaciones
Crear `Backend/src/routes/notificacion.routes.ts` (`GET /` y `POST /:id/reenviar`, admin) y registrarlo en `routes/index.ts` bajo `/notificaciones`.

### 3. Health check y 404
- Agregar `GET /api/health` (y `GET /`) devolviendo estado y conexión a la base.
- Borrar `middlewares/notFoundHandler.ts` y usar el de `errorHandler.ts` con el mensaje descriptivo.

### 4. Datos iniciales en Neon
Script de seed (`npm run seed`) idempotente que cree:
- usuario admin (`admin@blackcats.com`) y cliente demo con hash PBKDF2 del backend;
- algunos productos con categoría/estado para que el catálogo no esté vacío.

### 5. Alinear el frontend con la API real
- Ajustar `src/lib/services/*` para desempaquetar `{ success, data, meta }`.
- Catálogo público -> `/productos/catalogo`; estados -> `/estados/productos` y `/estados/pedidos`; eliminar llamadas a `/producto-pedidos` (los renglones van dentro del POST de pedido).
- Enviar el Bearer token en `api-client.ts` para las vistas de admin y cliente.

### 6. Reverificación
Volver a correr la batería de curl (login admin, listado y creación de pedido con producto real, cambio de estado, notificaciones) y reportar los códigos.

## Nota técnica
El primer request tras inactividad en Render tarda ~30-50 s (cold start del plan free); conviene sumarlo al timeout del frontend o mostrar el loader del gato durante ese tiempo.
