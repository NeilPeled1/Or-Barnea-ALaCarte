import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canAccessProject } from "@/lib/auth-utils";
import { z } from "zod";

const createSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  assignedToId: z.string().optional(),
  dueDate: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;
  const project = await prisma.project.findUniqueOrThrow({ where: { id } });
  if (!canAccessProject(session, project.organizationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const tasks = await prisma.task.findMany({
    where: { projectId: id },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(tasks);
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;
  const project = await prisma.project.findUniqueOrThrow({ where: { id } });
  if (!canAccessProject(session, project.organizationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const data = createSchema.parse(body);
  const task = await prisma.task.create({
    data: {
      projectId: id,
      title: data.title,
      description: data.description ?? null,
      status: (data.status as "todo" | "in_progress" | "done") ?? "todo",
      assignedToId: data.assignedToId ?? null,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(task);
}
