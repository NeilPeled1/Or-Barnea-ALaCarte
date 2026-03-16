"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/search-input";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { ParsedMenu } from "@/data/sheffield-parsed";

type DbMenu = {
  id: string;
  name: string;
  projectId: string;
  project?: { name: string; organization?: { name: string } };
  _count?: { items: number };
};

type MenuItem = {
  type: "db" | "sheffield";
  id: string;
  projectId: string;
  name: string;
  projectName: string;
  orgName: string;
  itemCount: number;
  menuType?: string;
};

const MENU_FILTERS = ["all", "Main", "Dessert", "Other"];

function getMenuType(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("main") || n.includes("תפריט")) return "Main";
  if (n.includes("dessert") || n.includes("קינוח")) return "Dessert";
  return "Other";
}

export function MenusPageClient({ dbMenus, sheffieldMenus }: { dbMenus: DbMenu[]; sheffieldMenus: ParsedMenu[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [collapsedProjects, setCollapsedProjects] = useState<Set<string>>(new Set());

  const allItems: MenuItem[] = [
    ...dbMenus.map((m) => ({
      type: "db" as const,
      id: m.id,
      projectId: m.projectId,
      name: m.name,
      projectName: m.project?.name ?? "—",
      orgName: m.project?.organization?.name ?? "—",
      itemCount: m._count?.items ?? 0,
      menuType: getMenuType(m.name),
    })),
    ...sheffieldMenus.map((m) => ({
      type: "sheffield" as const,
      id: m.id,
      projectId: "sheffield",
      name: m.name,
      projectName: m.projectName,
      orgName: m.projectName,
      itemCount: m.sections.reduce((s, sec) => s + sec.items.length, 0),
      menuType: getMenuType(m.name),
    })),
  ];

  const filtered = allItems.filter((m) => {
    const matchSearch = !search || m.name.toLowerCase().includes(search.toLowerCase()) || m.projectName.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || m.menuType === filter;
    return matchSearch && matchFilter;
  });

  const byProject = filtered.reduce<Record<string, MenuItem[]>>((acc, m) => {
    const key = m.projectName;
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  const toggleProject = (proj: string) => {
    setCollapsedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(proj)) next.delete(proj);
      else next.add(proj);
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Menus</h1>
      <p className="text-muted-foreground">All menus across all projects</p>
      <SearchInput value={search} onChange={setSearch} placeholder="Search menus..." className="max-w-md" />
      <div className="flex flex-wrap gap-2">
        {MENU_FILTERS.map((f) => (
          <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" onClick={() => setFilter(f)}>
            {f}
          </Button>
        ))}
      </div>
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">No menus found.</CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {Object.entries(byProject).map(([projectName, menus]) => {
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
                  <span className="text-sm text-muted-foreground">({menus.length} menus)</span>
                </button>
                {!isCollapsed && (
                  <CardContent className="pt-0">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {menus.map((m) => (
                        <Link key={m.id} href={`/projects/${m.projectId}/menus`}>
                          <Card className="transition-colors hover:bg-muted/50">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{m.name}</CardTitle>
                              <p className="text-sm text-muted-foreground">{m.itemCount} items</p>
                            </CardHeader>
                          </Card>
                        </Link>
                      ))}
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
