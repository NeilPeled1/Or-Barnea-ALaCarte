import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function MenusPage() {
  const session = await auth();
  if (!session?.user) return null;

  const where =
    session.user.role === "ADMIN"
      ? {}
      : session.user.organizationId
        ? { project: { organizationId: session.user.organizationId } }
        : { projectId: { in: [] } };

  let menus: { id: string; name: string; projectId: string; project?: { name: string; organization: { name: string } }; _count?: { items: number } }[] = [];
  try {
    menus = await prisma.menu.findMany({
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

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Menus</h1>

      {menus.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No menus yet. Create menus from a project.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menus.map((menu) => (
            <Link key={menu.id} href={`/projects/${menu.projectId}/menus`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{menu.name}</CardTitle>
                  <CardContent className="p-0 text-sm text-muted-foreground">
                    {menu.project?.organization?.name ?? "—"} · {menu.project?.name ?? "—"}
                  </CardContent>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {menu._count?.items ?? 0} items
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
