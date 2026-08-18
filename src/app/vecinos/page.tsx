import type { Metadata } from 'next';
import Link from 'next/link';
import { EDIFICIO } from '@/lib/edificio';
import styles from './vecinos.module.css';

// CAMBIAR: links de invitación de WhatsApp (Info del grupo → Invitar por enlace → Copiar enlace)
const GRUPO_AVISOS = '#pegar-link-avisos';
const GRUPO_VENTAS = '#pegar-link-ventas';

// CAMBIAR: teléfonos reales
const CONSERJERIA = '+56 0 0000 0000';
const ADMINISTRACION = '+56 0 0000 0000';

export const metadata: Metadata = {
  title: 'Hablemos entre vecinos',
  description: 'Grupos de WhatsApp para avisos y para el día a día del edificio.',
};

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347M12.05 21.785h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413" />
    </svg>
  );
}

export default function Vecinos() {
  return (
    <div className={styles.page}>
      <main className={styles.sheet}>
        <header>
          <p className={styles.building}>{EDIFICIO}</p>
          <h1>
            Hablemos <em>entre vecinos</em>.
          </h1>
          <p className={styles.lede}>
            Dos grupos de WhatsApp para avisos y para el día a día del edificio. Sin reemplazar a
            la administración: para llegar a ella mejor organizados.
          </p>
        </header>

        <hr className={styles.rule} />

        <section>
          <p className={styles.eyebrow}>Trámites</p>

          <Link className={styles.card} href="/estacionamiento">
            <span className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" />
              </svg>
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardTitle}>Extensión de horario de visitas</span>
              <p className={styles.cardDesc}>
                Avisa a la administración las horas extra de estacionamiento de tu visita. Entrás con
                tu cuenta de Google.
              </p>
            </span>
            <span className={styles.cardArrow} aria-hidden="true">
              →
            </span>
          </Link>
        </section>

        <section>
          <p className={styles.eyebrow}>Grupos disponibles</p>

          <a className={styles.card} href={GRUPO_AVISOS}>
            <span className={styles.cardIcon}>
              <WhatsAppIcon />
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardTitle}>Avisos del edificio</span>
              <p className={styles.cardDesc}>
                Cortes de agua, alarmas, ascensores, mantenciones. Solo información.
              </p>
            </span>
            <span className={styles.cardArrow} aria-hidden="true">
              →
            </span>
          </a>

          <a className={styles.card} href={GRUPO_VENTAS}>
            <span className={styles.cardIcon}>
              <WhatsAppIcon />
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardTitle}>Ventas, permutas y ayudas</span>
              <p className={styles.cardDesc}>
                Compra y venta entre vecinos, préstamos, recomendaciones, encargos.
              </p>
            </span>
            <span className={styles.cardArrow} aria-hidden="true">
              →
            </span>
          </a>

          <a className={`${styles.card} ${styles.cardPending}`} href="#emergencia">
            <span className={styles.cardIcon}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 1 3 5v6c0 5.05 3.84 9.77 9 11 5.16-1.23 9-5.95 9-11V5zm-1 6h2v6h-2zm0 8h2v2h-2z" />
              </svg>
            </span>
            <span className={styles.cardBody}>
              <span className={styles.cardTitle}>Qué hacer ante una emergencia</span>
              <p className={styles.cardDesc}>
                Pasos básicos y contactos. En preparación con la administración.
              </p>
            </span>
            <span className={styles.cardArrow} aria-hidden="true">
              →
            </span>
          </a>
        </section>

        <hr className={styles.rule} />

        <section id="emergencia">
          <p className={styles.eyebrow}>Qué hacer ante una emergencia</p>
          <p className={styles.draftNote}>Borrador · pendiente de revisión</p>

          <details>
            <summary>Está sonando la alarma</summary>
            <ol>
              <li>
                Antes de bajar, revisa el grupo de Avisos: si es falsa alarma, probablemente ya
                está avisado ahí.
              </li>
              <li>
                Si no hay humo ni olor a quemado en tu piso, quédate en tu departamento. Bajar
                todos a conserjería no ayuda a apagarla más rápido.
              </li>
              <li>
                Si hay humo, olor a quemado o instrucción de evacuar: sal por la escalera, nunca
                por el ascensor.
              </li>
              <li>
                Publica en Avisos lo que viste en tu piso. Un dato concreto vale más que diez
                preguntas.
              </li>
            </ol>
          </details>

          <details>
            <summary>Hay que evacuar</summary>
            <ol>
              <li>
                Toca la puerta de tus vecinos de piso antes de bajar, sobre todo si hay adultos
                mayores o gente sola.
              </li>
              <li>Baja por la escalera. Si hay humo, mantente agachado y cerca del muro.</li>
              <li>
                Punto de reunión: <strong>por definir con la administración</strong>.
              </li>
              <li>No vuelvas a entrar hasta que Bomberos o la administración lo autoricen.</li>
            </ol>
          </details>

          <details>
            <summary>Sismo</summary>
            <ol>
              <li>
                Durante el movimiento: quédate adentro, lejos de ventanas y de cosas que puedan
                caer.
              </li>
              <li>Cuando pare: corta el gas y revisa si hay olor a gas antes de encender algo.</li>
              <li>
                Recién ahí evalúa si bajar. Las escaleras congestionadas durante una réplica son un
                riesgo.
              </li>
            </ol>
          </details>

          <details>
            <summary>Corte de agua, luz o ascensor</summary>
            <ol>
              <li>Revisa el grupo de Avisos antes de llamar a conserjería.</li>
              <li>Si nadie lo ha reportado, escríbelo tú en Avisos con hora y piso.</li>
              <li>
                Si alguien quedó atrapado en el ascensor: llama a conserjería de inmediato y avisa
                en el grupo.
              </li>
            </ol>
          </details>

          <div className={styles.contacts}>
            <a className={styles.contact} href={`tel:${CONSERJERIA.replace(/\s/g, '')}`}>
              <span className={styles.contactName}>
                Conserjería<small>Turno 24 horas</small>
              </span>
              <span className={styles.contactNum}>{CONSERJERIA}</span>
            </a>
            <a className={styles.contact} href={`tel:${ADMINISTRACION.replace(/\s/g, '')}`}>
              <span className={styles.contactName}>
                Administración<small>Horario hábil</small>
              </span>
              <span className={styles.contactNum}>{ADMINISTRACION}</span>
            </a>
            <a className={styles.contact} href="tel:132">
              <span className={styles.contactName}>Bomberos</span>
              <span className={styles.contactNum}>132</span>
            </a>
            <a className={styles.contact} href="tel:131">
              <span className={styles.contactName}>Ambulancia · SAMU</span>
              <span className={styles.contactNum}>131</span>
            </a>
            <a className={styles.contact} href="tel:133">
              <span className={styles.contactName}>Carabineros</span>
              <span className={styles.contactNum}>133</span>
            </a>
          </div>
        </section>

        <hr className={styles.rule} />

        <section>
          <p className={styles.eyebrow}>Cómo lo usamos</p>
          <ul className={styles.rules}>
            <li>
              <strong>Avisos</strong> es solo para información del edificio. Las conversaciones
              largas van al otro grupo.
            </li>
            <li>
              Si un tema requiere respuesta de la administración, lo conversamos aquí y enviamos{' '}
              <strong>un</strong> correo a nombre de todos.
            </li>
            <li>Nada de reclamos personales entre vecinos ni datos de terceros.</li>
            <li>Conserjería no administra estos grupos y no responde consultas por aquí.</li>
            <li>Entrar es voluntario y puedes salir cuando quieras. Nadie está obligado a estar.</li>
          </ul>
        </section>

        <footer className={styles.footer}>
          <p>
            Iniciativa de vecinos del edificio. No reemplaza los canales oficiales de la
            administración.
          </p>
          <p>Última actualización: agosto 2026.</p>
        </footer>
      </main>
    </div>
  );
}
