import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, canAccessProject } from "@/lib/auth-utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(["active", "completed", "on_hold"]).optional(),
  startDate: z.string().optional(),
  organizationId: z.string(),
});

export async function GET() {
  const session = await requireAuth();
  const where =
    session.user.role === "ADMIN"
      ? {}
      : session.user.organizationId
        ? { organizationId: session.user.organizationId }
        : { id: "none" };

  const projects = await prisma.project.findMany({
    where,
    include: {
      organization: true,
      _count: { select: { tasks: true, recipes: true, menus: true } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  await requireRole(["ADMIN"]);
  const body = await req.json();
  const data = createSchema.parse(body);
  const project = await prisma.project.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      status: (data.status as "active" | "completed" | "on_hold") ?? "active",
      startDate: data.startDate ? new Date(data.startDate) : null,
      organizationId: data.organizationId,
    },
    include: { organization: true },
  });
  return NextResponse.json(project);
}
