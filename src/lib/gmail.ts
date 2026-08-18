/**
 * Envío de correo por Gmail API con un refresh token de larga duración.
 *
 * Importante: Gmail manda SIEMPRE desde la cuenta dueña del refresh token.
 * MAIL_FROM tiene que ser esa misma dirección; lo único libre es el nombre
 * visible (fromName) y el Reply-To, que es como logramos que conserjería vea
 * de qué depto viene el correo y le responda al vecino y no a la cuenta.
 */

type Mail = {
  to: string;
  subject: string;
  html: string;
  fromName: string;
  replyTo?: string;
};

async function getAccessToken(): Promise<string> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN!,
      grant_type: 'refresh_token',
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(`OAuth error: ${data.error} - ${data.error_description}`);
  return data.access_token as string;
}

export function mailConfigurado() {
  return Boolean(
    process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET &&
      process.env.GOOGLE_REFRESH_TOKEN &&
      (process.env.MAIL_FROM ?? process.env.TEST_EMAIL),
  );
}

// El display name va en una cabecera: sin saltos de línea no hay inyección.
const limpiar = (v: string) => v.replace(/[\r\n]/g, ' ').trim();

// Las cabeceras MIME son ASCII puro: un "Sebastián" o un "·" crudos llegan
// como mojibake. RFC 2047 los manda en base64 y el cliente los decodifica.
function cabecera(valor: string) {
  const limpio = limpiar(valor);
  if (/^[\x20-\x7e]*$/.test(limpio)) return limpio;
  return `=?UTF-8?B?${Buffer.from(limpio, 'utf8').toString('base64')}?=`;
}

export async function sendMail({ to, subject, html, fromName, replyTo }: Mail) {
  const from = process.env.MAIL_FROM ?? process.env.TEST_EMAIL!;

  const headers = [
    `From: ${cabecera(fromName)} <${from}>`,
    `To: ${limpiar(to)}`,
    ...(replyTo ? [`Reply-To: ${limpiar(replyTo)}`] : []),
    `Subject: ${cabecera(subject)}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
  ];

  const raw = Buffer.from([...headers, '', html].join('\r\n')).toString('base64url');
  const accessToken = await getAccessToken();

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw }),
  });

  const data = await res.json();
  if (!res.ok) {
    console.error('Error Gmail API:', data);
    throw new Error(data?.error?.message ?? 'Error al enviar el correo.');
  }
  return data.id as string;
}
