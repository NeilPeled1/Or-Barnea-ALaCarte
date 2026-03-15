import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canAccessProject } from "@/lib/auth-utils";
import { z } from "zod";

const createSchema = z.object({
  content: z.string().min(1),
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
  const messages = await prisma.message.findMany({
    where: { projectId: id },
    include: { author: { select: { id: true, name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(messages);
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
  const message = await prisma.message.create({
    data: {
      projectId: id,
      authorId: session.user.id,
      content: data.content,
    },
    include: { author: { select: { id: true, name: true, email: true } } },
  });
  return NextResponse.json(message);
}
