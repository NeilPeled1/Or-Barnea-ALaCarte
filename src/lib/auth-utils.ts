import { auth } from "./auth";

export async function getSession() {
  return auth();
}

export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireRole(allowedRoles: string[]) {
  const session = await requireAuth();
  if (!allowedRoles.includes(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}

export function canAccessProject(session: { user: { role: string; organizationId?: string | null } }, projectOrgId: string) {
  if (session.user.role === "ADMIN") return true;
  if (session.user.role === "CLIENT" && session.user.organizationId === projectOrgId) return true;
  return false;
}
