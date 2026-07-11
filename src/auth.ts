import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

const authorizedEmails = (process.env.AUTHORIZED_EMAILS ?? '')
  .split(',')
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  callbacks: {
    async signIn({ user, profile }) {
      const email = (profile?.email ?? user.email ?? '').toLowerCase();
      if (!email || !authorizedEmails.includes(email)) return false;
      if (profile?.email_verified === false) return false;
      return true;
    },
  },
});
