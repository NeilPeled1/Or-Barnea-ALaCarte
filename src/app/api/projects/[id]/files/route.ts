import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canAccessProject } from "@/lib/auth-utils";
import { z } from "zod";

// Placeholder: In production, use S3. For now we accept file metadata with a URL (e.g. from client upload).
const createSchema = z.object({
  name: z.string().min(1),
  url: z.string().url(),
  type: z.string().optional(),
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
  const files = await prisma.file.findMany({
    where: { projectId: id },
    include: { uploadedBy: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(files);
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
  const file = await prisma.file.create({
    data: {
      projectId: id,
      name: data.name,
      url: data.url,
      type: data.type ?? null,
      uploadedById: session.user.id,
    },
    include: { uploadedBy: { select: { id: true, name: true } } },
  });
  return NextResponse.json(file);
}
