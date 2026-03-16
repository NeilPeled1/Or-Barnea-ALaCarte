import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SHEFFIELD_INGREDIENTS } from "@/data/sheffield-parsed";
import { ESTHER_INGREDIENTS } from "@/data/esther-parsed";
import { IngredientsPageClient } from "./ingredients-page-client";
import { CreateIngredientDialog } from "./create-ingredient-dialog";

export default async function IngredientsPage() {
  const session = await auth();
  if (!session?.user) return null;

  let dbIngredients: Awaited<ReturnType<typeof prisma.ingredient.findMany>> = [];
  try {
    dbIngredients = await prisma.ingredient.findMany({
      orderBy: { name: "asc" },
    });
  } catch {
    // Demo mode or DB not configured
  }

  const staticIngredients = [...SHEFFIELD_INGREDIENTS, ...ESTHER_INGREDIENTS];
  const existingSuppliers = [
    ...new Set([
      ...dbIngredients.map((i) => i.supplier).filter(Boolean) as string[],
      ...staticIngredients.map((i) => i.supplier).filter(Boolean) as string[],
    ]),
  ].sort();

  return (
    <div className="space-y-6">
      <IngredientsPageClient
        dbIngredients={dbIngredients}
        sheffieldIngredients={staticIngredients}
        createButton={session.user.role === "ADMIN" ? <CreateIngredientDialog existingSuppliers={existingSuppliers} /> : undefined}
      />
    </div>
  );
}
