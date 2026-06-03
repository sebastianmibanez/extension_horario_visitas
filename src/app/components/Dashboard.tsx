'use client';

import { useState, useEffect } from 'react';

type Visit = {
  id: string;
  visitorName: string;
  licensePlate?: string;
  sentAt: string;
  sentTo: 'test' | 'admin';
};

const DEFAULT_VISITOR = {
  aptNumber: '215',
  residentName: 'Sebastian Miranda',
  visitorName: 'Constanza Mora',
  visitorRut: '16.479.210-2',
  licensePlate: 'LWXR50',
};

export default function Dashboard() {
  const [history, setHistory] = useState<Visit[]>([]);
  const [loading, setLoading] = useState<'test' | 'admin' | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('visitas-history');
    if (stored) setHistory(JSON.parse(stored));
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
        body: JSON.stringify({ ...DEFAULT_VISITOR, sendToAdmin }),
      });

      const data = await res.json();

      if (res.ok) {
        success = true;
        const newVisit: Visit = {
          id: Date.now().toString(),
          visitorName: DEFAULT_VISITOR.visitorName,
          licensePlate: DEFAULT_VISITOR.licensePlate,
          sentAt: new Date().toISOString(),
          sentTo: target,
        };
        const updated = [newVisit, ...history];
        setHistory(updated);
        localStorage.setItem('visitas-history', JSON.stringify(updated));
        setFeedback({ type: 'success', msg: sendToAdmin ? 'Correo enviado a Administración.' : 'Correo enviado a tu cuenta.' });
      } else {
        setFeedback({ type: 'error', msg: data.error || 'Error al enviar.' });
      }
    } catch {
      setFeedback({ type: 'error', msg: 'Error de conexión. Verifica que el servidor esté activo.' });
    } finally {
      setLoading(null);
      if (success) setTimeout(() => setFeedback(null), 4000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-8">

      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">Extensión Horario Visitas</h1>
        <p className="text-gray-400 text-sm mt-1">Depto 215 · Sebastian Miranda</p>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className={`text-sm text-center px-4 py-3 rounded-lg font-medium ${
          feedback.type === 'success'
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Quick access card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-4">Acceso Rápido</p>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-lg font-bold text-gray-900">{DEFAULT_VISITOR.visitorName}</p>
            <p className="text-sm text-gray-500 mt-1">RUT: {DEFAULT_VISITOR.visitorRut}</p>
            <p className="text-sm text-gray-500">Placa: {DEFAULT_VISITOR.licensePlate}</p>
          </div>
          <div className="flex flex-col gap-2 min-w-[180px]">
            <button
              onClick={() => send(false)}
              disabled={loading !== null}
              className="px-4 py-2 rounded-lg border-2 border-blue-600 text-blue-600 font-semibold text-sm hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading === 'test' ? 'Enviando...' : '📧 Enviar a mi correo'}
            </button>
            <button
              onClick={() => send(true)}
              disabled={loading !== null}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading === 'admin' ? 'Enviando...' : '🏢 Enviar a Administración'}
            </button>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Historial</p>
        </div>
        {history.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Sin registros aún.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Visitante</th>
                <th className="px-6 py-3 text-left font-semibold">Placa</th>
                <th className="px-6 py-3 text-left font-semibold">Fecha y hora</th>
                <th className="px-6 py-3 text-left font-semibold">Enviado a</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-3 font-medium text-gray-900">{v.visitorName}</td>
                  <td className="px-6 py-3 text-gray-500">{v.licensePlate || '—'}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {new Date(v.sentAt).toLocaleString('es-CL', {
                      timeZone: 'America/Santiago',
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      v.sentTo === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {v.sentTo === 'admin' ? 'Administración' : 'Mi correo'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-center text-xs text-gray-300">Depto 215 © 2026</p>
    </div>
  );
}
