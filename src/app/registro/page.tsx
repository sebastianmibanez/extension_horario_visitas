import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import { EDIFICIO } from '@/lib/edificio';
import { mailConfigurado, sendMail } from '@/lib/gmail';
import { getResidente, registrar } from '@/lib/residentes';

export const metadata: Metadata = {
  title: 'registro',
};

const inputClass =
  'w-full px-3.5 py-2.5 bg-paper border border-line rounded-xl text-ink placeholder:text-ink-faint text-sm focus:border-pine focus:ring-1 focus:ring-pine focus:outline-none';

export default async function RegistroPage() {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) redirect('/');

  const yaRegistrado = await getResidente(email);
  if (yaRegistrado) redirect('/estacionamiento');

  async function crear(formData: FormData) {
    'use server';

    const sesion = await auth();
    const correo = sesion?.user?.email;
    if (!correo) redirect('/');

    const nombre = String(formData.get('nombre') ?? '').trim().slice(0, 60);
    const depto = String(formData.get('depto') ?? '').trim().slice(0, 10);
    if (!nombre || !depto) return;

    // Carrera improbable pero barata de cubrir: no pisar un registro ya aprobado.
    if (await getResidente(correo)) redirect('/estacionamiento');

    const residente = await registrar(correo, nombre, depto);

    if (residente.estado === 'pendiente' && process.env.ADMIN_EMAILS && mailConfigurado()) {
      try {
        await sendMail({
          to: process.env.ADMIN_EMAILS,
          subject: `Nuevo registro: depto ${residente.depto}`,
          html: `<p><strong>${residente.nombre}</strong> (depto ${residente.depto}, ${residente.email}) pidió acceso al portal.</p><p>Aprobar o rechazar en /admin.</p>`,
          fromName: 'Portal Vecinos',
        });
      } catch (e) {
        // Que no se caiga el registro por no poder avisar: queda en /admin igual.
        console.error('No se pudo avisar del registro:', e);
      }
    }

    redirect('/estacionamiento');
  }

  return (
    <main className="min-h-dvh flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm space-y-7">
        <div>
          <p className="font-serif italic text-ochre text-[0.95rem]">{EDIFICIO}</p>
          <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.015em] mt-2">
            Una vez y <em className="italic text-pine">listo</em>.
          </h1>
          <p className="text-ink-soft mt-3">
            Decinos quién sos y en qué depto vivís. La administración del portal lo revisa y quedás
            habilitado.
          </p>
        </div>

        <form action={crear} className="space-y-3">
          <input
            name="nombre"
            required
            maxLength={60}
            defaultValue={session?.user?.name ?? ''}
            placeholder="Nombre y apellido"
            className={inputClass}
          />
          <input name="depto" required maxLength={10} placeholder="Depto (ej: 215)" className={inputClass} />
          <button
            type="submit"
            className="w-full bg-pine text-paper font-semibold py-3 px-4 rounded-xl hover:bg-pine-soft transition"
          >
            Enviar registro
          </button>
        </form>

        <div className="flex items-center justify-between gap-3 text-xs text-ink-faint border-t border-line pt-4">
          <span className="truncate">{email}</span>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button type="submit" className="hover:text-danger transition whitespace-nowrap">
              Salir
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
