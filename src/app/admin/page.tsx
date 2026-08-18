import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { refresh } from 'next/cache';
import Link from 'next/link';
import { auth } from '@/auth';
import { aprobar, eliminar, esAdmin, listarResidentes, type Residente } from '@/lib/residentes';

export const metadata: Metadata = {
  title: 'admin',
};

const eyebrow = 'text-[0.7rem] font-semibold tracking-[0.13em] uppercase text-ink-faint';

async function accion(formData: FormData) {
  'use server';

  const session = await auth();
  if (!esAdmin(session?.user?.email)) redirect('/');

  const email = String(formData.get('email') ?? '');
  if (!email) return;

  if (formData.get('accion') === 'aprobar') await aprobar(email);
  else await eliminar(email);

  refresh();
}

function Ficha({ residente, children }: { residente: Residente; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <div className="min-w-0">
        <p className="font-medium">
          Depto {residente.depto} · {residente.nombre}
        </p>
        <p className="text-xs text-ink-faint break-all">{residente.email}</p>
      </div>
      <div className="flex gap-2">{children}</div>
    </div>
  );
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/');
  if (!esAdmin(session.user.email)) redirect('/estacionamiento');

  const residentes = await listarResidentes();
  const pendientes = residentes.filter((r) => r.estado === 'pendiente');
  const aprobados = residentes.filter((r) => r.estado === 'aprobado');

  return (
    <main className="min-h-dvh">
      <div className="border-b border-line">
        <div className="max-w-xl mx-auto px-5 py-3 text-xs text-ink-faint">
          <Link href="/estacionamiento" className="hover:text-pine transition">
            ← Estacionamiento
          </Link>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-5 py-10 space-y-8">
        <div>
          <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.015em]">
            Quién <em className="italic text-pine">entra</em>.
          </h1>
          <p className="text-ink-soft mt-3">
            Aprobá solo a quien reconozcas: quien queda adentro puede escribirle a la administración
            a nombre de su depto.
          </p>
        </div>

        <section className="bg-card border border-line rounded-2xl p-6 space-y-5">
          <p className={eyebrow}>Pendientes ({pendientes.length})</p>
          {pendientes.length === 0 ? (
            <p className="text-sm text-ink-faint">Nada por revisar.</p>
          ) : (
            pendientes.map((r) => (
              <Ficha key={r.email} residente={r}>
                <form action={accion}>
                  <input type="hidden" name="email" value={r.email} />
                  <input type="hidden" name="accion" value="aprobar" />
                  <button className="px-3.5 py-2 rounded-xl bg-pine text-paper font-semibold text-xs hover:bg-pine-soft transition">
                    Aprobar
                  </button>
                </form>
                <form action={accion}>
                  <input type="hidden" name="email" value={r.email} />
                  <input type="hidden" name="accion" value="rechazar" />
                  <button className="px-3.5 py-2 rounded-xl border border-line text-danger font-semibold text-xs hover:border-danger transition">
                    Rechazar
                  </button>
                </form>
              </Ficha>
            ))
          )}
        </section>

        <section className="bg-card border border-line rounded-2xl p-6 space-y-5">
          <p className={eyebrow}>Aprobados ({aprobados.length})</p>
          {aprobados.length === 0 ? (
            <p className="text-sm text-ink-faint">Todavía nadie.</p>
          ) : (
            aprobados.map((r) => (
              <Ficha key={r.email} residente={r}>
                <form action={accion}>
                  <input type="hidden" name="email" value={r.email} />
                  <input type="hidden" name="accion" value="quitar" />
                  <button className="text-xs text-ink-faint hover:text-danger transition">Quitar</button>
                </form>
              </Ficha>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
