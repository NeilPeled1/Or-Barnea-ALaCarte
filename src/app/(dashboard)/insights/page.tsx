import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ChefHat, UtensilsCrossed, FolderKanban, ListTodo } from "lucide-react";
import { SHEFFIELD_PROJECT, SHEFFIELD_PROJECT_ID } from "@/data/sheffield-project";
import { SHEFFIELD_RECIPES, SHEFFIELD_MENUS, SHEFFIELD_INGREDIENTS } from "@/data/sheffield-parsed";
import Link from "next/link";

export default async function InsightsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  let dbProjects = 0;
  let dbRecipes = 0;
  let dbMenus = 0;
  let dbTasks = 0;
  let projects: { id: string; name: string; _count: { recipes: number; menus: number; tasks: number } }[] = [];

  try {
    const where = session.user.role === "ADMIN" ? {} : session.user.organizationId ? { organizationId: session.user.organizationId } : { id: "none" };
    [dbProjects, dbRecipes, dbMenus, dbTasks] = await Promise.all([
      prisma.project.count({ where }),
      prisma.recipe.count(),
      prisma.menu.count({ where: { project: where } }),
      prisma.task.count({ where: session.user.role === "ADMIN" ? {} : session.user.organizationId ? { project: { organizationId: session.user.organizationId } } : { projectId: { in: [] } } }),
    ]);
    projects = await prisma.project.findMany({
      where,
      include: { _count: { select: { recipes: true, menus: true, tasks: true } } },
      orderBy: { updatedAt: "desc" },
    });
  } catch {
    // Demo mode
  }

  const totalProjects = dbProjects + 1;
  const totalRecipes = dbRecipes + SHEFFIELD_RECIPES.length;
  const totalMenus = dbMenus + SHEFFIELD_MENUS.length;
  const totalTasks = dbTasks;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Insights</h1>
        <p className="text-muted-foreground">Overview of all projects and content</p>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Recipes</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRecipes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Menus</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMenus}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Per Project</CardTitle>
        </CardHeader>
        <CardContent>
            <div className="space-y-4">
              <Link href={`/projects/${SHEFFIELD_PROJECT_ID}`} className="block rounded-lg border p-4 transition-colors hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{SHEFFIELD_PROJECT.name}</span>
                  <span className="text-sm text-muted-foreground">
                    {SHEFFIELD_RECIPES.length} recipes · {SHEFFIELD_MENUS.length} menus · {SHEFFIELD_INGREDIENTS.length} ingredients
                  </span>
                </div>
              </Link>
              {projects.map((p) => (
                <Link key={p.id} href={`/projects/${p.id}`} className="block rounded-lg border p-4 transition-colors hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{p.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {p._count.recipes} recipes · {p._count.menus} menus · {p._count.tasks} tasks
                    </span>
                  </div>
                </Link>
              ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
