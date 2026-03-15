import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["restaurant", "cafe", "food_brand"]).optional(),
});

export async function GET() {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const where =
    session.user.role === "ADMIN"
      ? {}
      : session.user.organizationId
        ? { id: session.user.organizationId }
        : { id: "none" };

  const orgs = await prisma.organization.findMany({
    where,
    include: { _count: { select: { projects: true } } },
  });
  return NextResponse.json(orgs);
}

export async function POST(req: Request) {
  await requireRole(["ADMIN"]);
  const body = await req.json();
  const data = createSchema.parse(body);
  const org = await prisma.organization.create({
    data: {
      name: data.name,
      type: (data.type as "restaurant" | "cafe" | "food_brand") ?? "restaurant",
    },
  });
  return NextResponse.json(org);
}
