import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth-utils";
import { z } from "zod";

const createSchema = z.object({
  name: z.string().min(1),
  unit: z.string().min(1),
  costPerUnit: z.number().min(0),
  supplier: z.string().optional(),
});

export async function GET(req: Request) {
  const { auth } = await import("@/lib/auth");
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  const ingredients = await prisma.ingredient.findMany({
    where: q ? { name: { contains: q, mode: "insensitive" } } : {},
    orderBy: { name: "asc" },
  });
  return NextResponse.json(ingredients);
}

export async function POST(req: Request) {
  await requireRole(["ADMIN"]);
  const body = await req.json();
  const data = createSchema.parse(body);
  const ingredient = await prisma.ingredient.create({
    data: {
      name: data.name,
      unit: data.unit,
      costPerUnit: data.costPerUnit,
      supplier: data.supplier ?? null,
    },
  });
  return NextResponse.json(ingredient);
}
