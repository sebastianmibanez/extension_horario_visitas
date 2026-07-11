# Extensión Horario Visitas

App interna (Depto 215) para notificar a la administración del condominio la **extensión de horario de estacionamiento** de una visita. Al enviar, registra la hora de entrada y calcula el término de las 5 horas base y de la extensión (14 horas totales), y envía el correo desde tu Gmail vía la **Gmail API (OAuth2)**.

Construido con **Next.js 16** (App Router) + **React 19** + **Tailwind CSS 4**.

## Requisitos

- Node.js **20.9+**
- Una app de Google Cloud con la **Gmail API** habilitada y un refresh token con scope `gmail.send`.

## Variables de entorno

Copia `.env.example` a `.env.local` y complétalas (ninguna se commitea):

| Variable | Descripción |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Client ID del cliente OAuth 2.0. |
| `GOOGLE_CLIENT_SECRET` | Client secret del cliente OAuth 2.0. |
| `GOOGLE_REFRESH_TOKEN` | Refresh token con scope `https://www.googleapis.com/auth/gmail.send`. |
| `TEST_EMAIL` | Tu Gmail: remitente y copia en los envíos a administración. |
| `ADMIN_EMAIL` | Correo de la administración. |

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Deploy en Vercel

1. Sube el repo a GitHub (ya está en `origin`).
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio. Vercel detecta Next.js automáticamente (no hace falta configurar build ni output).
3. En **Settings → Environment Variables** carga las 5 variables de la tabla de arriba (para *Production* y *Preview*).
4. Deploy. Cada push a `main` genera un despliegue de producción.

> Nota: las credenciales de Google (`client_secret_*.json` y `.env.local`) **nunca** se suben al repo — están en `.gitignore`.
