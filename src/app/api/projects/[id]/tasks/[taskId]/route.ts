import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canAccessProject } from "@/lib/auth-utils";
import { z } from "zod";

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
  assignedToId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await requireAuth();
  const { id, taskId } = await params;
  const project = await prisma.project.findUniqueOrThrow({ where: { id } });
  if (!canAccessProject(session, project.organizationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const data = updateSchema.parse(body);
  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.assignedToId !== undefined && { assignedToId: data.assignedToId }),
      ...(data.dueDate !== undefined && { dueDate: data.dueDate ? new Date(data.dueDate) : null }),
    },
    include: { assignedTo: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(task);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> }
) {
  const session = await requireAuth();
  const { id, taskId } = await params;
  const project = await prisma.project.findUniqueOrThrow({ where: { id } });
  if (!canAccessProject(session, project.organizationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.task.delete({ where: { id: taskId } });
  return NextResponse.json({ success: true });
}
