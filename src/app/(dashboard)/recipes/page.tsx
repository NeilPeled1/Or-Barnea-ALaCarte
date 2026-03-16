import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRecipeCost } from "@/lib/recipe-cost";
import { SHEFFIELD_RECIPES } from "@/data/sheffield-parsed";
import { ESTHER_RECIPES } from "@/data/esther-parsed";
import { RecipesPageClient } from "./recipes-page";

export default async function RecipesPage() {
  const session = await auth();
  if (!session?.user) return null;

  let dbRecipes: Awaited<ReturnType<typeof prisma.recipe.findMany>> = [];
  try {
    dbRecipes = await prisma.recipe.findMany({
      include: {
        recipeIngredients: { include: { ingredient: true } },
        project: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
  } catch {
    // Demo mode or DB not configured
  }

  const dbWithCost = dbRecipes.map((r) => {
    const ri = "recipeIngredients" in r ? (r as { recipeIngredients: unknown[] }).recipeIngredients : [];
    return { ...r, cost: calculateRecipeCost(ri as Parameters<typeof calculateRecipeCost>[0]) };
  });

  const staticRecipes = [...SHEFFIELD_RECIPES, ...ESTHER_RECIPES];

  return (
    <RecipesPageClient
      dbRecipes={dbWithCost}
      sheffieldRecipes={staticRecipes}
    />
  );
}
