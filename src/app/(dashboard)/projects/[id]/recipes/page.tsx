import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { calculateRecipeCost } from "@/lib/recipe-cost";
import { CreateRecipeDialog } from "./create-recipe-dialog";
import { SHEFFIELD_PROJECT_ID } from "@/data/sheffield-project";
import { SHEFFIELD_RECIPES } from "@/data/sheffield-parsed";
import { ESTHER_PROJECT_ID } from "@/data/esther-project";
import { ESTHER_RECIPES } from "@/data/esther-parsed";
import { SheffieldRecipesView } from "./sheffield-recipes-view";

export default async function ProjectRecipesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;

  if (id === SHEFFIELD_PROJECT_ID) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Recipes</h2>
        <SheffieldRecipesView recipes={SHEFFIELD_RECIPES} />
      </div>
    );
  }
  if (id === ESTHER_PROJECT_ID) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Recipes</h2>
        <SheffieldRecipesView recipes={ESTHER_RECIPES} />
      </div>
    );
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { organization: true },
  });
  if (!project || !canAccessProject(session, project.organizationId)) {
    notFound();
  }

  const recipes = await prisma.recipe.findMany({
    where: { projectId: id },
    include: {
      recipeIngredients: { include: { ingredient: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Recipes</h2>
        {project && <CreateRecipeDialog projectId={id} />}
      </div>

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No recipes in this project yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recipes.map((r) => {
            const cost = calculateRecipeCost(r.recipeIngredients);
            return (
              <Card key={r.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{r.name}</CardTitle>
                  {r.category && (
                    <Badge variant="secondary">{r.category}</Badge>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Cost: ${cost.toFixed(2)} · {r.recipeIngredients.length} ingredients
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
