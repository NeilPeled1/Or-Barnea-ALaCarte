import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, canAccessProject } from "@/lib/auth-utils";
import { calculateRecipeCost, calculateMenuItemMetrics } from "@/lib/recipe-cost";
import { z } from "zod";

const itemSchema = z.object({
  recipeId: z.string(),
  dishName: z.string().optional(),
  description: z.string().optional(),
  sellingPrice: z.number().min(0),
});

const createSchema = z.object({
  name: z.string().min(1),
  items: z.array(itemSchema).optional(),
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
  const menus = await prisma.menu.findMany({
    where: { projectId: id },
    include: {
      items: {
        include: {
          recipe: {
            include: { recipeIngredients: { include: { ingredient: true } } },
          },
        },
      },
    },
  });
  const withCosts = menus.map((menu) => ({
    ...menu,
    items: menu.items.map((item) => {
      const cost = calculateRecipeCost(item.recipe.recipeIngredients);
      const { foodCostPct, profitMargin } = calculateMenuItemMetrics(cost, Number(item.sellingPrice));
      return {
        ...item,
        calculatedCost: cost,
        foodCostPct,
        profitMargin,
      };
    }),
  }));
  return NextResponse.json(withCosts);
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

  const menu = await prisma.menu.create({
    data: {
      name: data.name,
      projectId: id,
      items: data.items?.length
        ? {
            create: await Promise.all(
              data.items.map(async (item) => {
                const recipe = await prisma.recipe.findUniqueOrThrow({
                  where: { id: item.recipeId },
                  include: { recipeIngredients: { include: { ingredient: true } } },
                });
                const cost = calculateRecipeCost(recipe.recipeIngredients);
                const { foodCostPct, profitMargin } = calculateMenuItemMetrics(cost, item.sellingPrice);
                return {
                  recipeId: item.recipeId,
                  dishName: item.dishName ?? recipe.name,
                  description: item.description ?? null,
                  sellingPrice: item.sellingPrice,
                  calculatedCost: cost,
                  foodCostPct,
                  profitMargin,
                };
              })
            ),
          }
        : undefined,
    },
    include: {
      items: { include: { recipe: true } },
    },
  });
  return NextResponse.json(menu);
}
