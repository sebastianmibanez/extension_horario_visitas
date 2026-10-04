import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { mailConfigurado, sendMail } from '@/lib/gmail';
import { getResidente } from '@/lib/residentes';

// Usa APIs de Node (Buffer) para construir el mensaje MIME.
export const runtime = 'nodejs';

const escapar = (v: string) =>
  v.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export async function POST(request: Request) {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  // El depto y el nombre salen del registro, nunca del body: si no, cualquiera
  // le manda correos a conserjería firmando como el depto que se le ocurra.
  const residente = await getResidente(email);
  if (!residente || residente.estado !== 'aprobado') {
    return NextResponse.json({ error: 'Tu registro todavía no está aprobado.' }, { status: 403 });
  }

  if (!mailConfigurado()) {
    return NextResponse.json({ error: 'El sistema no está configurado correctamente.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { visitorName, visitorRut, licensePlate, sendToAdmin, entryTime } = body;

    if (!visitorName || !visitorRut) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const toAdmin = Boolean(sendToAdmin);
    if (toAdmin && !process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'El sistema no está configurado correctamente.' }, { status: 503 });
    }

    const fmt = (d: Date) =>
      d.toLocaleString('es-CL', {
        timeZone: 'America/Santiago',
        dateStyle: 'short',
        timeStyle: 'short',
      });

    const HORA = 60 * 60 * 1000;
    const now = new Date();
    // Hora de ingreso opcional (por si el correo se manda tarde). Más de 14 h
    // atrás ya no tiene sentido: la extensión completa terminó.
    const entryDate = entryTime ? new Date(entryTime) : now;
    const atras = now.getTime() - entryDate.getTime();
    if (Number.isNaN(atras) || atras < -5 * 60 * 1000 || atras > 14 * HORA) {
      return NextResponse.json(
        { error: 'La hora de ingreso tiene que ser de las últimas 14 horas.' },
        { status: 400 },
      );
    }
    const formattedTime = fmt(entryDate);
    const baseEnd = fmt(new Date(entryDate.getTime() + 5 * HORA));
    const extensionEnd = fmt(new Date(entryDate.getTime() + 14 * HORA));

    // Al enviar a admin va copia al residente (Gmail suprime CC al remitente).
    const recipient = toAdmin ? `${process.env.ADMIN_EMAIL}, ${email}` : email;

    const html = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <p>Hola Administración Mirador Casona,</p>
        <p>El residente <strong>${escapar(residente.nombre)}</strong> del depto <strong>${escapar(residente.depto)}</strong> envía este correo como respaldo por el uso de la extensión de horario para su visita:</p>

        <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
          <p style="margin: 8px 0;"><strong>Visita:</strong> ${escapar(visitorName)}</p>
          <p style="margin: 8px 0;"><strong>RUT:</strong> ${escapar(visitorRut)}</p>
          ${licensePlate ? `<p style="margin: 8px 0;"><strong>Patente Vehículo:</strong> ${escapar(licensePlate)}</p>` : ''}
          <p style="margin: 8px 0;"><strong>Hora de Entrada (${entryTime ? 'indicada por el residente' : 'Sistema'}):</strong> ${formattedTime}</p>
          <p style="margin: 8px 0;"><strong>Término 5 horas base:</strong> ${baseEnd}</p>
          <p style="margin: 8px 0;"><strong>Término Extensión:</strong> ${extensionEnd}</p>
        </div>

        <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
          Generado automáticamente por el sistema el ${fmt(now)} (hora de Santiago). Responder a este correo le llega directo al residente.
        </p>
      </div>
    `;

    const id = await sendMail({
      to: recipient,
      subject: 'Extension Horario Estacionamiento Visitas',
      html,
      fromName: `Depto ${residente.depto} · ${residente.nombre}`,
      replyTo: email,
    });

    return NextResponse.json({ success: true, id });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : JSON.stringify(error);
    console.error('Error Servidor:', msg);
    return NextResponse.json({ error: 'Error al enviar el correo.', detail: msg }, { status: 500 });
  }
}
