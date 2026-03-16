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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ingredients</h1>
          <p className="text-muted-foreground">
        All ingredients across all projects
          </p>
        </div>
        {createButton}
      </div>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search ingredients or suppliers..."
        className="max-w-md"
      />
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No ingredients found.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Project</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.unit}</TableCell>
                    <TableCell className="text-right">{i.cost}</TableCell>
                    <TableCell className="text-muted-foreground">{i.supplier}</TableCell>
                    <TableCell className="text-muted-foreground">{i.projectName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
