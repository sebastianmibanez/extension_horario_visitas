import { Redis } from '@upstash/redis';

/**
 * Registro de residentes del edificio.
 *
 * Auto-registro: cualquiera entra con Google y declara su depto, pero queda
 * en 'pendiente' hasta que un admin lo aprueba desde /admin.
 *
 * Ojo: acá NO se guardan visitas. El historial de cada residente vive en el
 * localStorage de su navegador, así que ningún vecino puede ver el del otro.
 */

export type Estado = 'pendiente' | 'aprobado';

export type Residente = {
  email: string;
  nombre: string;
  depto: string;
  estado: Estado;
  creadoEn: string;
};

// Cliente por llamada: es HTTP sin conexión persistente, y así el build no
// revienta cuando las env vars todavía no están.
function redis() {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) throw new Error('Falta configurar Upstash Redis');
  return new Redis({ url, token });
}

const key = (email: string) => `residente:${email.toLowerCase()}`;

const admins = (process.env.ADMIN_EMAILS ?? process.env.AUTHORIZED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export function esAdmin(email?: string | null) {
  return Boolean(email && admins.includes(email.toLowerCase()));
}

export async function getResidente(email?: string | null) {
  if (!email) return null;
  return redis().get<Residente>(key(email));
}

export async function registrar(email: string, nombre: string, depto: string) {
  const residente: Residente = {
    email: email.toLowerCase(),
    nombre,
    depto,
    // Los admins se auto-aprueban: si no, nadie podría aprobar al primero.
    estado: esAdmin(email) ? 'aprobado' : 'pendiente',
    creadoEn: new Date().toISOString(),
  };
  const db = redis();
  await db.set(key(residente.email), residente);
  await db.sadd('residentes', residente.email);
  return residente;
}

export async function listarResidentes(): Promise<Residente[]> {
  const db = redis();
  const emails = await db.smembers('residentes');
  if (emails.length === 0) return [];
  const rows = await db.mget<(Residente | null)[]>(...emails.map(key));
  return rows
    .filter((r): r is Residente => Boolean(r))
    .sort((a, b) => a.creadoEn.localeCompare(b.creadoEn));
}

export async function aprobar(email: string) {
  const residente = await getResidente(email);
  if (!residente) return;
  await redis().set(key(email), { ...residente, estado: 'aprobado' });
}

export async function eliminar(email: string) {
  const db = redis();
  await db.del(key(email));
  await db.srem('residentes', email.toLowerCase());
}
