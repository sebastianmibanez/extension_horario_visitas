import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { esAdmin, getResidente } from '@/lib/residentes';
import Dashboard from './Dashboard';

export const metadata: Metadata = {
  title: 'estacionamiento',
};

export default async function EstacionamientoPage() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const residente = await getResidente(session.user.email);
  if (!residente) redirect('/registro');

  return (
    <main className="min-h-dvh">
      <div className="border-b border-line">
        <div className="max-w-xl mx-auto px-5 py-3 flex items-center justify-between gap-3 text-xs text-ink-faint">
          <Link href="/vecinos" className="hover:text-pine transition">
            ← Vecinos
          </Link>
          <div className="flex items-center gap-4">
            {esAdmin(session.user.email) && (
              <Link href="/admin" className="hover:text-pine transition">
                Admin
              </Link>
            )}
            <span className="hidden sm:inline truncate max-w-[16rem]">{session.user.email}</span>
            <form
              action={async () => {
                'use server';
                await signOut({ redirectTo: '/' });
              }}
            >
              <button type="submit" className="hover:text-danger transition">
                Salir
              </button>
            </form>
          </div>
        </div>
      </div>

      {residente.estado === 'aprobado' ? (
        <Dashboard depto={residente.depto} nombre={residente.nombre} />
      ) : (
        <div className="max-w-xl mx-auto px-5 py-12 space-y-4">
          <h1 className="font-serif text-3xl leading-[1.1]">
            Registro <em className="italic text-ochre">pendiente</em>.
          </h1>
          <p className="text-ink-soft">
            Pediste acceso como depto {residente.depto}. Cuando la administración del portal lo
            apruebe vas a poder enviar solicitudes desde acá.
          </p>
          <p className="text-sm text-ink-faint">
            Mientras tanto,{' '}
            <Link href="/vecinos" className="text-pine underline underline-offset-4">
              los grupos y los teléfonos de emergencia
            </Link>{' '}
            están abiertos.
          </p>
        </div>
      )}
    </main>
  );
}
