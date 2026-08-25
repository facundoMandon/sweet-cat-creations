# Migrar el envío de emails de SMTP a Resend

El cambio queda contenido en el backend: sólo `Backend/src/utils/mailer.ts` y `Backend/package.json`. La única referencia externa al mailer es `auth.service.ts`, que importa `passwordResetTemplate` y `sendMail` — no se toca.

## Dónde va la API Key

Tu backend corre en Render, fuera de Lovable, así que **la key tiene que estar como variable de entorno en Render** (`RESEND_API_KEY`). El conector de Resend en Lovable sólo inyecta credenciales en el runtime del app de Lovable; el proceso de Express en Render no las ve. En Render quedan como secretos cifrados, que es lo correcto.

## Cambios

### `Backend/package.json`
- Quitar `nodemailer` y `@types/nodemailer`.
- Agregar `resend`.

### `Backend/src/utils/mailer.ts` (edición puntual, no reescritura)
- Reemplazar el import de nodemailer por `import { Resend } from "resend"`.
- `mailerConfigurado()` pasa a comprobar sólo `Boolean(process.env["RESEND_API_KEY"])`.
- Sustituir `getTransporter()` por un cliente Resend perezoso (creado en el primer envío, cacheado en módulo).
- `sendMail(input)` conserva firma e interfaz `MailInput`; envía con `resend.emails.send({ from: process.env["MAIL_FROM"] ?? "onboarding@resend.dev", to: [input.to], subject, text, html })`, devuelve `false` si falta config o si viene `error`, y `true` con log del `data?.id`.
- Logs: `[mailer] Enviando email mediante Resend...`, `[mailer] Email enviado correctamente: <id>`, `[mailer] Error de Resend: ...`. Ningún secreto impreso.
- `passwordResetTemplate()` queda exactamente igual (HTML, texto, saludo, vencimiento, uso único).
- `APP_NAME` sigue leyéndose igual.

### Sin cambios
`auth.service.ts` (token, expiración, validación, link, endpoint), controllers, modelos, JWT, base de datos y frontend.

## Variables en Render

Agregar: `RESEND_API_KEY`, `MAIL_FROM` (`onboarding@resend.dev` hasta verificar tu dominio), `APP_NAME=Black Cats`. Eliminar: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`.

Nota: `onboarding@resend.dev` sólo entrega al email dueño de la cuenta Resend. Para mandar a clientes reales hay que verificar un dominio en Resend y usar un `MAIL_FROM` de ese dominio.
