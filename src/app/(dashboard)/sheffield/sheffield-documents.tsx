"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  type SheffieldDoc,
  type DocCategory,
} from "@/data/sheffield-documents";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

export function SheffieldDocuments({
  docs,
  categories,
}: {
  docs: SheffieldDoc[];
  categories: { id: DocCategory; label: string; labelHe: string }[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<DocCategory | "all">("all");

  const filtered = filter === "all" ? docs : docs.filter((d) => d.category === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          variant={filter === "all" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {categories.map((c) => (
          <Button
            key={c.id}
            variant={filter === c.id ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(c.id)}
          >
            {c.label}
          </Button>
        ))}
      </div>

      <div className="grid gap-4">
        {filtered.map((doc) => (
          <DocCard
            key={doc.id}
            doc={doc}
            expanded={expandedId === doc.id}
            onToggle={() => setExpandedId(expandedId === doc.id ? null : doc.id)}
          />
        ))}
      </div>
    </div>
  );
}

function DocCard({
  doc,
  expanded,
  onToggle,
}: {
  doc: SheffieldDoc;
  expanded: boolean;
  onToggle: () => void;
}) {
  const lines = doc.content.split("\n").filter(Boolean);
  const hasMore = lines.length > 3;

  return (
    <Card className="overflow-hidden border border-border/50 bg-card shadow-sm transition-all duration-200 hover:border-primary/20 hover:shadow-md">
      <CardHeader
        className="cursor-pointer select-none pb-3 transition-colors hover:bg-muted/30"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-primary/5 p-2.5 ring-1 ring-primary/10">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-semibold tracking-tight">{doc.title}</CardTitle>
              <p className="mt-0.5 text-sm text-muted-foreground">{doc.titleHe}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 rounded-full">
            {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {expanded && (
        <CardContent className="border-t border-border/50 pt-4">
          <div
            dir="rtl"
            className="max-h-[60vh] overflow-y-auto rounded-lg border border-border/50 bg-muted/20 p-5 font-medium"
          >
            <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground/90">
              {doc.content}
            </pre>
          </div>
        </CardContent>
      )}
      {!expanded && hasMore && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">Click to view full content ({lines.length} lines)</p>
        </CardContent>
      )}
    </Card>
  );
}
