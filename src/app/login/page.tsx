import { signIn } from '@/auth';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center space-y-6">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900">Extensión Horario Visitas</h1>
          <p className="text-gray-400 text-sm mt-1">Depto 215</p>
        </div>
        {error && (
          <div className="text-sm text-center px-4 py-3 rounded-lg font-medium bg-red-50 border border-red-200 text-red-700">
            Tu cuenta de Google no tiene acceso a esta app.
          </div>
        )}
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/' });
          }}
        >
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            Iniciar sesión con Google
          </button>
        </form>
      </div>
    </main>
  );
}
