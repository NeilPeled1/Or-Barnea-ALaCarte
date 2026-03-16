"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const dbTabs = [
  { href: "", label: "Overview" },
  { href: "/recipes", label: "Recipes" },
  { href: "/menus", label: "Menus" },
  { href: "/tasks", label: "Tasks" },
  { href: "/files", label: "Files" },
  { href: "/messages", label: "Messages" },
];

const sheffieldTabs = [
  { href: "", label: "Overview" },
  { href: "/recipes", label: "Recipes" },
  { href: "/menus", label: "Menus" },
  { href: "/ingredients", label: "Ingredients" },
  { href: "/documents", label: "Documents" },
];

export function ProjectNav({ base, isSheffield }: { base: string; isSheffield?: boolean }) {
  const tabs = isSheffield ? sheffieldTabs : dbTabs;
  const pathname = usePathname();

  return (
    <nav className="flex gap-2 border-b">
      {tabs.map((t) => {
        const href = t.href ? `${base}${t.href}` : base;
        const isActive =
          (t.href === "" && pathname === base) ||
          (t.href !== "" && pathname.startsWith(href));
        return (
          <Link
            key={t.href || "overview"}
            href={href}
            className={cn(
              "border-b-2 px-4 py-2 text-sm font-medium transition-colors",
              isActive
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {t.label}
          </Link>
        );
      })}
    </nav>
  );
}
