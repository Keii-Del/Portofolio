// Layer 8: Role-Based Access Control helpers.
// Server-side guard. UI hide ≠ security; always re-check at server.

import { auth } from "@/lib/auth";
import type { Role } from "@prisma/client";
import { redirect } from "next/navigation";

export type SessionUser = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
};

const RANK: Record<Role, number> = {
  VIEWER: 0,
  EDITOR: 1,
  ADMIN: 2,
};

/** Throw (redirect ke /login) kalau belum login. */
export async function requireAuth(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  return session.user as SessionUser;
}

/** Throw kalau role kurang. Redirect ke /admin kalau login tapi insufficient. */
export async function requireRole(min: Role): Promise<SessionUser> {
  const user = await requireAuth();
  if (RANK[user.role] < RANK[min]) redirect("/admin?error=forbidden");
  return user;
}

/** Non-throwing check untuk API routes (return Response). */
export async function checkRole(min: Role): Promise<
  | { ok: true; user: SessionUser }
  | { ok: false; response: Response }
> {
  const session = await auth();
  const user = session?.user as SessionUser | undefined;

  if (!user?.id) {
    return {
      ok: false,
      response: Response.json({ error: "unauthorized" }, { status: 401 }),
    };
  }

  if (RANK[user.role] < RANK[min]) {
    return {
      ok: false,
      response: Response.json({ error: "forbidden" }, { status: 403 }),
    };
  }

  return { ok: true, user };
}

export function hasRole(user: { role: Role } | null | undefined, min: Role): boolean {
  if (!user) return false;
  return RANK[user.role] >= RANK[min];
}
