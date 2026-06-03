import ExtensionForm from "./components/ExtensionForm";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">
              Extensión de Horario de Visitas
            </h1>
            <p className="text-gray-500">
              Completa los datos para solicitar la extensión de horario (5 horas base + 9 horas adicionales = 14 horas totales).
            </p>
          </div>
          
          <ExtensionForm />
        </div>
        
        <p className="text-center text-xs text-gray-400 mt-8">
          Sistema CondoVisit © 2026
        </p>
      </div>
    </main>
  );
}
