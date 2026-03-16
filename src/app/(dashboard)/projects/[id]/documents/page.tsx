import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { SHEFFIELD_PROJECT_ID } from "@/data/sheffield-project";
import { SHEFFIELD_DOCS, SHEFFIELD_CATEGORIES } from "@/data/sheffield-documents";
import { SheffieldDocuments } from "@/app/(dashboard)/sheffield/sheffield-documents";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) return null;

  const { id } = await params;
  if (id !== SHEFFIELD_PROJECT_ID) notFound();

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Documents</h2>
      <SheffieldDocuments docs={SHEFFIELD_DOCS} categories={SHEFFIELD_CATEGORIES} />
    </div>
  );
}
