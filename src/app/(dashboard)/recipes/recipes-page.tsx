"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { ParsedRecipe } from "@/data/sheffield-parsed";

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
              <SheffieldRecipeCard
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

function SheffieldRecipeCard({
  recipe,
  expanded,
  onToggle,
}: {
  recipe: ParsedRecipe;
  expanded: boolean;
  onToggle: () => void;
}) {
  const [viewMode, setViewMode] = useState<"review" | "step">("review");
  const [fullScreen, setFullScreen] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  const cards: { type: string; title: string; content: string }[] = [
    { type: "Recipe", title: recipe.name, content: recipe.projectName },
    ...recipe.ingredients.map((ing) => ({ type: "Ingredient", title: ing.name, content: ing.quantity || "" })),
    ...recipe.instructions.map((step, i) => ({ type: "Step", title: `Step ${i + 1}`, content: step })),
  ];
  const totalCards = cards.length;

  return (
    <>
      <Card className="overflow-hidden border border-border/50 transition-all hover:shadow-md animate-fade-in">
        <CardHeader className="cursor-pointer select-none pb-2" onClick={onToggle}>
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-semibold">{recipe.name}</CardTitle>
            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={(e) => e.stopPropagation()}>
              {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
          <Badge variant="secondary" className="w-fit">{recipe.projectName}</Badge>
        </CardHeader>
        {expanded && (
          <CardContent className="border-t pt-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex gap-2">
              <Button variant={viewMode === "review" ? "default" : "outline"} size="sm" onClick={() => setViewMode("review")}>Review</Button>
              <Button variant={viewMode === "step" ? "default" : "outline"} size="sm" onClick={() => { setViewMode("step"); setStepIndex(0); }}>Step by step</Button>
              <Button variant="outline" size="sm" onClick={() => setFullScreen(true)}>Full screen</Button>
            </div>
            {viewMode === "review" && (
              <div dir="rtl" className="space-y-4 text-sm animate-slide-up">
                {recipe.ingredients.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold text-foreground">Ingredients</h4>
                    <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                      {recipe.ingredients.map((ing, i) => (
                        <li key={i}>{ing.name}{ing.quantity && ` — ${ing.quantity}`}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recipe.instructions.length > 0 && (
                  <div>
                    <h4 className="mb-2 font-semibold text-foreground">Instructions</h4>
                    <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                      {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                  </div>
                )}
              </div>
            )}
            {viewMode === "step" && totalCards > 0 && (
              <div className="space-y-4 animate-slide-up">
                <div className="rounded-lg border bg-muted/30 p-6 text-center">
                  <p className="text-xs font-medium text-muted-foreground uppercase">{cards[stepIndex]?.type}</p>
                  <h4 className="mt-2 text-lg font-semibold">{cards[stepIndex]?.title}</h4>
                  <p dir="rtl" className="mt-2 text-sm">{cards[stepIndex]?.content}</p>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-1">
                    {cards.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setStepIndex(i)}
                        className={`h-8 w-8 rounded text-xs font-medium ${stepIndex === i ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"}`}
                      >
                        {i + 1}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>Prev</Button>
                    <Button variant="outline" size="sm" disabled={stepIndex >= totalCards - 1} onClick={() => setStepIndex((i) => Math.min(totalCards - 1, i + 1))}>Next</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        )}
      </Card>
      {fullScreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 p-4" onClick={() => setFullScreen(false)}>
          <div className="max-h-[90vh] max-w-2xl overflow-auto rounded-lg border bg-card p-6 shadow-xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between">
              <h3 className="text-xl font-bold">{recipe.name}</h3>
              <Button variant="ghost" size="sm" onClick={() => setFullScreen(false)}>Close</Button>
            </div>
            <div dir="rtl" className="mt-4 space-y-4 text-sm">
              {recipe.ingredients.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Ingredients</h4>
                  <ul className="list-inside list-disc space-y-1">
                    {recipe.ingredients.map((ing, i) => <li key={i}>{ing.name}{ing.quantity && ` — ${ing.quantity}`}</li>)}
                  </ul>
                </div>
              )}
              {recipe.instructions.length > 0 && (
                <div>
                  <h4 className="mb-2 font-semibold">Instructions</h4>
                  <ol className="list-inside list-decimal space-y-1">
                    {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
