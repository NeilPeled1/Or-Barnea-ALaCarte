import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHEFFIELD_MENUS } from "@/data/sheffield-parsed";
import { ESTHER_MENUS } from "@/data/esther-parsed";
import { MenusPageClient } from "./menus-page-client";

export default async function MenusPage() {
  const session = await auth();
  if (!session?.user) return null;

  const where =
    session.user.role === "ADMIN"
      ? {}
      : session.user.organizationId
        ? { project: { organizationId: session.user.organizationId } }
        : { projectId: { in: [] } };

  let dbMenus: Awaited<ReturnType<typeof prisma.menu.findMany>> = [];
  try {
    dbMenus = await prisma.menu.findMany({
      where,
      include: {
        project: { include: { organization: true } },
        _count: { select: { items: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    // Demo mode or DB not configured
  }

  const staticMenus = [...SHEFFIELD_MENUS, ...ESTHER_MENUS];

  return (
    <MenusPageClient
      dbMenus={dbMenus}
      staticMenus={staticMenus}
    />
  );
}
