import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FolderKanban, ChefHat, UtensilsCrossed, ListTodo, Plus } from "lucide-react";
import { SHEFFIELD_PROJECT_ID, SHEFFIELD_PROJECT } from "@/data/sheffield-project";
import { SHEFFIELD_RECIPES, SHEFFIELD_MENUS } from "@/data/sheffield-parsed";
import { CreateTaskDialog } from "./create-task-dialog";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isDemo = session.user.id?.startsWith("demo-");
  let projects = 0,
    recipes = 0,
    menus = 0,
    taskCount = 0;
  let recentProjects: { id: string; name: string; organization: { name: string }; status: string; updatedAt: Date }[] = [];

  projects = 1;
  recipes = SHEFFIELD_RECIPES.length;
  menus = SHEFFIELD_MENUS.length;

  if (!isDemo) {
    const where =
      session.user.role === "ADMIN"
        ? {}
        : session.user.organizationId
          ? { organizationId: session.user.organizationId }
          : { id: "none" };

    const taskWhere =
      session.user.role === "ADMIN"
        ? {}
        : session.user.organizationId
          ? { project: { organizationId: session.user.organizationId } }
          : { projectId: { in: [] } };

    try {
      const [dbProjects, dbRecipes, dbMenus, dbTasks] = await Promise.all([
        prisma.project.count({ where }),
        prisma.recipe.count(),
        prisma.menu.count({ where: { project: where } }),
        prisma.task.count({ where: taskWhere }),
      ]);
      projects += dbProjects;
      recipes += dbRecipes;
      menus += dbMenus;
      taskCount = dbTasks;

      const dbRecent = await prisma.project.findMany({
        where,
        take: 5,
        include: { organization: true },
        orderBy: { updatedAt: "desc" },
      });
      recentProjects = [
        { id: SHEFFIELD_PROJECT_ID, name: SHEFFIELD_PROJECT.name, organization: { name: SHEFFIELD_PROJECT.organizationName }, status: SHEFFIELD_PROJECT.status, updatedAt: new Date() },
        ...dbRecent,
      ].slice(0, 5);
    } catch {
      recentProjects = [
        { id: SHEFFIELD_PROJECT_ID, name: SHEFFIELD_PROJECT.name, organization: { name: SHEFFIELD_PROJECT.organizationName }, status: SHEFFIELD_PROJECT.status, updatedAt: new Date() },
      ];
    }
  } else {
    recentProjects = [
      { id: SHEFFIELD_PROJECT_ID, name: SHEFFIELD_PROJECT.name, organization: { name: SHEFFIELD_PROJECT.organizationName }, status: SHEFFIELD_PROJECT.status, updatedAt: new Date() },
    ];
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {session.user.name ?? session.user.email}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="border-border/50 transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projects}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recipes}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menus</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{menus}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 transition-shadow hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{taskCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
            {recentProjects.length === 0 ? (
              <p className="text-muted-foreground">No projects yet.</p>
            ) : (
              <ul className="space-y-2">
                {recentProjects.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/projects/${p.id}`}
                      className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-muted"
                    >
                      <span className="font-medium">{p.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {p.organization.name} · {p.status}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 flex flex-wrap gap-2">
              <Button asChild>
                <Link href="/projects">View all projects</Link>
              </Button>
              <CreateTaskDialog />
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
