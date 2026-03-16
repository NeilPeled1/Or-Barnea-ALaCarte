import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessProject } from "@/lib/auth-utils";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateRecipeCost, calculateMenuItemMetrics } from "@/lib/recipe-cost";
import { CreateMenuDialog } from "./create-menu-dialog";
import { SHEFFIELD_PROJECT_ID } from "@/data/sheffield-project";
import { SHEFFIELD_MENUS } from "@/data/sheffield-parsed";
import { ESTHER_PROJECT_ID } from "@/data/esther-project";
import { ESTHER_MENUS } from "@/data/esther-parsed";
import { SheffieldMenusView } from "./sheffield-menus-view";

export default async function ProjectMenusPage({
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
        <h2 className="text-xl font-semibold">Menus</h2>
        <SheffieldMenusView menus={SHEFFIELD_MENUS} />
      </div>
    );
  }
  if (id === ESTHER_PROJECT_ID) {
    return (
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Menus</h2>
        <SheffieldMenusView menus={ESTHER_MENUS} />
      </div>
    );
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: { organization: true },
  });
  if (!project || !canAccessProject(session, project.organizationId)) {
    notFound();
  }

  const menus = await prisma.menu.findMany({
    where: { projectId: id },
    include: {
      items: {
        include: {
          recipe: {
            include: { recipeIngredients: { include: { ingredient: true } } },
          },
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Menus</h2>
        {project && <CreateMenuDialog projectId={id} />}
      </div>

      {menus.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center text-muted-foreground">
            No menus yet.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {menus.map((menu) => (
            <Card key={menu.id}>
              <CardHeader>
                <CardTitle>{menu.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-2 text-left font-medium">Dish</th>
                        <th className="pb-2 text-right font-medium">Price</th>
                        <th className="pb-2 text-right font-medium">Cost</th>
                        <th className="pb-2 text-right font-medium">Margin</th>
                        <th className="pb-2 text-right font-medium">FC%</th>
                      </tr>
                    </thead>
                    <tbody>
                      {menu.items.map((item) => {
                        const cost = calculateRecipeCost(item.recipe.recipeIngredients);
                        const { foodCostPct, profitMargin } = calculateMenuItemMetrics(
                          cost,
                          Number(item.sellingPrice)
                        );
                        return (
                          <tr key={item.id} className="border-b">
                            <td className="py-2">{item.dishName ?? item.recipe.name}</td>
                            <td className="py-2 text-right">
                              ${Number(item.sellingPrice).toFixed(2)}
                            </td>
                            <td className="py-2 text-right">${cost.toFixed(2)}</td>
                            <td className="py-2 text-right">
                              ${profitMargin.toFixed(2)}
                            </td>
                            <td className="py-2 text-right">
                              {foodCostPct.toFixed(1)}%
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
