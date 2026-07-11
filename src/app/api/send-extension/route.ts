import { NextResponse } from 'next/server';

// Usa APIs de Node (Buffer) para construir el mensaje MIME.
export const runtime = 'nodejs';

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

export async function POST(request: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REFRESH_TOKEN) {
    return NextResponse.json({ error: 'El sistema no está configurado correctamente.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { aptNumber, residentName, visitorName, visitorRut, licensePlate, sendToAdmin } = body;

    if (!aptNumber || !residentName || !visitorName || !visitorRut) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const fmt = (d: Date) =>
      d.toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'short',
        timeStyle: 'short',
      });

    const HORA = 60 * 60 * 1000;
    const entryDate = new Date();
    const formattedTime = fmt(entryDate);
    const baseEnd = fmt(new Date(entryDate.getTime() + 5 * HORA));
    const extensionEnd = fmt(new Date(entryDate.getTime() + 14 * HORA));

    const toAdmin = Boolean(sendToAdmin);

    if (!process.env.TEST_EMAIL || (toAdmin && !process.env.ADMIN_EMAIL)) {
      return NextResponse.json({ error: 'El sistema no está configurado correctamente.' }, { status: 503 });
    }

    // Al enviar a admin, ambos van en To: (Gmail suprime CC al propio remitente)
    const recipient = toAdmin
      ? `${process.env.ADMIN_EMAIL}, ${process.env.TEST_EMAIL}`
      : process.env.TEST_EMAIL!;

    const subject = 'Extension Horario Estacionamiento Visitas';
    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hola Administración Mirador Casona,</p>
        <p>El residente <strong>${residentName}</strong> del depto <strong>${aptNumber}</strong> envía este correo como respaldo por el uso de la extensión de horario para su visita:</p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 8px 0;"><strong>Visita:</strong> ${visitorName}</p>
          <p style="margin: 8px 0;"><strong>RUT:</strong> ${visitorRut}</p>
          ${licensePlate ? `<p style="margin: 8px 0;"><strong>Patente Vehículo:</strong> ${licensePlate}</p>` : ''}
          <p style="margin: 8px 0;"><strong>Hora de Entrada (Sistema):</strong> ${formattedTime}</p>
          <p style="margin: 8px 0;"><strong>Término 5 horas base:</strong> ${baseEnd}</p>
          <p style="margin: 8px 0;"><strong>Término Extensión:</strong> ${extensionEnd}</p>
        </div>

        <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          Generado automáticamente por el sistema el ${formattedTime} (hora de Santiago)
        </p>
      </div>
    `;

    const headers = [
      `From: Depto 215 <${process.env.TEST_EMAIL}>`,
      `To: ${recipient}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
    ];

    const rawMessage = [...headers, '', html].join('\r\n');
    const encodedMessage = Buffer.from(rawMessage).toString('base64url');

    const accessToken = await getAccessToken();

    const gmailRes = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw: encodedMessage }),
    });

    const gmailData = await gmailRes.json();

    if (!gmailRes.ok) {
      console.error('Error Gmail API:', gmailData);
      return NextResponse.json({ error: 'Error al enviar el correo.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: gmailData.id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error Servidor:', msg);
    return NextResponse.json({ error: 'Error al enviar el correo.', detail: msg }, { status: 500 });
  }
}
