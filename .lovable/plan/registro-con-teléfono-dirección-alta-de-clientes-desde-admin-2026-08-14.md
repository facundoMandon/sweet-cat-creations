# Registro con teléfono/dirección, alta de clientes desde admin y URL del calendario

Tres ajustes: pedir datos de contacto en el registro, igualar el modal de alta de clientes del panel admin al formulario de registro, y corregir el dominio que se escribe en los eventos de Google Calendar.

## 1. Registro público con teléfono y dirección

Hoy el formulario de `/login` (modo registro) sólo pide nombre, email y contraseña, aunque el backend ya acepta `telefono` y `direccion` de forma opcional y crea el perfil de cliente en la misma transacción. Además, se añadió el campo de apellido.

- Frontend (`src/routes/_store.login.tsx`): agregar los campos Apellido, **Teléfono** y **Dirección** en modo registro, con validación (Apellido requerido, max 50, teléfono: requerido, sólo dígitos/espacios/`+`/`-`, máx. 50; dirección: requerida, máx. 250) y enviarlos en `register`.
- Backend (`usuario.service.ts` / registro): pasar `telefono` y `direccion` de opcionales a **requeridos cuando el rol es cliente**, con los mismos límites. Se mantiene la compatibilidad con los alias `ClienteTelefono` / `ClienteDireccion`.

## 2. Dirección en el checkout: usar la guardada o escribir otra

En el checkout, cuando el usuario está logueado y tiene perfil, precargar nombre, teléfono y dirección, y ofrecer dos opciones:

- "Usar mi dirección guardada" (opción por defecto, muestra la dirección del perfil)
- "Enviar a otra dirección" (habilita el campo de texto y sólo aplica a ese pedido; no modifica el perfil)

El pedido sigue guardando la dirección efectivamente elegida.

## 3. Modal de alta de clientes en el panel admin

`src/routes/admin.clientes.tsx` hoy sólo tiene nombre, teléfono y dirección — no puede crear un cliente real porque falta la identidad (email y contraseña).

- En **alta**: nombre, apellido, email, contraseña, teléfono y dirección (mismos campos y validaciones que el registro público). Se envía a `POST /clientes`, que ya crea usuario + perfil.
- En **edición**: nombre, apellido, teléfono y dirección editables; email visible pero de sólo lectura (cambiar el email de acceso es otra operación), y sin campo de contraseña.
- Agregar la columna **Email** a la tabla de clientes y permitir buscar por email.  
Agregar columna teléfono a la tabla de clientes y permitir buscar por telefono

## 4. URL base del calendario

`src/lib/calendar.server.ts` usa `https://sweet-cat-creations.lovable.app` como fallback. Se cambia a `https://blackcats.lovable.app`, resolviéndose en este orden: `APP_BASE_URL` del entorno → origen de la request cuando esté disponible → `https://blackcats.lovable.app`. Mismo criterio para `Backend/src/services/calendar.service.ts`, que ya usa el dominio correcto pero conviene dejar alineado

## Detalles técnicos

- Archivos frontend: `src/routes/_store.login.tsx`, `src/routes/_store.checkout.tsx`, `src/routes/admin.clientes.tsx`, `src/lib/services/clients.ts` (ampliar `ClienteInput` con `ClienteEmail` y `password` para el alta), `src/lib/calendar.server.ts`.
- Archivos backend: `Backend/src/services/usuario.service.ts` (teléfono/dirección requeridos para rol cliente), `Backend/src/services/cliente.service.ts` (permitir actualizar teléfono/dirección/nombre; email de sólo lectura), `Backend/src/services/calendar.service.ts`.
- Sin cambios de esquema: `clientes` ya tiene `ClienteTelefono` y `ClienteDireccion`.