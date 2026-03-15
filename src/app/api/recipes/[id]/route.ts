import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canAccessProject } from "@/lib/auth-utils";
import { z } from "zod";

const ingredientSchema = z.object({
  ingredientId: z.string(),
  quantity: z.number().min(0),
  unit: z.string(),
});

const updateSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  prepTime: z.number().min(0).optional(),
  instructions: z.string().optional(),
  imageUrl: z.string().optional(),
  notes: z.string().optional(),
  projectId: z.string().optional(),
  ingredients: z.array(ingredientSchema).optional(),
});

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;
  const recipe = await prisma.recipe.findUniqueOrThrow({
    where: { id },
    include: {
      recipeIngredients: { include: { ingredient: true } },
      project: true,
    },
  });
  if (recipe.project && !canAccessProject(session, recipe.project.organizationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return NextResponse.json(recipe);
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;
  const recipe = await prisma.recipe.findUniqueOrThrow({ where: { id }, include: { project: true } });
  if (recipe.project && !canAccessProject(session, recipe.project.organizationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const data = updateSchema.parse(body);

  const updateData: Record<string, unknown> = {
    ...(data.name && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.category !== undefined && { category: data.category }),
    ...(data.prepTime !== undefined && { prepTime: data.prepTime }),
    ...(data.instructions !== undefined && { instructions: data.instructions }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl }),
    ...(data.notes !== undefined && { notes: data.notes }),
    ...(data.projectId !== undefined && { projectId: data.projectId }),
  };

  if (data.ingredients) {
    await prisma.recipeIngredient.deleteMany({ where: { recipeId: id } });
    updateData.recipeIngredients = {
      create: data.ingredients.map((i) => ({
        ingredientId: i.ingredientId,
        quantity: i.quantity,
        unit: i.unit,
      })),
    };
  }

  const updated = await prisma.recipe.update({
    where: { id },
    data: updateData,
    include: {
      recipeIngredients: { include: { ingredient: true } },
      project: { select: { id: true, name: true } },
    },
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await requireAuth();
  const { id } = await params;
  const recipe = await prisma.recipe.findUniqueOrThrow({ where: { id }, include: { project: true } });
  if (recipe.project && !canAccessProject(session, recipe.project.organizationId)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.recipe.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
