"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchInput } from "@/components/search-input";
import type { ParsedMenu, ParsedMenuSection, ParsedMenuItem } from "@/data/sheffield-parsed";

export function SheffieldMenusView({ menus }: { menus: ParsedMenu[] }) {
  const [search, setSearch] = useState("");

  const filteredMenus = menus.map((menu) => ({
    ...menu,
    sections: menu.sections.map((sec) => ({
      ...sec,
      items: search
        ? sec.items.filter(
            (i) =>
              i.name.toLowerCase().includes(search.toLowerCase()) ||
              (i.description ?? "").toLowerCase().includes(search.toLowerCase())
          )
        : sec.items,
    })).filter((sec) => sec.items.length > 0),
  })).filter((m) => m.sections.length > 0);

  return (
    <div className="space-y-6">
      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search menu items..."
        className="max-w-sm"
      />
      {filteredMenus.map((menu) => (
        <Card key={menu.id} className="overflow-hidden">
          <CardHeader>
            <CardTitle>{menu.name}</CardTitle>
            <p className="text-sm text-muted-foreground">{menu.projectName}</p>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-8">
              {menu.sections.map((section) => (
                <MenuSection key={section.title} section={section} />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {filteredMenus.length === 0 && (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No menu items found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function MenuSection({ section }: { section: ParsedMenuSection }) {
  return (
    <div>
      <h3 className="mb-4 border-b pb-2 text-lg font-semibold uppercase tracking-wide text-muted-foreground">
        {section.title}
      </h3>
      <div className="space-y-4" dir="rtl">
        {section.items.map((item, i) => (
          <MenuItemRow key={i} item={item} />
        ))}
      </div>
    </div>
  );
}

function MenuItemRow({ item }: { item: ParsedMenuItem }) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-border/50 pb-3 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <span className="font-medium">{item.name}</span>
        {item.price && (
          <span className="shrink-0 text-muted-foreground">₪{item.price}</span>
        )}
      </div>
      {item.description && (
        <p className="text-sm text-muted-foreground">{item.description}</p>
      )}
    </div>
  );
}
