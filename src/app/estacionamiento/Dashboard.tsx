'use client';

import { useState, useEffect } from 'react';

type Visit = {
  id: string;
  visitorName: string;
  licensePlate?: string;
  sentAt: string;
  sentTo: 'test' | 'admin';
};

type VisitorInput = {
  visitorName: string;
  visitorRut: string;
  licensePlate?: string;
};

type LoadingState = 'test' | 'admin' | null;

const EMPTY_VISITOR: VisitorInput = { visitorName: '', visitorRut: '', licensePlate: '' };

const btnOutline =
  'px-4 py-2.5 rounded-xl border border-line text-ink font-semibold text-sm hover:border-pine-soft hover:text-pine transition disabled:opacity-40 disabled:cursor-not-allowed';
const btnFilled =
  'px-4 py-2.5 rounded-xl bg-pine text-paper font-semibold text-sm hover:bg-pine-soft transition disabled:opacity-40 disabled:cursor-not-allowed';
const card = 'bg-card border border-line rounded-2xl p-6';
const inputClass =
  'w-full px-3.5 py-2.5 bg-paper border border-line rounded-xl text-ink placeholder:text-ink-faint text-sm focus:border-pine focus:ring-1 focus:ring-pine focus:outline-none';
const eyebrow = 'text-[0.7rem] font-semibold tracking-[0.13em] uppercase text-ink-faint';

// "HH:MM" de hoy en hora local; si todavía no llega, fue ayer (entró 23:30, se avisa 00:10).
function entradaISO(hhmm: string) {
  const [h, m] = hhmm.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  if (d > new Date()) d.setDate(d.getDate() - 1);
  return d.toISOString();
}

export default function Dashboard({ depto, nombre }: { depto: string; nombre: string }) {
  const [history, setHistory] = useState<Visit[]>([]);
  const [loading, setLoading] = useState<LoadingState>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [visitor, setVisitor] = useState<VisitorInput>(EMPTY_VISITOR);
  const [entryTime, setEntryTime] = useState('');

  useEffect(() => {
    // Historial y última visita viven solo en este navegador: el servidor no
    // guarda visitas, así que ningún vecino ve las del otro.
    const stored = localStorage.getItem('visitas-history');
    const ultima = localStorage.getItem('ultima-visita');
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setHistory(JSON.parse(stored));
    if (ultima) setVisitor(JSON.parse(ultima));
  }, []);

  const send = async (sendToAdmin: boolean) => {
    const target = sendToAdmin ? 'admin' : 'test';
    setLoading(target);
    setFeedback(null);
    let success = false;

    try {
      const res = await fetch('/api/send-extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...visitor,
          sendToAdmin,
          entryTime: entryTime ? entradaISO(entryTime) : undefined,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        success = true;
        const newVisit: Visit = {
          id: Date.now().toString(),
          visitorName: visitor.visitorName,
          licensePlate: visitor.licensePlate,
          sentAt: new Date().toISOString(),
          sentTo: target,
        };
        const updated = [newVisit, ...history];
        setHistory(updated);
        localStorage.setItem('visitas-history', JSON.stringify(updated));
        // Se recuerda la última visita para no retipearla la próxima vez.
        localStorage.setItem('ultima-visita', JSON.stringify(visitor));
        setEntryTime('');
        setFeedback({
          type: 'success',
          msg: sendToAdmin ? 'Correo enviado a Administración.' : 'Correo enviado a tu cuenta.',
        });
      } else {
        setFeedback({ type: 'error', msg: data.error || 'Error al enviar.' });
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Error de conexión. Intentá nuevamente.' });
    } finally {
      setLoading(null);
      if (success) setTimeout(() => setFeedback(null), 4000);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('visitas-history');
  };

  const valido = visitor.visitorName.trim() !== '' && visitor.visitorRut.trim() !== '';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVisitor((prev) => ({
      ...prev,
      [name]: name === 'licensePlate' ? value.toUpperCase() : value,
    }));
  };

  const label = (target: 'test' | 'admin', text: string) =>
    loading === target ? 'Enviando…' : text;

  return (
    <div className="max-w-xl mx-auto px-5 py-10 space-y-8">
      <div>
        <h1 className="font-serif text-4xl leading-[1.08] tracking-[-0.015em]">
          Extensión de <em className="italic text-pine">horario</em>.
        </h1>
        <p className="text-ink-soft mt-3">
          Depto {depto} · {nombre}. El correo sale a nombre tuyo y la administración te responde
          directo.
        </p>
      </div>

      {feedback && (
        <p
          className={`text-sm px-4 py-3 rounded-xl border ${
            feedback.type === 'success'
              ? 'border-pine-soft/40 bg-pine/10 text-pine'
              : 'border-danger/40 bg-danger/10 text-danger'
          }`}
        >
          {feedback.msg}
        </p>
      )}

      <section className={card}>
        <p className={`${eyebrow} mb-4`}>Datos de la visita</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            name="visitorName"
            value={visitor.visitorName}
            onChange={handleChange}
            placeholder="Nombre del visitante"
            className={`${inputClass} sm:col-span-2`}
          />
          <input
            type="text"
            name="visitorRut"
            value={visitor.visitorRut}
            onChange={handleChange}
            placeholder="RUT (12.345.678-9)"
            className={inputClass}
          />
          <input
            type="text"
            name="licensePlate"
            value={visitor.licensePlate}
            onChange={handleChange}
            placeholder="Patente (opcional)"
            className={inputClass}
          />
          <label className="sm:col-span-2 flex items-center gap-3 text-sm text-ink-soft">
            <span className="whitespace-nowrap">Hora de ingreso (opcional)</span>
            <input
              type="time"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => send(false)}
            disabled={loading !== null || !valido}
            className={`flex-1 ${btnOutline}`}
          >
            {label('test', 'Enviar a mi correo')}
          </button>
          <button
            onClick={() => send(true)}
            disabled={loading !== null || !valido}
            className={`flex-1 ${btnFilled}`}
          >
            {label('admin', 'Enviar a Administración')}
          </button>
        </div>
        <p className="text-xs text-ink-faint mt-4">
          Si no indicás la hora de ingreso se usa la del envío. Desde ahí se calculan las 5 horas
          base y la extensión (14 en total).
        </p>
      </section>

      <section className="bg-card border border-line rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-line-soft flex items-center justify-between">
          <p className={eyebrow}>Historial</p>
          {history.length > 0 && (
            <button onClick={clearHistory} className="text-xs text-ink-faint hover:text-danger transition">
              Limpiar
            </button>
          )}
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-ink-faint text-center py-10">Todavía no enviaste ninguna.</p>
        ) : (
          <ul className="divide-y divide-line-soft">
            {history.map((v) => (
              <li key={v.id} className="px-6 py-4 flex items-baseline justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{v.visitorName}</p>
                  <p className="text-xs text-ink-faint">
                    {new Date(v.sentAt).toLocaleString('es-CL', {
                      timeZone: 'America/Santiago',
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                    {v.licensePlate ? ` · ${v.licensePlate}` : ''}
                  </p>
                </div>
                <span
                  className={`text-xs whitespace-nowrap px-2.5 py-1 rounded-full border ${
                    v.sentTo === 'admin'
                      ? 'border-pine-soft/50 text-pine'
                      : 'border-line text-ink-faint'
                  }`}
                >
                  {v.sentTo === 'admin' ? 'Administración' : 'Mi correo'}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="text-xs text-ink-faint">
        El historial se guarda solo en este navegador. Ningún vecino ve tus visitas.
      </p>
    </div>
  );
}
