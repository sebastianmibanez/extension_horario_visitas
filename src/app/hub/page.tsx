import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import Link from 'next/link';
import { auth, signOut } from '@/auth';
import { APPS } from '@/lib/apps';

// Hub personal, ajeno al portal de residentes: se muda a su propio proyecto.
export const metadata: Metadata = {
  title: 'SEB_OS',
};

// Época del sistema: desde acá se cuenta el UPTIME que muestra el header.
const BOOT_DATE = new Date('2026-06-02T00:00:00Z');

function uptime() {
  const ms = Date.now() - BOOT_DATE.getTime();
  const days = Math.floor(ms / 86_400_000);
  const hours = Math.floor((ms % 86_400_000) / 3_600_000);
  const mins = Math.floor((ms % 3_600_000) / 60_000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${days}d ${pad(hours)}:${pad(mins)}`;
}

const ASCII = `
███████╗███████╗██████╗
██╔════╝██╔════╝██╔══██╗
███████╗█████╗  ██████╔╝
╚════██║██╔══╝  ██╔══██╗
███████║███████╗██████╔╝
╚══════╝╚══════╝╚═════╝ `;

function SysRow({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <p className="whitespace-nowrap">
      <span className="text-[#47513f]">{label}</span>
      <span className="text-[#3f6f3f]"> : </span>
      <span className={accent ? 'text-[#a3e635]' : 'text-[#6f7d6b]'}>{value}</span>
    </p>
  );
}

export default async function Hub() {
  const session = await auth();
  if (!session?.user) redirect('/');

  const host = (await headers()).get('host') ?? 'localhost';

  return (
    <main className="terminal min-h-screen">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* SYS header */}
        <div className="flex justify-between gap-4 text-xs overflow-x-auto">
          <div className="space-y-1">
            <SysRow label="SYS.NAME" value="SEB_OS v1.0.0" />
            <SysRow label="SYS.AUTH" value="ACCESS_GRANTED" accent />
            <SysRow label="SYS.NODE" value={host} />
          </div>
          <div className="space-y-1 text-right">
            <SysRow label="UPTIME" value={uptime()} />
            <SysRow label="TERMINAL" value="TTY0" />
            <SysRow label="STATUS" value="200" accent />
          </div>
        </div>

        <div className="border-t border-[#1e2a1e]" />

        {/* ASCII */}
        <pre
          aria-label="SEB_OS"
          className="text-[#a3e635] text-[7px] sm:text-[11px] leading-tight overflow-x-auto"
        >
          {ASCII}
        </pre>

        {/* whoami */}
        <section className="space-y-2">
          <p className="text-sm">
            <span className="text-[#6cc46c]">$</span>{' '}
            <span className="text-[#bcc9b8]">whoami</span>
          </p>
          <p className="text-sm text-[#6f7d6b] leading-relaxed">
            {session.user.email} · depto 215.
            <br />
            Hub personal de proyectos. Cada app vive en su propio módulo.
          </p>
        </section>

        {/* ls apps */}
        <section className="space-y-3">
          <p className="text-sm">
            <span className="text-[#6cc46c]">$</span>{' '}
            <span className="text-[#bcc9b8]">ls apps</span>
          </p>

          <div className="space-y-1">
            {APPS.map((app) =>
              app.status === 'live' && app.href ? (
                <Link
                  key={app.id}
                  href={app.href}
                  className="group flex items-baseline gap-3 px-3 py-2 -mx-3 rounded-md hover:bg-[#101a10] transition"
                >
                  <span className="text-[#3f6f3f] group-hover:text-[#a3e635] transition">▸</span>
                  <span className="text-[#6cc46c] group-hover:text-[#a3e635] transition font-semibold text-sm">
                    {app.id}
                  </span>
                  <span className="flex-1 text-xs text-[#6f7d6b] truncate">{app.description}</span>
                  <span className="text-xs text-[#a3e635] whitespace-nowrap">[live]</span>
                </Link>
              ) : (
                <div
                  key={app.id}
                  className="flex items-baseline gap-3 px-3 py-2 -mx-3 opacity-50 cursor-not-allowed"
                >
                  <span className="text-[#3f6f3f]">▸</span>
                  <span className="text-[#6f7d6b] font-semibold text-sm">{app.id}</span>
                  <span className="flex-1 text-xs text-[#47513f] truncate">{app.description}</span>
                  <span className="text-xs text-[#47513f] whitespace-nowrap">[soon]</span>
                </div>
              )
            )}
          </div>
        </section>

        <div className="border-t border-[#1e2a1e]" />

        {/* Footer */}
        <div className="flex items-center justify-between text-xs text-[#47513f]">
          <span>{'// tip: click en una app para abrirla'}</span>
          <form
            action={async () => {
              'use server';
              await signOut({ redirectTo: '/' });
            }}
          >
            <button type="submit" className="text-[#6f7d6b] hover:text-[#ef6f5e] transition">
              [ logout ]
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
