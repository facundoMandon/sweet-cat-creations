# Generalización de Cliente a Usuario + roles

Antes de seguir con controllers, routes y services, se refactoriza el modelo de identidad:
una entidad **Usuario** general y un **perfil Cliente** opcional (1:1), con tres roles:
`admin`, `cliente` y `visitante` (visitante = sin sesión).

## Modelo resultante

```text
usuarios (UsuarioID, UsuarioNombre, UsuarioApellido, UsuarioEmail unico, UsuarioContraseniaHash, Rol, Activo)
    | 1
    | 1 (opcional, solo si Rol = cliente)
clientes (ClienteID, UsuarioID unico FK, ClienteTelefono, ClienteDireccion)
    | 1
    | N
pedidos  (ClienteID FK)  -> sin cambios
```

- `usuarios` concentra nombre, apellido, email y contraseña hasheada (hoy repartidos en `clientes`).
- `clientes` queda como perfil de compra (teléfono + dirección) y sigue siendo el dueño de los pedidos.
- Un admin no necesita fila en `clientes`; un cliente siempre tiene una.

## Reglas de permisos


| Acción                                               | Visitante                         | Cliente           | Admin      |
| ---------------------------------------------------- | --------------------------------- | ----------------- | ---------- |
| Ver inicio, catálogo, producto, carrito              | Sí                                | Sí                | Sí         |
| Crear/ver pedidos propios                            | No (401 con mensaje "registrate") | Sí                | Sí         |
| Ver/editar su propio perfil                          | No                                | Sí (solo el suyo) | Sí (todos) |
| CRUD de productos, catálogo, estados, notificaciones | No                                | No                | Sí         |
| Listar clientes/usuarios, cambiar estados de pedidos | No                                | No                | Sí         |


## Tareas

1. **Arreglar el build actual** (bloqueante): el tipo `Cliente` del frontend ya pide `ClienteEmail` y `Rol`, y `src/lib/mock-data.ts` + `src/lib/services/clients.ts` no los envían. Se resuelve al alinear los tipos con el nuevo modelo Usuario/Cliente del paso 7.
2. **Modelos**
  - Nuevo `models/Usuario.ts` (ID, nombre, email único, hash, rol enum `admin|cliente|visitante`, activo, timestamps).
  - Reescribir `models/Cliente.ts`: quita nombre/email/hash/rol, agrega `UsuarioID` único FK.
  - `models/index.ts`: asociaciones `Usuario.hasOne(Cliente)` / `Cliente.belongsTo(Usuario)`.
3. **Migración de datos**
  - Script `npm run sync-db` que corre `sequelize.sync({ alter: true })` y, si hay filas viejas en `clientes` con email/hash, las copia a `usuarios` y las vincula por `UsuarioID`.
4. **Autenticación**
  - `utils/jwt.ts`: el payload pasa a `{ sub (UsuarioID), email, rol, clienteId? }` con rol incluyendo `visitante`.
  - Endpoints de auth del backend (`/api/auth`): register (crea Usuario + perfil Cliente), login, refresh, me, logout — verificando email, contraseña y rol vigente contra `usuarios.Activo`.
  - Al registrarse como cliente se crea la fila de `clientes` en la misma transacción.
5. **Middlewares**
  - `auth.middleware.ts`: resuelve `req.user` desde el token; sin token asigna rol `visitante` en lugar de fallar (rutas públicas) y mantiene la variante estricta para rutas privadas.
  - `role.middleware.ts`: `requireRole`, `requireAdmin`, `requireCliente` (rechaza visitante con mensaje "necesitás una cuenta para comprar").
  - Ownership: helper que compara `req.user.clienteId` contra el `ClienteID` del recurso.
6. **Servicios**
  - Nuevo `usuario.service.ts`: CRUD de usuarios (listado paginado y búsqueda, cambio de rol, activar/desactivar, cambio de contraseña) — solo admin, excepto el propio perfil.
  - `cliente.service.ts`: adaptado al perfil (join con Usuario para nombre/email), ownership por `UsuarioID`/`ClienteID` en vez de email suelto.
  - `pedido.service.ts`: exige rol cliente/admin y resuelve el `ClienteID` desde el usuario autenticado.
7. **Controllers y routes**
  - `controllers/auth.controller.ts` + `controllers/usuario.controller.ts`.
  - `routes/auth.routes.ts` (público) y `routes/usuario.routes.ts` (admin), registradas en `routes/index.ts`.
  - Aplicar `optionalAuth` en catálogo/productos y `requireCliente`/`requireAdmin` en el resto.
8. **Frontend (ajuste mínimo)**
  - `src/lib/types.ts`: `Usuario` con `rol: 'admin' | 'cliente' | 'visitante'` y `clienteId` opcional.
  - `auth-context`: sin sesión ⇒ rol visitante; `ProtectedRoute` bloquea checkout/mis pedidos para visitantes con CTA de registro.
  - Catálogo y carrito quedan accesibles sin sesión; el botón de confirmar pedido redirige a login/registro si es visitante.
9. **Verificación**
  - Compilar el backend y probar por curl: registro, login, `me`, acceso admin denegado a cliente, checkout denegado a visitante, y creación de pedido por un cliente.

## Notas técnicas

- Todo el cambio de esquema se aplica con `sequelize.sync({ alter: true })` contra Neon; no se borran tablas.
- Las contraseñas siguen con el mismo esquema de hash que ya usa la app para que las cuentas demo sigan funcionando.
- El rol nunca se lee del cliente: se toma del JWT firmado y se revalida contra `usuarios` en cada request sensible.