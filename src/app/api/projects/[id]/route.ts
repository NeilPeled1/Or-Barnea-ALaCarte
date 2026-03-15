import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, canAccessProject } from "@/lib/auth-utils";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "on_hold"]).optional(),
  startDate: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;
  const project = await prisma.project.findUniqueOrThrow({
    where: { id },
    include: {
      organization: true,
      tasks: { include: { assignedTo: { select: { id: true, name: true, email: true } } } },
      recipes: true,
      menus: { include: { items: { include: { recipe: true } } } },
      files: true,
      messages: { include: { author: { select: { id: true, name: true, email: true } } } },
    },
  });
  if (!canAccessProject(session, project.organizationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(project);
}

export async function PATCH(
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
  const data = updateSchema.parse(body);
  const updated = await prisma.project.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.status && { status: data.status }),
      ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
    },
    include: { organization: true },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
