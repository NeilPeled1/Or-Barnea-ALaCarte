import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { SHEFFIELD_PROJECT_ID } from "@/data/sheffield-project";
import { SHEFFIELD_DOCS, SHEFFIELD_CATEGORIES } from "@/data/sheffield-documents";
import { ESTHER_PROJECT_ID } from "@/data/esther-project";
import { ESTHER_DOCS, ESTHER_CATEGORIES } from "@/data/esther-documents";
import { SheffieldDocuments } from "@/app/(dashboard)/sheffield/sheffield-documents";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  if (id === SHEFFIELD_PROJECT_ID) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Documents</h2>
        <SheffieldDocuments docs={SHEFFIELD_DOCS} categories={SHEFFIELD_CATEGORIES} />
      </div>
    );
  }
  if (id === ESTHER_PROJECT_ID) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Documents</h2>
        <SheffieldDocuments docs={ESTHER_DOCS as typeof SHEFFIELD_DOCS} categories={ESTHER_CATEGORIES} />
      </div>
    );
  }
  notFound();
}
