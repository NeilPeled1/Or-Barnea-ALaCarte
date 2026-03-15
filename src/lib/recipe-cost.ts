import type { RecipeIngredient, Ingredient } from "@prisma/client";

export function calculateRecipeCost(
  recipeIngredients: (RecipeIngredient & { ingredient: Ingredient })[]
): number {
  return recipeIngredients.reduce((sum, ri) => {
    const cost = Number(ri.quantity) * Number(ri.ingredient.costPerUnit);
    return sum + cost;
  }, 0);
}

export function calculateMenuItemMetrics(
  recipeCost: number,
  sellingPrice: number
): { foodCostPct: number; profitMargin: number } {
  const foodCostPct = sellingPrice > 0 ? (recipeCost / sellingPrice) * 100 : 0;
  const profitMargin = sellingPrice - recipeCost;
  return { foodCostPct, profitMargin };
}
