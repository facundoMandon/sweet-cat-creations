# Login con Google + recupero de contraseña

Sí, es posible. Todo se implementa sobre tu propia API (Express + Neon), sin migrar usuarios: Google se usa sólo como forma de verificar la identidad, y tu backend sigue emitiendo los mismos JWT que ya usás hoy.

## Cómo va a funcionar

**Entrar con Google**
1. En la pantalla de Ingresar/Registrarme aparece un botón "Continuar con Google".
2. Google devuelve un token firmado al frontend.
3. El backend verifica ese token contra las claves públicas de Google (audiencia = tu Client ID, emisor válido, no expirado, email verificado).
4. Si el email ya existe → se vincula automáticamente a esa cuenta (podrá entrar con Google o con contraseña).
   Si no existe → se crea el usuario con rol cliente y su perfil.
5. Se emite tu access token + cookie de refresh, igual que un login normal.

**Datos faltantes de Google**: Google no da teléfono ni dirección. Un cliente creado por Google entra igual, pero la primera vez que va a hacer un pedido el checkout le pide teléfono y dirección y los guarda en su perfil (no lo bloqueamos en el login).

**Recupero de contraseña**
1. Link "Olvidé mi contraseña" → pide el email.
2. La respuesta es siempre la misma ("si el email existe, te enviamos las instrucciones") para no revelar qué cuentas existen.
3. Si existe, se genera un token de un solo uso, con vencimiento de 1 hora, guardado hasheado en la base.
4. Se envía un mail por SMTP con un link a `/restablecer?token=...`.
5. Esa página pide la nueva contraseña dos veces, la valida (mínimo 6 caracteres) y la actualiza; el token se marca como usado y se cierran las sesiones vigentes.
6. Si la cuenta sólo tiene Google (sin contraseña), el mismo flujo sirve para crearle una contraseña.

## Lo que vas a tener que configurar

Variables de entorno en Render (ninguna va al frontend salvo el Client ID público):

- `GOOGLE_CLIENT_ID` (y `VITE_GOOGLE_CLIENT_ID` en el frontend, es público)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`
- En Google Cloud Console: crear un OAuth Client ID de tipo "Web application" y autorizar los orígenes `https://blackcats.lovable.app` y la URL de preview.

Con Gmail hace falta una "contraseña de aplicación" (no la contraseña normal de la cuenta).

## Detalles técnicos

**Base de datos (migración SQL para Neon, idempotente)**
- `usuarios`: `UsuarioContraseniaHash` pasa a nullable (cuentas sólo-Google), nuevas columnas `AuthProveedor` ('local' | 'google' | 'ambos'), `GoogleSub`, `EmailVerificado`, `AvatarURL`.
- Nueva tabla `password_resets`: `id`, `UsuarioID`, `TokenHash`, `ExpiraEn`, `UsadoEn`, `createdAt` + índices.

**Backend**
- `Backend/src/models/Usuario.ts`: nuevos campos; `Backend/src/models/PasswordReset.ts` nuevo + registro en `models/index.ts`.
- `Backend/src/utils/google.ts`: verificación del `id_token` usando los JWKS de Google (`https://www.googleapis.com/oauth2/v3/certs`) con caché en memoria, sin dependencias nuevas.
- `Backend/src/utils/mailer.ts`: envío SMTP con `nodemailer` (nueva dependencia) + plantilla HTML/texto con los colores de la marca.
- `Backend/src/services/auth.service.ts`: `loginConGoogle(idToken)`, `solicitarReset(email)`, `restablecerPassword(token, password)`. Reutiliza `emitirSesion` para no duplicar lógica de JWT/roles.
- `Backend/src/utils/password.ts`: `verifyPassword` devuelve false si el hash es nulo.
- `Backend/src/controllers/auth.controller.ts` + `routes/auth.routes.ts`: `POST /api/auth/google`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`.
- Rate limit simple en memoria para forgot-password (por email e IP) para evitar abuso del SMTP.

**Frontend**
- `src/lib/services/auth.ts`: `loginWithGoogle`, `forgotPassword`, `resetPassword`.
- `src/context/auth-context.tsx`: expone `loginWithGoogle`.
- `src/components/google-signin-button.tsx`: carga el script de Google Identity Services y renderiza el botón oficial (funciona dentro del iframe del preview).
- `src/routes/_store.login.tsx`: botón de Google arriba del formulario + separador "o" + link "Olvidé mi contraseña".
- `src/routes/_store.recuperar.tsx` (pedir el mail) y `src/routes/_store.restablecer.tsx` (nueva contraseña) — nuevas rutas públicas con estilo kawaii existente y `head()` propio.
- `src/config/content.ts`: textos nuevos (para mantener el sitio white-label).

**Seguridad**
- El `id_token` se verifica siempre en el servidor; nunca se confía en datos del cliente.
- El rol nunca viene de Google: siempre se relee de la base (los admin se siguen creando desde el panel).
- Tokens de reset: aleatorios de 32 bytes, guardados hasheados con SHA-256, un solo uso, 1 hora de vida.
- Respuestas genéricas en forgot-password para no filtrar la existencia de cuentas.
