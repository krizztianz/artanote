import type { NextAuthConfig } from "next-auth";

/**
 * Edge-safe NextAuth config (no Prisma/bcrypt imports) so it can be used
 * directly inside middleware without pulling Node-only dependencies into
 * the Edge runtime bundle. The full config with the Credentials provider
 * and Prisma adapter lives in `auth.ts`.
 */
export const authConfig = {
  // Required outside of Vercel (e.g. self-hosted Docker) so NextAuth trusts
  // the Host header instead of rejecting requests with UntrustedHost.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
