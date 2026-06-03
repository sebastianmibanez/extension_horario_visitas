import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Remitente. En modo prueba (sin dominio verificado en Resend) DEBE ser onboarding@resend.dev.
// Cuando verifiques un dominio propio, cambia MAIL_FROM en Render por algo como:
//   Depto 215 <avisos@tudominio.cl>
const MAIL_FROM = process.env.MAIL_FROM || 'Depto 215 <onboarding@resend.dev>';

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    console.error('Variable de entorno RESEND_API_KEY no configurada');
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
    const baseEnd = fmt(new Date(entryDate.getTime() + 5 * HORA)); // 5 horas base
    const extensionEnd = fmt(new Date(entryDate.getTime() + 14 * HORA)); // 5 base + 9 extensión

    const toAdmin = Boolean(sendToAdmin);
    const recipient = toAdmin ? process.env.ADMIN_EMAIL : process.env.TEST_EMAIL;

    if (!recipient) {
      console.error(`Falta el correo destinatario (${toAdmin ? 'ADMIN_EMAIL' : 'TEST_EMAIL'})`);
      return NextResponse.json({ error: 'El sistema no está configurado correctamente.' }, { status: 503 });
    }

    const { data, error } = await resend.emails.send({
      from: MAIL_FROM,
      to: recipient,
      cc: toAdmin && process.env.TEST_EMAIL ? process.env.TEST_EMAIL : undefined,
      subject: 'Extensión Horario Estacionamiento Visitas',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px;">Extensión de Horario Estacionamiento Visitas</h2>
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
            Generado automáticamente por el sistema el ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    if (error) {
      console.error('Error Resend:', error);
      return NextResponse.json({ error: 'Error al enviar el correo.' }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id });
  } catch (error) {
    console.error('Error Servidor:', error);
    return NextResponse.json({ error: 'Error al enviar el correo.' }, { status: 500 });
  }
}
