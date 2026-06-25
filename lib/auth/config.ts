// Edge-safe auth config — used by middleware.
// No bcrypt import (edge runtime incompatible).

import type { NextAuthConfig } from "next-auth";

export const authConfig: NextAuthConfig = {
  session: { strategy: "jwt" },
  pages: { signIn: "/admin/login" },
  // Providers defined in full config (lib/auth/index.ts) — middleware doesn't need them.
  providers: [],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = (user as { id: string }).id;
        token.role = (user as { role: "ADMIN" | "EDITOR" | "VIEWER" }).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "ADMIN" | "EDITOR" | "VIEWER";
      }
      return session;
    },
  },
};