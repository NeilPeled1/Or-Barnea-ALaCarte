"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/search-input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParsedRecipe } from "@/data/sheffield-parsed";

export function SheffieldRecipesView({ recipes }: { recipes: ParsedRecipe[] }) {
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = recipes.filter(
    (r) =>
      !search ||
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.ingredients.some((i) => i.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search recipes or ingredients..."
        className="max-w-sm"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            expanded={expandedId === r.id}
            onToggle={() => setExpandedId(expandedId === r.id ? null : r.id)}
          />
        ))}
      </div>
      {filtered.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No recipes found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function RecipeCard({
  recipe,
  expanded,
  onToggle,
}: {
  recipe: ParsedRecipe;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Card className="overflow-hidden border border-border/50 transition-all hover:shadow-md">
      <CardHeader
        className="cursor-pointer select-none pb-2"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-semibold">{recipe.name}</CardTitle>
          <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <Badge variant="secondary" className="w-fit">
          {recipe.projectName}
        </Badge>
      </CardHeader>
      {expanded && (
        <CardContent className="border-t pt-4">
          <div dir="rtl" className="space-y-4 text-sm">
            {recipe.ingredients.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Ingredients</h4>
                <ul className="list-inside list-disc space-y-1 text-muted-foreground">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i}>
                      {ing.name}
                      {ing.quantity && ` — ${ing.quantity}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recipe.instructions.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Instructions</h4>
                <ol className="list-inside list-decimal space-y-1 text-muted-foreground">
                  {recipe.instructions.map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}
