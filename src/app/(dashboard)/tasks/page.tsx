import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { TasksPageClient } from "./tasks-page-client";

export default async function TasksPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const taskWhere =
    session.user.role === "ADMIN"
      ? {}
      : session.user.organizationId
        ? { project: { organizationId: session.user.organizationId } }
        : { projectId: { in: [] } };

  let tasks: Awaited<ReturnType<typeof prisma.task.findMany>> = [];
  let projects: { id: string; name: string }[] = [];
  try {
    [tasks, projects] = await Promise.all([
      prisma.task.findMany({
        where: taskWhere,
        include: {
          project: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.project.findMany({
        where: session.user.role === "ADMIN" ? {} : session.user.organizationId ? { organizationId: session.user.organizationId } : { id: "none" },
        select: { id: true, name: true },
      }),
    ]);
  } catch {
    // Demo mode or DB not configured
  }

  return <TasksPageClient tasks={tasks} projects={projects} />;
}
