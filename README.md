# Extensión Horario Visitas

Portal de residentes del edificio **Mirador Casona**. Permite avisar a la administración la **extensión de horario de estacionamiento** de una visita: registra la hora de entrada, calcula el término de las 5 horas base y de la extensión (14 horas totales), y envía el correo vía la **Gmail API (OAuth2)**. Incluye una página pública (`/vecinos`) con los grupos de WhatsApp del edificio y los contactos de emergencia.

Acceso con **login de Google** (Auth.js) y **auto-registro**: cualquier vecino entra con su cuenta y declara su depto, pero queda `pendiente` hasta que un admin lo aprueba en `/admin`. El registro vive en **Upstash Redis**; las visitas no se guardan en el servidor (el historial es del `localStorage` de cada navegador, así que nadie ve las visitas de otro).

Los correos salen siempre desde la cuenta dueña del refresh token (`MAIL_FROM`), con el nombre visible `Depto X · Nombre` y `Reply-To` del residente, para que conserjería sepa de quién viene y le responda a él.

Construido con **Next.js 16** (App Router) + **React 19** + **Tailwind CSS 4**.

## Requisitos

- Node.js **20.9+**
- Una app de Google Cloud con la **Gmail API** habilitada y un refresh token con scope `gmail.send`.
- Un cliente OAuth 2.0 de tipo **"Web application"** en el mismo proyecto de Google Cloud, para el login (puede ser el mismo cliente de arriba si ya es tipo "Web", o uno nuevo dedicado).

## Variables de entorno

Copia `.env.example` a `.env.local` y complétalas (ninguna se commitea):

| Variable | Descripción |
| --- | --- |
| `GOOGLE_CLIENT_ID` | Client ID del cliente OAuth 2.0 (envío de correo). |
| `GOOGLE_CLIENT_SECRET` | Client secret del cliente OAuth 2.0 (envío de correo). |
| `GOOGLE_REFRESH_TOKEN` | Refresh token con scope `https://www.googleapis.com/auth/gmail.send`. |
| `TEST_EMAIL` | Tu Gmail: remitente y copia en los envíos a administración. |
| `ADMIN_EMAIL` | Correo de la administración. |
| `AUTH_SECRET` | Clave para firmar la sesión de login. Generar con `npx auth secret`. |
| `AUTHORIZED_EMAILS` | Histórica: ya no filtra el login, solo sirve de fallback de `ADMIN_EMAILS`. |
| `ADMIN_EMAILS` | Correos que pueden aprobar registros en `/admin`, separados por coma. |
| `MAIL_FROM` | Dirección remitente. Debe ser la cuenta dueña de `GOOGLE_REFRESH_TOKEN`. |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis (Vercel → Storage). Registro de residentes. |
| `UPSTASH_REDIS_REST_TOKEN` | Token del mismo store. |

### Configurar el login en Google Cloud Console

En [console.cloud.google.com](https://console.cloud.google.com) → APIs & Services → Credentials, en el cliente OAuth 2.0 que uses para el login, agrega como **Authorized redirect URI**:

- `http://localhost:3000/api/auth/callback/google` (desarrollo)
- `https://<tu-dominio-vercel>/api/auth/callback/google` (producción)

Si el cliente existente es de tipo "Desktop app" (no permite agregar redirect URIs), crea uno nuevo de tipo "Web application" solo para el login, y usa su client ID/secret en vez de `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` en `src/auth.ts`.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Deploy en Vercel

1. Sube el repo a GitHub (ya está en `origin`).
2. En [vercel.com/new](https://vercel.com/new) importa el repositorio. Vercel detecta Next.js automáticamente (no hace falta configurar build ni output).
3. En **Settings → Environment Variables** carga todas las variables de la tabla de arriba (para *Production* y *Preview*).
4. Agrega el dominio de Vercel como Authorized redirect URI en Google Cloud Console (ver sección de arriba).
5. Deploy. Cada push a `main` genera un despliegue de producción.

> Nota: las credenciales de Google y `.env.local` **nunca** se suben al repo — están en `.gitignore`.
