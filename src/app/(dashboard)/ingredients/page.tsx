import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreateIngredientDialog } from "./create-ingredient-dialog";

export default async function IngredientsPage() {
  const session = await auth();
  if (!session?.user) return null;

  let ingredients: Awaited<ReturnType<typeof prisma.ingredient.findMany>> = [];
  try {
    ingredients = await prisma.ingredient.findMany({
    orderBy: { name: "asc" },
  });
  } catch {
    // Demo mode or DB not configured
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Ingredients</h1>
        {session.user.role === "ADMIN" && <CreateIngredientDialog />}
      </div>

      {ingredients.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No ingredients yet. Add ingredients to calculate recipe costs.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Cost</TableHead>
                  <TableHead>Supplier</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-medium">{i.name}</TableCell>
                    <TableCell>{i.unit}</TableCell>
                    <TableCell className="text-right">
                      ${Number(i.costPerUnit).toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {i.supplier ?? "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
