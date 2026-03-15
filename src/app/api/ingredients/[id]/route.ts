import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { z } from "zod";

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  unit: z.string().min(1).optional(),
  costPerUnit: z.number().min(0).optional(),
  supplier: z.string().optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const ingredient = await prisma.ingredient.findUniqueOrThrow({
    where: { id },
  });
  return NextResponse.json(ingredient);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  const body = await req.json();
  const data = updateSchema.parse(body);
  const updated = await prisma.ingredient.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.unit && { unit: data.unit }),
      ...(data.costPerUnit !== undefined && { costPerUnit: data.costPerUnit }),
      ...(data.supplier !== undefined && { supplier: data.supplier }),
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole(["ADMIN"]);
  const { id } = await params;
  await prisma.ingredient.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
