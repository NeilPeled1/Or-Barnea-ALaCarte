import { auth } from "@/lib/auth";
import { notFound } from "next/navigation";
import { SHEFFIELD_PROJECT_ID } from "@/data/sheffield-project";
import { SHEFFIELD_INGREDIENTS } from "@/data/sheffield-parsed";
import { ESTHER_PROJECT_ID } from "@/data/esther-project";
import { ESTHER_INGREDIENTS } from "@/data/esther-parsed";
import { SheffieldIngredientsView } from "./sheffield-ingredients-view";

export default async function ProjectIngredientsPage({
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
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <SheffieldIngredientsView ingredients={SHEFFIELD_INGREDIENTS} />
      </div>
    );
  }
  if (id === ESTHER_PROJECT_ID) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Ingredients</h2>
        <SheffieldIngredientsView ingredients={ESTHER_INGREDIENTS} />
      </div>
    );
  }
  notFound();
}
