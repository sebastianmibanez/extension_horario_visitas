import { redirect } from 'next/navigation';
import { auth, signOut } from '@/auth';
import Dashboard from './components/Dashboard';

export default async function Home() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-4 flex items-center justify-end gap-3 text-xs text-gray-400">
        <span>{session.user.email}</span>
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
        >
          <button type="submit" className="hover:text-red-600 transition font-medium">
            Cerrar sesión
          </button>
        </form>
      </div>
      <Dashboard />
    </main>
  );
}
