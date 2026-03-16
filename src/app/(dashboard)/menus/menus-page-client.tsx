"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/search-input";
import type { ParsedMenu } from "@/data/sheffield-parsed";

type DbMenu = {
  id: string;
  name: string;
  projectId: string;
  project?: { name: string; organization?: { name: string } };
  _count?: { items: number };
};

export function MenusPageClient({
  dbMenus,
  sheffieldMenus,
}: {
  dbMenus: DbMenu[];
  sheffieldMenus: ParsedMenu[];
}) {
  const [search, setSearch] = useState("");

  const allItems = [
    ...dbMenus.map((m) => ({
      type: "db" as const,
      id: m.id,
      projectId: m.projectId,
      name: m.name,
      projectName: m.project?.name ?? "—",
      orgName: m.project?.organization?.name ?? "—",
      itemCount: m._count?.items ?? 0,
    })),
    ...sheffieldMenus.map((m) => ({
      type: "sheffield" as const,
      id: m.id,
      projectId: "sheffield",
      name: m.name,
      projectName: m.projectName,
      orgName: m.projectName,
      itemCount: m.sections.reduce((s, sec) => s + sec.items.length, 0),
    })),
  ];

  const filtered = allItems.filter(
    (m) =>
      !search ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.projectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Menus</h1>
      <p className="text-muted-foreground">
        All menus across all projects
      </p>
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search menus..."
        className="max-w-md"
      />
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No menus found.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Link
              key={m.id}
              href={`/projects/${m.projectId}/menus`}
            >
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{m.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {m.orgName} · {m.projectName}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {m.itemCount} items
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
