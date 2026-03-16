import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateProjectDialog } from "./create-project-dialog";
import { CreateOrganizationDialog } from "./create-organization-dialog";
import { SHEFFIELD_PROJECT } from "@/data/sheffield-project";
import { SHEFFIELD_RECIPES, SHEFFIELD_MENUS } from "@/data/sheffield-parsed";
import { ESTHER_PROJECT } from "@/data/esther-project";
import { ESTHER_RECIPES, ESTHER_MENUS } from "@/data/esther-parsed";
import { ProjectsList } from "./projects-list";

export default async function ProjectsPage() {
  const session = await auth();
  if (!session?.user) return null;

  const where =
    session.user.role === "ADMIN"
      ? {}
      : session.user.organizationId
        ? { organizationId: session.user.organizationId }
        : { id: "none" };

  type ProjectWithOrg = { id: string; name: string; status: string; organization?: { name: string }; _count?: { tasks: number; recipes: number; menus: number } };
  let dbProjects: ProjectWithOrg[] = [];
  try {
    dbProjects = await prisma.project.findMany({
    where,
    include: {
      organization: true,
      _count: { select: { tasks: true, recipes: true, menus: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  } catch {
    // Demo mode or DB not configured
  }

  const sheffieldWithCounts = {
    ...SHEFFIELD_PROJECT,
    organization: { name: SHEFFIELD_PROJECT.organizationName },
    _count: {
      tasks: 0,
      recipes: SHEFFIELD_RECIPES.length,
      menus: SHEFFIELD_MENUS.length,
    },
  };

  const estherWithCounts = {
    ...ESTHER_PROJECT,
    organization: { name: ESTHER_PROJECT.organizationName },
    _count: {
      tasks: 0,
      recipes: ESTHER_RECIPES.length,
      menus: ESTHER_MENUS.length,
    },
  };

  const projects = [sheffieldWithCounts, estherWithCounts, ...dbProjects];

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
        <ProjectsList projects={projects} />
      )}
    </div>
  );
}
