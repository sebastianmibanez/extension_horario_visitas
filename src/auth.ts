import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/' },
  callbacks: {
    // Entra cualquier cuenta de Google verificada: el filtro real es el
    // registro de residentes (src/lib/residentes.ts), que exige aprobación
    // antes de dejar mandar correos a la administración.
    async signIn({ user, profile }) {
      const email = (profile?.email ?? user.email ?? '').toLowerCase();
      if (!email) return false;
      if (profile?.email_verified === false) return false;
      return true;
    },
  },
});
