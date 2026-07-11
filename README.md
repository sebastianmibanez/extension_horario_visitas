# Extensión Horario Visitas

App interna (Depto 215) para notificar a la administración del condominio la **extensión de horario de estacionamiento** de una visita. Al enviar, registra la hora de entrada y calcula el término de las 5 horas base y de la extensión (14 horas totales), y envía el correo desde tu Gmail vía la **Gmail API (OAuth2)**.

Acceso protegido con **login de Google** (Auth.js) — solo los correos en `AUTHORIZED_EMAILS` pueden entrar.

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
| `AUTHORIZED_EMAILS` | Correos autorizados a iniciar sesión, separados por coma. |

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
3. En **Settings → Environment Variables** carga las 7 variables de la tabla de arriba (para *Production* y *Preview*).
4. Agrega el dominio de Vercel como Authorized redirect URI en Google Cloud Console (ver sección de arriba).
5. Deploy. Cada push a `main` genera un despliegue de producción.

> Nota: las credenciales de Google y `.env.local` **nunca** se suben al repo — están en `.gitignore`.
