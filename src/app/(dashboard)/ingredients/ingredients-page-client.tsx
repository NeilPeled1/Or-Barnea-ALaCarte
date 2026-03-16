"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SearchInput } from "@/components/search-input";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Eye, EyeOff } from "lucide-react";
import type { ParsedIngredient } from "@/data/sheffield-parsed";

type DbIngredient = {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  supplier?: string | null;
};

type IngredientRow = {
  id: string;
  name: string;
  unit: string;
  cost: string;
  supplier: string;
  projectName: string;
};

const COLUMNS = ["name", "unit", "cost", "supplier", "project"] as const;

export function IngredientsPageClient({
  dbIngredients,
  sheffieldIngredients,
  createButton,
}: {
  dbIngredients: DbIngredient[];
  sheffieldIngredients: ParsedIngredient[];
  createButton?: React.ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());

  const toggleCol = (col: string) => {
    setHiddenCols((prev) => {
      const next = new Set(prev);
      if (next.has(col)) next.delete(col);
      else next.add(col);
      return next;
    });
  };

  const toggleProject = (proj: string) => {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(proj)) next.delete(proj);
      else next.add(proj);
      return next;
    });
  };

  const all: IngredientRow[] = [
    ...dbIngredients.map((i) => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
      cost: `$${Number(i.costPerUnit).toFixed(2)}`,
      supplier: i.supplier ?? "—",
      projectName: "—",
    })),
    ...sheffieldIngredients.map((i) => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
      cost: i.cost != null ? `₪${i.cost.toFixed(2)}` : "—",
      supplier: i.supplier ?? "—",
      projectName: i.projectName,
    })),
  ];

  const filtered = all.filter(
    (i) =>
      !search ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      (i.supplier ?? "").toLowerCase().includes(search.toLowerCase()) ||
      i.projectName.toLowerCase().includes(search.toLowerCase())
  );

  const byProject = filtered.reduce<Record<string, IngredientRow[]>>((acc, row) => {
    const key = row.projectName || "Other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(row);
    return acc;
  }, {});

  const projectOrder = Object.keys(byProject).sort((a, b) => (a === "Other" ? 1 : b === "Other" ? -1 : a.localeCompare(b)));

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ingredients</h1>
          <p className="text-muted-foreground">All ingredients across all projects</p>
        </div>
        {createButton}
      </div>
      <SearchInput value={search} onChange={setSearch} placeholder="Search ingredients or suppliers..." className="max-w-md" />
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-muted-foreground">Columns (tap to hide):</span>
        {COLUMNS.map((col) => (
          <Button
            key={col}
            variant={hiddenCols.has(col) ? "outline" : "secondary"}
            size="sm"
            onClick={() => toggleCol(col)}
          >
            {hiddenCols.has(col) ? <EyeOff className="mr-1 h-3 w-3" /> : <Eye className="mr-1 h-3 w-3" />}
            {col}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">No ingredients found.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {projectOrder.map((projectName) => {
            const rows = byProject[projectName];
            const isCollapsed = collapsedProjects.has(projectName);
            return (
              <Card key={projectName}>
                <button
                  type="button"
                  className="flex w-full items-center gap-2 p-4 text-left"
                  onClick={() => toggleProject(projectName)}
                >
                  {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  <span className="font-semibold">{projectName}</span>
                  <span className="text-sm text-muted-foreground">({rows.length} items)</span>
                </button>
                {!isCollapsed && (
                  <CardContent className="pt-0">
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {!hiddenCols.has("name") && <TableHead>Name</TableHead>}
                            {!hiddenCols.has("unit") && <TableHead>Unit</TableHead>}
                            {!hiddenCols.has("cost") && <TableHead className="text-right">Cost</TableHead>}
                            {!hiddenCols.has("supplier") && <TableHead>Supplier</TableHead>}
                            {!hiddenCols.has("project") && <TableHead>Project</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((i) => (
                            <TableRow key={i.id}>
                              {!hiddenCols.has("name") && <TableCell className="font-medium">{i.name}</TableCell>}
                              {!hiddenCols.has("unit") && <TableCell>{i.unit}</TableCell>}
                              {!hiddenCols.has("cost") && <TableCell className="text-right">{i.cost}</TableCell>}
                              {!hiddenCols.has("supplier") && <TableCell className="text-muted-foreground">{i.supplier}</TableCell>}
                              {!hiddenCols.has("project") && <TableCell className="text-muted-foreground">{i.projectName}</TableCell>}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
