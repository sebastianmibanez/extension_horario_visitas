import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(request: Request) {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
    console.error('Variables de entorno GMAIL_USER o GMAIL_APP_PASSWORD no configuradas');
    return NextResponse.json({ error: 'El sistema no está configurado correctamente. Contacta al administrador.' }, { status: 503 });
  }

  if (!process.env.ADMIN_EMAIL) {
    console.error('Variable de entorno ADMIN_EMAIL no configurada');
    return NextResponse.json({ error: 'El sistema no está configurado correctamente. Contacta al administrador.' }, { status: 503 });
  }

  try {
    const body = await request.json();
    const { aptNumber, residentName, visitorName, visitorRut, licensePlate } = body;

    if (!aptNumber || !residentName || !visitorName || !visitorRut) {
      return NextResponse.json({ error: 'Faltan campos obligatorios' }, { status: 400 });
    }

    const entryTime = new Date();

    const formattedTime = entryTime.toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      dateStyle: 'short',
      timeStyle: 'short',
    });

    const isTestMode = process.env.TEST_MODE === 'true';
    const recipient = isTestMode ? process.env.GMAIL_USER! : process.env.ADMIN_EMAIL!;

    await transporter.sendMail({
      from: `"Extension Horario Visitas" <${process.env.GMAIL_USER}>`,
      to: recipient,
      cc: isTestMode ? undefined : process.env.GMAIL_USER,
      subject: `🚗 Extensión Estac. - Apto ${aptNumber}${licensePlate ? ` - Placa ${licensePlate}` : ''}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #eee; padding-bottom: 10px;">Solicitud de Extensión de Estacionamiento</h2>
          <p>Hola Administración,</p>
          <p>El residente <strong>${residentName}</strong> del apartamento <strong>${aptNumber}</strong> ha notificado el uso de la extensión de horario para su visita.</p>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb;">
            <h3 style="margin-top: 0; color: #1f2937;">📋 Detalles del Registro:</h3>
            <p style="margin: 8px 0;"><strong>Visitante:</strong> ${visitorName}</p>
            <p style="margin: 8px 0;"><strong>RUT:</strong> ${visitorRut}</p>
            ${licensePlate ? `<p style="margin: 8px 0;"><strong>Vehículo (Placa):</strong> ${licensePlate}</p>` : ''}
            <p style="margin: 8px 0;"><strong>Hora de Entrada (Sistema):</strong> ${formattedTime}</p>
          </div>

          <div style="background-color: #eff6ff; border-left: 4px solid #2563eb; padding: 15px; margin-top: 20px;">
            <p style="margin: 0; font-size: 16px;"><strong>Solicitud:</strong> Extensión de 9 horas adicionales a las 5 horas base.<br/>
            <strong>Tiempo total autorizado:</strong> 14 horas desde la hora de entrada registrada.</p>
          </div>

          <p style="font-size: 12px; color: #9ca3af; margin-top: 30px; text-align: center; border-top: 1px solid #eee; padding-top: 20px;">
            Generado automáticamente por el sistema el ${new Date().toISOString()}
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error Servidor:', error);
    return NextResponse.json({ error: 'Error al enviar el correo' }, { status: 500 });
  }
}
