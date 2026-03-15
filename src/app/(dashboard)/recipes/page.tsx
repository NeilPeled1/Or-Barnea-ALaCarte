import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateRecipeCost } from "@/lib/recipe-cost";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function RecipesPage() {
  const session = await auth();
  if (!session?.user) return null;

  let recipes: Awaited<ReturnType<typeof prisma.recipe.findMany>> = [];
  try {
    recipes = await prisma.recipe.findMany({
    include: {
      recipeIngredients: { include: { ingredient: true } },
      project: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });
  } catch {
    // Demo mode or DB not configured
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recipes</h1>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No recipes yet. Create recipes from a project.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => {
            const cost = calculateRecipeCost((r as { recipeIngredients?: Parameters<typeof calculateRecipeCost>[0] }).recipeIngredients ?? []);
            return (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">
                    {(r as { project?: { id: string } }).project ? (
                      <Link
                        href={`/projects/${(r as { project?: { id: string } }).project!.id}/recipes`}
                        className="hover:underline"
                      >
                        {r.name}
                      </Link>
                    ) : (
                      r.name
                    )}
                  </CardTitle>
                  <div className="flex flex-wrap gap-1">
                    {r.category && (
                      <Badge variant="secondary">{r.category}</Badge>
                    )}
                  {(r as { project?: { name: string } }).project && (
                    <Badge variant="outline">{(r as { project?: { name: string } }).project!.name}</Badge>
                  )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cost: ${cost.toFixed(2)} · {(r as { recipeIngredients?: unknown[] }).recipeIngredients?.length ?? 0} ingredients
                  </p>
                  {r.prepTime && (
                    <p className="text-sm text-muted-foreground">
                      Prep: {r.prepTime} min
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
