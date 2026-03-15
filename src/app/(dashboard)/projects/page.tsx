import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { CreateProjectDialog } from "./create-project-dialog";
import { CreateOrganizationDialog } from "./create-organization-dialog";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const where =
    session.user.role === "ADMIN"
      ? {}
      : session.user.organizationId
        ? { organizationId: session.user.organizationId }
        : { id: "none" };

  const projects = await prisma.project.findMany({
    where,
    include: {
      organization: true,
      _count: { select: { tasks: true, recipes: true, menus: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects</h1>
        {session.user.role === "ADMIN" && (
          <div className="flex gap-2">
            <CreateOrganizationDialog />
            <CreateProjectDialog />
          </div>
        )}
      </div>

      {projects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground">No projects yet.</p>
            {session.user.role === "ADMIN" && (
              <div className="mt-4 flex gap-2">
                <CreateOrganizationDialog />
                <CreateProjectDialog className="mt-0" />
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <Badge variant="secondary">{project.status}</Badge>
                  </div>
                  <CardDescription>{project.organization.name}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4 text-sm text-muted-foreground">
                    <span>{project._count.tasks} tasks</span>
                    <span>{project._count.recipes} recipes</span>
                    <span>{project._count.menus} menus</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
