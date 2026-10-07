import type { NextAuthConfig } from "next-auth";
import type { Role } from "@prisma/client";

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
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = user.role;
        token.mustChangePassword = user.mustChangePassword;
      }
      // Triggered by the client calling `update()` (next-auth/react) after a
      // successful password change, so the JWT reflects the new
      // `mustChangePassword` value without needing a DB call here (this
      // config must stay Edge-safe for use in middleware).
      if (trigger === "update" && session && typeof session.mustChangePassword === "boolean") {
        token.mustChangePassword = session.mustChangePassword;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? "USER";
        session.user.mustChangePassword = !!token.mustChangePassword;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
