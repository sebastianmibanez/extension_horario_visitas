'use client';

import { useState } from 'react';

export default function ExtensionForm() {
  const [formData, setFormData] = useState({
    aptNumber: '',
    residentName: '',
    visitorName: '',
    visitorRut: '',
    licensePlate: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'licensePlate' ? value.toUpperCase() : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/send-extension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setMessage('Solicitud enviada con éxito. La administración ha sido notificada.');
        setFormData({
          aptNumber: '', residentName: '', visitorName: '', visitorRut: '', licensePlate: '',
        });
      } else {
        setStatus('error');
        setMessage(data.error || 'Hubo un error al enviar la solicitud.');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error de conexión. Intenta nuevamente.');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-xl text-center">
        <h2 className="text-xl font-bold mb-2">¡Éxito!</h2>
        <p>{message}</p>
        <button 
          onClick={() => setStatus('idle')}
          className="mt-4 text-green-600 underline font-medium"
        >
          Enviar otra solicitud
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Número de Apto *</label>
          <input
            type="text"
            name="aptNumber"
            required
            value={formData.aptNumber}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Ej: 4B"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Residente *</label>
          <input
            type="text"
            name="residentName"
            required
            value={formData.residentName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Juan Pérez"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Visitante *</label>
          <input
            type="text"
            name="visitorName"
            required
            value={formData.visitorName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">RUT Visitante *</label>
          <input
            type="text"
            name="visitorRut"
            required
            value={formData.visitorRut}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="12.345.678-9"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Placa Vehículo <span className="text-gray-400 font-normal">(opcional)</span></label>
          <input
            type="text"
            name="licensePlate"
            value={formData.licensePlate}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="ABCD12"
          />
        </div>
      </div>
      
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 text-sm text-blue-800">
        <p><strong>Nota:</strong> Al enviar, el sistema registrará la hora exacta y solicitará automáticamente la extensión de 9 horas adicionales a las 5 horas base (total: 14 horas) a la administración.</p>
      </div>

      {status === 'error' && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-sm text-center">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={status === 'loading'}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
      >
        {status === 'loading' ? 'Enviando solicitud...' : 'Avisar a Administración y Registrar Entrada'}
      </button>
    </form>
  );
}
