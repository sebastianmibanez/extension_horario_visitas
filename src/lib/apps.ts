/**
 * Registro de apps que cuelgan del hub (SEB_OS).
 *
 * Para sumar un proyecto nuevo:
 *   1. Agrega una entrada acá con status 'live' y su `href`.
 *   2. Crea la ruta correspondiente en `src/app/<id>/page.tsx`.
 *
 * Las entradas con status 'soon' se listan pero no son clickeables.
 */

export type AppStatus = 'live' | 'soon';

export type AppEntry = {
  id: string;
  description: string;
  status: AppStatus;
  href?: string;
};

export const APPS: AppEntry[] = [
  {
    id: 'estacionamiento',
    description: 'extensión horario visitas · depto 215',
    status: 'live',
    href: '/estacionamiento',
  },
  {
    id: 'vecinos',
    description: 'grupos de whatsapp y emergencias · página pública',
    status: 'live',
    href: '/vecinos',
  },
  {
    id: '...',
    description: 'próximo proyecto',
    status: 'soon',
  },
];
