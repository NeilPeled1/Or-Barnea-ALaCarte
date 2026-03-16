"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/search-input";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ParsedRecipe } from "@/data/sheffield-parsed";
import { RecipeCardWithStepByStep } from "@/components/recipe-card-step-by-step";

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
          <RecipeCardWithStepByStep
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
