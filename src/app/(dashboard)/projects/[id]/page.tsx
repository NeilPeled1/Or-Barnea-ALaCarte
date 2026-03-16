import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, UtensilsCrossed, ListTodo, FileText, MessageSquare, BookOpen, BarChart3, DollarSign } from "lucide-react";
import { SHEFFIELD_PROJECT_ID, SHEFFIELD_PROJECT } from "@/data/sheffield-project";
import { SHEFFIELD_RECIPES, SHEFFIELD_MENUS, SHEFFIELD_INGREDIENTS } from "@/data/sheffield-parsed";
import { SHEFFIELD_DOCS } from "@/data/sheffield-documents";
import { ESTHER_PROJECT_ID, ESTHER_PROJECT } from "@/data/esther-project";
import { ESTHER_RECIPES, ESTHER_MENUS, ESTHER_INGREDIENTS } from "@/data/esther-parsed";
import { ESTHER_DOCS } from "@/data/esther-documents";

const STATIC_PROJECT_DATA: Record<
  string,
  { project: typeof SHEFFIELD_PROJECT; recipes: unknown[]; menus: unknown[]; ingredients: unknown[]; docs: unknown[]; description: string }
> = {
  [SHEFFIELD_PROJECT_ID]: {
    project: SHEFFIELD_PROJECT,
    recipes: SHEFFIELD_RECIPES,
    menus: SHEFFIELD_MENUS,
    ingredients: SHEFFIELD_INGREDIENTS,
    docs: SHEFFIELD_DOCS,
    description:
      "Sheffield Bar — culinary consulting project. Includes recipe book 2026, main & dessert menus, product tree & pricing, supplier lists, station checklists, pickup guides, and operational documents. Content in Hebrew with structured recipes, menus, and procedures.",
  },
  [ESTHER_PROJECT_ID]: {
    project: ESTHER_PROJECT,
    recipes: ESTHER_RECIPES,
    menus: ESTHER_MENUS,
    ingredients: ESTHER_INGREDIENTS,
    docs: ESTHER_DOCS,
    description:
      "אסתר בר דיזינגוף — פרויקט ייעוץ קולינרי. כולל ספר מתכונים, תפריטי בוקר/ערב/סלטים, עץ מוצר, הזמנות, צ'קליסטים, פיק אפ, ומסמכי תפעול.",
  },
};

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;

  const staticData = STATIC_PROJECT_DATA[id];
  if (staticData) {
    const { project, recipes, menus, ingredients, docs, description } = staticData;
    const menuItemsCount = (menus as { sections?: { items?: unknown[] }[] }[]).reduce(
      (acc, m) => acc + (m.sections?.reduce((a, s) => a + (s.items?.length ?? 0), 0) ?? 0),
      0
    );
    const estimatedCost = (ingredients as { cost?: number }[]).reduce(
      (acc, i) => acc + (i.cost ?? 0),
      0
    );
    const sections = [
      { href: `recipes`, label: "Recipes", count: recipes.length, icon: ChefHat },
      { href: `menus`, label: "Menus", count: menus.length, icon: UtensilsCrossed },
      { href: `ingredients`, label: "Ingredients", count: ingredients.length, icon: BookOpen },
      { href: `documents`, label: "Documents", count: docs.length, icon: FileText },
    ];
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overview</CardTitle>
              <Badge>{project.status}</Badge>
            </div>
            <p className="text-muted-foreground">{description}</p>
          </CardHeader>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {sections.map((s) => (
            <Link key={s.href} href={`/projects/${id}/${s.href}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardContent className="flex items-center gap-4 pt-6">
                  <s.icon className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{s.label}</p>
                    <p className="text-2xl font-bold">{s.count}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Dishes (recipes)</p>
                <p className="text-2xl font-bold">{recipes.length}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Menu items</p>
                <p className="text-2xl font-bold">{menuItemsCount}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Ingredients</p>
                <p className="text-2xl font-bold">{ingredients.length}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <DollarSign className="h-4 w-4" />
                  Est. inventory cost
                </p>
                <p className="text-2xl font-bold">
                  {estimatedCost > 0 ? `₪${estimatedCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}` : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      organization: true,
      _count: { select: { tasks: true, recipes: true, menus: true, files: true, messages: true } },
    },
  });
  if (!project || !canAccessProject(session, project.organizationId)) {
    notFound();
  }

  const sections = [
    { href: `recipes`, label: "Recipes", count: project._count.recipes, icon: ChefHat },
    { href: `menus`, label: "Menus", count: project._count.menus, icon: UtensilsCrossed },
    { href: `tasks`, label: "Tasks", count: project._count.tasks, icon: ListTodo },
    { href: `files`, label: "Files", count: project._count.files, icon: FileText },
    { href: `messages`, label: "Messages", count: project._count.messages, icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Overview</CardTitle>
            <Badge>{project.status}</Badge>
          </div>
          {project.description && (
            <p className="text-muted-foreground">{project.description}</p>
          )}
          {project.startDate && (
            <p className="text-sm text-muted-foreground">
              Started: {new Date(project.startDate).toLocaleDateString()}
            </p>
          )}
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => (
          <Link key={s.href} href={`/projects/${id}/${s.href}`}>
            <Card className="transition-colors hover:bg-muted/50">
              <CardContent className="flex items-center gap-4 pt-6">
                <s.icon className="h-8 w-8 text-muted-foreground" />
                <div>
                  <p className="font-medium">{s.label}</p>
                  <p className="text-2xl font-bold">{s.count}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Recipes</p>
              <p className="text-2xl font-bold">{project._count.recipes}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Menus</p>
              <p className="text-2xl font-bold">{project._count.menus}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Tasks</p>
              <p className="text-2xl font-bold">{project._count.tasks}</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Files</p>
              <p className="text-2xl font-bold">{project._count.files}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
