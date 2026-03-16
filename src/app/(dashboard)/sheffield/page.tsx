import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SHEFFIELD_DOCS, SHEFFIELD_CATEGORIES } from "@/data/sheffield-documents";
import { SheffieldDocuments } from "./sheffield-documents";

export default async function SheffieldPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  return (
    <div className="space-y-8">
      <div className="border-b border-border/50 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Sheffield Bar</h1>
        <p className="mt-1 text-muted-foreground">
          Project documents & knowledge base — בר שפילד
        </p>
      </div>

      <SheffieldDocuments
        docs={SHEFFIELD_DOCS}
        categories={SHEFFIELD_CATEGORIES}
      />
    </div>
  );
}
