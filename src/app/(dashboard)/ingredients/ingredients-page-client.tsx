"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  isDb?: boolean;
};

const COLUMNS = ["name", "unit", "cost", "supplier", "project"] as const;

const UNIT_OPTIONS = ["kg", "g", "L", "ml", "unit", "oz", "lb", "each", "bunch"];

export function IngredientsPageClient({
  dbIngredients,
  sheffieldIngredients,
  createButton,
}: {
  dbIngredients: DbIngredient[];
  sheffieldIngredients: ParsedIngredient[];
  createButton?: React.ReactNode;
}) {
  const allSuppliers = [...new Set([
    ...dbIngredients.map((i) => i.supplier).filter(Boolean) as string[],
    ...sheffieldIngredients.map((i) => i.supplier).filter(Boolean) as string[],
  ])].sort();
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
      isDb: true,
    })),
    ...sheffieldIngredients.map((i) => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
      cost: i.cost != null ? `₪${i.cost.toFixed(2)}` : "—",
      supplier: i.supplier ?? "—",
      projectName: i.projectName,
      isDb: false,
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
                      <Table className="table-fixed">
                        <TableHeader>
                          <TableRow className="[&>th]:px-2 [&>th]:py-1.5 [&>th]:whitespace-nowrap">
                            {!hiddenCols.has("name") && <TableHead className="w-[min(120px,20%)]">Name</TableHead>}
                            {!hiddenCols.has("unit") && <TableHead className="w-[60px]">Unit</TableHead>}
                            {!hiddenCols.has("cost") && <TableHead className="w-[70px] text-right">Cost</TableHead>}
                            {!hiddenCols.has("supplier") && <TableHead className="w-[min(100px,18%)]">Supplier</TableHead>}
                            {!hiddenCols.has("project") && <TableHead className="w-[min(100px,18%)]">Project</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {rows.map((i) => (
                            <IngredientRowCell key={i.id} row={i} hiddenCols={hiddenCols} suppliers={allSuppliers} />
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

function IngredientRowCell({
  row,
  hiddenCols,
  suppliers,
}: {
  row: IngredientRow;
  hiddenCols: Set<string>;
  suppliers: string[];
}) {
  const router = useRouter();
  const [name, setName] = useState(row.name);
  const [unit, setUnit] = useState(row.unit);
  const [cost, setCost] = useState(row.cost.replace(/[^0-9.]/g, ""));
  const [supplier, setSupplier] = useState(row.supplier === "—" ? "" : row.supplier);
  const [saving, setSaving] = useState(false);

  const save = useCallback(
    async (updates: { name?: string; unit?: string; costPerUnit?: number; supplier?: string }) => {
      if (!row.isDb) return;
      setSaving(true);
      const res = await fetch(`/api/ingredients/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      setSaving(false);
      if (res.ok) router.refresh();
    },
    [row.id, row.isDb, router]
  );

  if (!row.isDb) {
    return (
      <TableRow className="[&>td]:px-2 [&>td]:py-1">
        {!hiddenCols.has("name") && <TableCell className="font-medium">{row.name}</TableCell>}
        {!hiddenCols.has("unit") && <TableCell>{row.unit}</TableCell>}
        {!hiddenCols.has("cost") && <TableCell className="text-right">{row.cost}</TableCell>}
        {!hiddenCols.has("supplier") && <TableCell className="text-muted-foreground">{row.supplier}</TableCell>}
        {!hiddenCols.has("project") && <TableCell className="text-muted-foreground">{row.projectName}</TableCell>}
      </TableRow>
    );
  }

  return (
    <TableRow className="[&>td]:px-2 [&>td]:py-1">
      {!hiddenCols.has("name") && (
        <TableCell>
          <Input
            className="h-8 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => name !== row.name && save({ name })}
          />
        </TableCell>
      )}
      {!hiddenCols.has("unit") && (
        <TableCell>
          <Select value={UNIT_OPTIONS.includes(unit) ? unit : "unit"} onValueChange={(v) => { setUnit(v); save({ unit: v }); }}>
            <SelectTrigger className="h-8 text-sm min-w-[60px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(UNIT_OPTIONS.includes(unit) ? UNIT_OPTIONS : [unit, ...UNIT_OPTIONS]).map((u) => (
                <SelectItem key={u} value={u}>{u}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </TableCell>
      )}
      {!hiddenCols.has("cost") && (
        <TableCell className="text-right">
          <Input
            className="h-8 w-16 text-right text-sm"
            type="number"
            step="0.01"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            onBlur={() => {
              const n = parseFloat(cost);
              if (!isNaN(n) && n >= 0) save({ costPerUnit: n });
            }}
          />
        </TableCell>
      )}
      {!hiddenCols.has("supplier") && (
        <TableCell>
          <Input
            className="h-8 text-sm"
            list={`suppliers-${row.id}`}
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            onBlur={() => save({ supplier: supplier || undefined })}
            placeholder="Type or select supplier"
          />
          <datalist id={`suppliers-${row.id}`}>
            {suppliers.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </TableCell>
      )}
      {!hiddenCols.has("project") && (
        <TableCell className="text-muted-foreground">{row.projectName}</TableCell>
      )}
    </TableRow>
  );
}
