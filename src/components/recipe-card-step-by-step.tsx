"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ParsedRecipe } from "@/data/sheffield-parsed";

export function RecipeCardWithStepByStep({
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
  const [stepModalOpen, setStepModalOpen] = useState(false);
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
              <Button variant={viewMode === "step" ? "default" : "outline"} size="sm" onClick={() => { setViewMode("step"); setStepModalOpen(true); setStepIndex(0); }}>Step by step</Button>
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
            {viewMode === "step" && (
              <Button variant="outline" size="sm" onClick={() => setStepModalOpen(true)}>
                Open step-by-step view
              </Button>
            )}
          </CardContent>
        )}
      </Card>

      {/* Step-by-step modal - bigger, centered, ingredients as list, filter to jump */}
      <Dialog open={stepModalOpen} onOpenChange={setStepModalOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{recipe.name}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-auto space-y-6 py-4">
            {/* Ingredients as long list */}
            {recipe.ingredients.length > 0 && (
              <div>
                <h4 className="mb-2 font-semibold text-foreground">Ingredients</h4>
                <ul dir="rtl" className="space-y-1.5 text-sm text-muted-foreground border rounded-lg p-4 bg-muted/20 max-h-48 overflow-y-auto">
                  {recipe.ingredients.map((ing, i) => (
                    <li key={i} className="flex justify-between gap-2 py-0.5 border-b border-border/50 last:border-0">
                      <span>{ing.name}</span>
                      {ing.quantity && <span className="shrink-0">{ing.quantity}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Step filter / jump */}
            {totalCards > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Jump to:</span>
                  <Select value={String(stepIndex)} onValueChange={(v) => setStepIndex(Number(v))}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {cards.map((c, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {c.type}: {c.title.length > 40 ? c.title.slice(0, 40) + "…" : c.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="rounded-lg border bg-muted/30 p-6 min-h-[120px]">
                  <p className="text-xs font-medium text-muted-foreground uppercase">{cards[stepIndex]?.type}</p>
                  <h4 className="mt-2 text-lg font-semibold">{cards[stepIndex]?.title}</h4>
                  <p dir="rtl" className="mt-2 text-sm">{cards[stepIndex]?.content}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled={stepIndex === 0} onClick={() => setStepIndex((i) => Math.max(0, i - 1))}>Prev</Button>
                  <Button variant="outline" size="sm" disabled={stepIndex >= totalCards - 1} onClick={() => setStepIndex((i) => Math.min(totalCards - 1, i + 1))}>Next</Button>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Full screen */}
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
                  <ul className="space-y-1.5 border rounded-lg p-4 bg-muted/20">
                    {recipe.ingredients.map((ing, i) => (
                      <li key={i} className="flex justify-between gap-2 py-0.5 border-b border-border/50 last:border-0">
                        <span>{ing.name}</span>
                        {ing.quantity && <span>{ing.quantity}</span>}
                      </li>
                    ))}
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
