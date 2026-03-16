"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/search-input";
import type { ParsedRecipe } from "@/data/sheffield-parsed";
import { RecipeCardWithStepByStep } from "@/components/recipe-card-step-by-step";

type DbRecipe = {
  id: string;
  name: string;
  category?: string | null;
  prepTime?: number | null;
  project?: { id: string; name: string } | null;
  recipeIngredients?: { ingredient: { name: string } }[];
  cost?: number;
};

type RecipeItem = 
  | { type: "db"; data: DbRecipe }
  | { type: "sheffield"; data: ParsedRecipe };

export function RecipesPageClient({
  dbRecipes,
  sheffieldRecipes,
}: {
  dbRecipes: DbRecipe[];
  sheffieldRecipes: ParsedRecipe[];
}) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const all: RecipeItem[] = [
    ...dbRecipes.map((r) => ({ type: "db" as const, data: r })),
    ...sheffieldRecipes.map((r) => ({ type: "sheffield" as const, data: r })),
  ];

  const filtered = all.filter((item) => {
    if (!search) return true;
    const name = item.type === "db" ? item.data.name : item.data.name;
    const proj = item.type === "db" ? item.data.project?.name : item.data.projectName;
    const ing = item.type === "sheffield" 
      ? item.data.ingredients.map((i) => i.name).join(" ")
      : (item.data as DbRecipe).recipeIngredients?.map((ri) => ri.ingredient.name).join(" ") ?? "";
    const q = search.toLowerCase();
    return name.toLowerCase().includes(q) || (proj ?? "").toLowerCase().includes(q) || ing.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Recipes</h1>
      <p className="text-muted-foreground">
        All recipes across all projects
      </p>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search recipes, projects, or ingredients..."
        className="max-w-md"
      />
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No recipes found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) =>
            item.type === "db" ? (
              <DbRecipeCard key={item.data.id} recipe={item.data} />
            ) : (
              <RecipeCardWithStepByStep
                key={item.data.id}
                recipe={item.data}
                expanded={expandedId === item.data.id}
                onToggle={() => setExpandedId(expandedId === item.data.id ? null : item.data.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}

function DbRecipeCard({ recipe }: { recipe: DbRecipe }) {
  return (
    <div>
      <Link href={recipe.project ? `/projects/${recipe.project.id}/recipes` : "#"}>
        <Card className="transition-colors hover:bg-muted/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{recipe.name}</CardTitle>
            <div className="flex flex-wrap gap-1">
              {recipe.category && <Badge variant="secondary">{recipe.category}</Badge>}
              {recipe.project && <Badge variant="outline">{recipe.project.name}</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {recipe.cost != null && `Cost: $${recipe.cost.toFixed(2)} · `}
              {recipe.recipeIngredients?.length ?? 0} ingredients
            </p>
            {recipe.prepTime && (
              <p className="text-sm text-muted-foreground">Prep: {recipe.prepTime} min</p>
            )}
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}

