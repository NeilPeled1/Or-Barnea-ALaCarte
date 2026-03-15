import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole, canAccessProject } from "@/lib/auth-utils";
import { z } from "zod";

const ingredientSchema = z.object({
  ingredientId: z.string(),
  quantity: z.number().min(0),
  unit: z.string(),
});

const createSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().optional(),
  prepTime: z.number().min(0).optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().optional(),
  ingredients: z.array(ingredientSchema).optional(),
});

export async function GET(req: Request) {
  const session = await requireAuth();
  const { searchParams } = new URL(req.url);
  const projectId = searchParams.get("projectId");
  const q = searchParams.get("q") ?? "";

  const where: Record<string, unknown> = {};
  if (q) where.name = { contains: q, mode: "insensitive" };
  if (projectId) {
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project || !canAccessProject(session, project.organizationId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    where.projectId = projectId;
  }

  const recipes = await prisma.recipe.findMany({
    where,
    include: {
      recipeIngredients: { include: { ingredient: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
  return NextResponse.json(recipes);
}

export async function POST(req: Request) {
  const session = await requireAuth();
  const body = await req.json();
  const data = createSchema.parse(body);

  if (data.projectId) {
    const project = await prisma.project.findUniqueOrThrow({ where: { id: data.projectId } });
    if (!canAccessProject(session, project.organizationId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const recipe = await prisma.recipe.create({
    data: {
      name: data.name,
      description: data.description ?? null,
      category: data.category ?? null,
      prepTime: data.prepTime ?? null,
      instructions: data.instructions ?? null,
      imageUrl: data.imageUrl ?? null,
      notes: data.notes ?? null,
      projectId: data.projectId ?? null,
      recipeIngredients: data.ingredients?.length
        ? {
            create: data.ingredients.map((i) => ({
              ingredientId: i.ingredientId,
              quantity: i.quantity,
              unit: i.unit,
            })),
          }
        : undefined,
    },
    include: {
      recipeIngredients: { include: { ingredient: true } },
      project: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(recipe);
}
