import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChefHat, UtensilsCrossed, ListTodo, FileText, MessageSquare } from "lucide-react";

export default async function ProjectOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
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
    </div>
  );
}
