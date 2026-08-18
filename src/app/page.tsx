import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth, signIn } from '@/auth';
import { EDIFICIO } from '@/lib/edificio';

export default async function Entrada({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  // Quien ya tiene sesión no ve la puerta: derecho a lo suyo.
  const session = await auth();
  if (session?.user) redirect('/estacionamiento');

  const { error } = await searchParams;

  return (
    <main className="min-h-dvh flex items-center justify-center px-5 py-10">
      <div className="w-full max-w-sm space-y-7">
        <div>
          <p className="font-serif italic text-ochre text-[0.95rem]">{EDIFICIO}</p>
          <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.015em] mt-2">
            Portal de <em className="italic text-pine">residentes</em>.
          </h1>
          <p className="text-ink-soft mt-3">
            Entrá con tu cuenta de Google para avisar la extensión de horario de tus visitas.
          </p>
        </div>

        {error && (
          <p className="text-sm rounded-xl border border-danger/40 bg-danger/10 text-danger px-4 py-3">
            No pudimos validar tu cuenta de Google. Intentá de nuevo.
          </p>
        )}

        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/estacionamiento' });
          }}
        >
          <button
            type="submit"
            className="w-full bg-pine text-paper font-semibold py-3 px-4 rounded-xl hover:bg-pine-soft transition"
          >
            Continuar con Google
          </button>
        </form>

        <p className="text-sm text-ink-soft">
          ¿Buscabas los grupos de WhatsApp o los teléfonos de emergencia?{' '}
          <Link href="/vecinos" className="text-pine underline underline-offset-4">
            Están acá, sin cuenta
          </Link>
          .
        </p>
      </div>
    </main>
  );
}
