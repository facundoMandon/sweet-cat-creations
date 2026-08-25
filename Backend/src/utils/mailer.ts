import { Resend } from "resend";

/**
 * Envío de emails mediante la API HTTP de Resend.
 * Configuración por variables de entorno:
 *   RESEND_API_KEY, MAIL_FROM, APP_NAME
 * Si falta configuración, el envío no rompe la app: se loguea y se avisa.
 */

let resend: Resend | null = null;

export function mailerConfigurado(): boolean {
  return Boolean(process.env["RESEND_API_KEY"]);
}

function getResend(): Resend | null {
  if (!mailerConfigurado()) return null;
  if (resend) return resend;
  resend = new Resend(process.env["RESEND_API_KEY"]);
  console.log("[mailer] Cliente Resend inicializado", {
    from: process.env["MAIL_FROM"] ?? "onboarding@resend.dev",
  });
  return resend;
}

export interface MailInput {
  to: string;
  subject: string;
  html: string;
  text: string;
}

/** Devuelve true si Resend aceptó el email; false si falta config o falló. */
export async function sendMail(input: MailInput): Promise<boolean> {
  const client = getResend();

  if (!client) {
    console.warn("[mailer] Resend no configurado: no se envió el email a", input.to);
    return false;
  }

  try {
    console.log("[mailer] Enviando email mediante Resend...");

    const { data, error } = await client.emails.send({
      from: process.env["MAIL_FROM"] ?? "onboarding@resend.dev",
      to: [input.to],
      subject: input.subject,
      text: input.text,
      html: input.html,
    });

    if (error) {
      console.error("[mailer] Error de Resend:", error);
      return false;
    }

    console.log("[mailer] Email enviado correctamente:", data?.id);
    return true;
  } catch (err) {
    console.error("[mailer] Error de Resend:", err);
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
