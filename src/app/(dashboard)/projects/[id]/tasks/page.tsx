import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateTaskDialog } from "./create-task-dialog";

export default async function ProjectTasksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  const project = await prisma.project.findUnique({
    where: { id },
    include: { organization: true },
  });
  if (!project || !canAccessProject(session, project.organizationId)) {
    notFound();
  }

  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });

  const byStatus = {
    todo: tasks.filter((t) => t.status === "todo"),
    in_progress: tasks.filter((t) => t.status === "in_progress"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <CreateTaskDialog projectId={id} />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {(["todo", "in_progress", "done"] as const).map((status) => (
          <Card key={status}>
            <CardContent className="pt-4">
              <h3 className="mb-4 font-medium capitalize">
                {status.replace("_", " ")}
              </h3>
              <div className="space-y-2">
                {byStatus[status].map((task) => (
                  <div
                    key={task.id}
                    className="rounded-lg border p-3"
                  >
                    <p className="font-medium">{task.title}</p>
                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {task.description}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <Badge variant="outline">{task.status}</Badge>
                      {task.assignedTo && (
                        <span className="text-xs text-muted-foreground">
                          {task.assignedTo.name ?? task.assignedTo.email}
                        </span>
                      )}
                      {task.dueDate && (
                        <span className="text-xs text-muted-foreground">
                          Due: {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
