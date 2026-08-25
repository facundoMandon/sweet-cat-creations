import nodemailer, { type Transporter } from "nodemailer";

/**
 * Envío de emails por SMTP (Gmail u otro proveedor).
 * Configuración por variables de entorno:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM
 * Si falta configuración, el envío no rompe la app: se loguea y se avisa.
 */

let transporter: Transporter | null = null;

export function mailerConfigurado(): boolean {
  return Boolean(process.env["SMTP_HOST"] && process.env["SMTP_USER"] && process.env["SMTP_PASS"]);
}

function getTransporter(): Transporter | null {
  if (!mailerConfigurado()) return null;
  if (transporter) return transporter;
  const port = Number(process.env["SMTP_PORT"] ?? 587);
  transporter = nodemailer.createTransport({
    host: process.env["SMTP_HOST"]!,
    port,
    secure: port === 465,
    auth: {
      user: process.env["SMTP_USER"]!,
      pass: process.env["SMTP_PASS"]!,
    },
  });
  console.log("[mailer] SMTP config:", {
    host: process.env["SMTP_HOST"],
    port: process.env["SMTP_PORT"],
    user: process.env["SMTP_USER"],
    secure: Number(process.env["SMTP_PORT"] ?? 587) === 465,
  });
  return transporter;
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Devuelve true si el mail salió; false si el SMTP no está configurado o falló. */
export async function sendMail(input: MailInput): Promise<boolean> {
  const tx = getTransporter();

  if (!tx) {
    console.warn("[mailer] SMTP no configurado: no se envió el email a", input.to);
    return false;
  }

  try {
    console.log("[mailer] Verificando conexión SMTP...");

    await tx.verify();

    console.log("[mailer] Conexión SMTP OK");

    await tx.sendMail({
      from: process.env["MAIL_FROM"] ?? process.env["SMTP_USER"]!,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    console.log("[mailer] Email enviado correctamente");

    return true;
  } catch (err) {
    console.error("[mailer] Error enviando email:", err);
    return false;
  }
}

const APP_NAME = process.env["APP_NAME"] ?? "Black Cats";

/** Plantilla del email de recupero de contraseña. */
export function passwordResetTemplate(nombre: string, link: string): MailInput {
  const saludo = nombre ? `Hola ${nombre},` : "Hola,";
  const text = [
    saludo,
    "",
    `Recibimos un pedido para restablecer la contraseña de tu cuenta en ${APP_NAME}.`,
    "",
    `Abrí este enlace para elegir una nueva contraseña (vence en 1 hora):`,
    link,
    "",
    "Si no fuiste vos, podés ignorar este mensaje: tu contraseña no cambia.",
    "",
    `— ${APP_NAME}`,
  ].join("\n");

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;padding:24px;background:#faf7f5;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#3b2f33">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center">
      <table role="presentation" width="100%" style="max-width:520px;background:#ffffff;border-radius:24px;padding:32px">
        <tr><td>
          <h1 style="margin:0 0 12px;font-size:22px;color:#d6336c">Restablecer tu contraseña</h1>
          <p style="margin:0 0 16px;line-height:1.6">${saludo}</p>
          <p style="margin:0 0 16px;line-height:1.6">
            Recibimos un pedido para restablecer la contraseña de tu cuenta en <strong>${APP_NAME}</strong>.
          </p>
          <p style="margin:0 0 24px;text-align:center">
            <a href="${link}" style="display:inline-block;padding:14px 28px;border-radius:9999px;background:#d6336c;color:#ffffff;font-weight:700;text-decoration:none">
              Elegir nueva contraseña
            </a>
          </p>
          <p style="margin:0 0 8px;font-size:13px;line-height:1.6;color:#7a6a70">
            El enlace vence en 1 hora y se puede usar una sola vez.
          </p>
          <p style="margin:0 0 16px;font-size:13px;line-height:1.6;color:#7a6a70">
            Si no fuiste vos, ignorá este mensaje: tu contraseña no cambia.
          </p>
          <p style="margin:0;font-size:12px;color:#a09298;word-break:break-all">${link}</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  return {
    to: "",
    subject: `Restablecé tu contraseña · ${APP_NAME}`,
    text,
    html,
  };
}
