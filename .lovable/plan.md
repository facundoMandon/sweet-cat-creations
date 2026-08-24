# Configurar Google Sign-In y recupero de contraseña por email

Guía de configuración (no requiere cambios de código: todo ya está implementado y solo espera las variables de entorno).

## 1. Crear las credenciales OAuth en Google Cloud

1. Entrá a console.cloud.google.com y creá (o seleccioná) un proyecto, por ejemplo "Black Cats".
2. Menú **APIs y servicios > Pantalla de consentimiento de OAuth**:
   - Tipo de usuario: **Externo**.
   - Nombre de la app: Black Cats. Email de soporte y de contacto: tu correo.
   - **Dominios autorizados**: `lovable.app` y tu dominio propio si lo tenés.
   - Scopes: solo `openid`, `.../auth/userinfo.email`, `.../auth/userinfo.profile`.
   - Publicá la app (o agregá tu email en "Usuarios de prueba" mientras probás).
3. Menú **APIs y servicios > Credenciales > Crear credenciales > ID de cliente de OAuth**:
   - Tipo de aplicación: **Aplicación web**.
   - **Orígenes de JavaScript autorizados** (esto es lo que usa el botón de Google):
     - `https://blackcats.lovable.app`
     - `https://id-preview--e26c5a67-0d1e-403a-ab2c-ea3dd91d2fe2.lovable.app`
     - `http://localhost:8080`
     - tu dominio propio, si aplica
   - **URIs de redireccionamiento**: no hacen falta (el flujo usa Google Identity Services con `id_token`, no redirect).
4. Copiá el **Client ID** (termina en `.apps.googleusercontent.com`). El Client Secret no se usa en este flujo.

## 2. Variables en el frontend

En el hosting del frontend (y en `.env` local):

```
VITE_GOOGLE_CLIENT_ID=<tu-client-id>.apps.googleusercontent.com
```

Es un valor público. Sin él, el botón "Continuar con Google" no se renderiza.

## 3. Variables en el backend (Render)

En Render > tu servicio > **Environment**:

```
GOOGLE_CLIENT_ID=<el mismo client id>
APP_BASE_URL=https://blackcats.lovable.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tucuenta@gmail.com
SMTP_PASS=<contraseña de aplicación de 16 caracteres>
MAIL_FROM="Black Cats <tucuenta@gmail.com>"
```

- `GOOGLE_CLIENT_ID` se usa para validar el `aud` del token que envía el navegador; si no coincide, el login se rechaza.
- `APP_BASE_URL` arma el link del email de recupero (`/restablecer?token=...`).
- Si SMTP no está configurado, el endpoint de "olvidé mi contraseña" responde OK pero no envía nada (queda un warning en los logs).

### Contraseña de aplicación de Gmail

1. Activá **verificación en 2 pasos** en tu cuenta Google.
2. myaccount.google.com/apppasswords > crear una contraseña para "Correo".
3. Usá esos 16 caracteres (sin espacios) como `SMTP_PASS`. La contraseña normal de Gmail no funciona.
4. Alternativa recomendada para producción: Resend / SendGrid / Brevo con dominio verificado, para no caer en spam.

## 4. Verificación

1. Redeploy del backend en Render (las variables nuevas requieren reinicio) y rebuild del frontend.
2. Abrí `/login`: debe aparecer el botón de Google. Si no aparece, falta `VITE_GOOGLE_CLIENT_ID` en el build.
3. Iniciá sesión con Google: se crea el usuario con rol cliente y `AuthProveedor = google`; si el email ya existía como local pasa a `ambos`.
4. Probá `/recuperar` con un email existente y confirmá que llega el mail y que el link abre `/restablecer`.

## Errores típicos

- **origin_mismatch / "The given origin is not allowed"**: falta ese origen exacto (con https, sin barra final) en Orígenes de JavaScript autorizados.
- **Token inválido / 401 en el backend**: `GOOGLE_CLIENT_ID` del backend distinto al del frontend.
- **Email no llega**: SMTP incompleto, o Gmail rechazando por usar contraseña común en vez de contraseña de aplicación.
- **Link del email apunta a localhost**: `APP_BASE_URL` sin definir en Render.

## Notas técnicas

- Frontend: `src/components/google-signin-button.tsx` lee `import.meta.env.VITE_GOOGLE_CLIENT_ID`.
- Backend: `Backend/src/utils/google.ts` valida firma RS256 contra el JWKS de Google y los claims `iss`/`aud`/`exp`/`email_verified`; `Backend/src/utils/mailer.ts` envía por SMTP con nodemailer.
- No se agregan archivos ni se modifica código en este paso: es puramente configuración.
