/**
 * Import projects, ingredients, recipes, menus from JSON files in data/
 * Run: DATABASE_URL=your_url npx tsx scripts/import-from-files.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();
const dataDir = path.join(process.cwd(), "data");

interface ProjectJson {
  name: string;
  description?: string;
  organization: string;
  status?: string;
}

interface IngredientJson {
  name: string;
  unit: string;
  costPerUnit: number;
  supplier?: string;
}

interface RecipeIngredientRef {
  name: string;
  quantity: number;
  unit: string;
}

interface RecipeJson {
  name: string;
  description?: string;
  category?: string;
  prepTime?: number;
  instructions?: string;
  ingredients: RecipeIngredientRef[];
}

interface MenuItemRef {
  recipeName: string;
  dishName?: string;
  sellingPrice: number;
}

interface MenuJson {
  name: string;
  items: MenuItemRef[];
}

async function ensureOrg(name: string) {
  let org = await prisma.organization.findFirst({ where: { name } });
  if (!org) {
    org = await prisma.organization.create({ data: { name, type: "restaurant" } });
  }
  return org;
}

async function main() {
  if (!fs.existsSync(dataDir)) {
    console.log("No data/ folder found. Create data/project-name/ with project.json, ingredients.json, recipes.json, menus.json");
    process.exit(0);
  }

  const projectDirs = fs.readdirSync(dataDir).filter((f) => {
    const full = path.join(dataDir, f);
    return fs.statSync(full).isDirectory() && !f.startsWith(".");
  });

  if (projectDirs.length === 0) {
    console.log("No project folders in data/. Add folders like data/project-1/");
    process.exit(0);
  }

  for (const dir of projectDirs) {
    const dirPath = path.join(dataDir, dir);
    const projectFile = path.join(dirPath, "project.json");
    if (!fs.existsSync(projectFile)) {
      console.warn(`Skipping ${dir}: no project.json`);
      continue;
    }

    const projectData: ProjectJson = JSON.parse(fs.readFileSync(projectFile, "utf-8"));
    const org = await ensureOrg(projectData.organization);

    let project = await prisma.project.findFirst({
      where: { name: projectData.name, organizationId: org.id },
    });
    if (!project) {
      project = await prisma.project.create({
        data: {
          name: projectData.name,
          description: projectData.description ?? null,
          status: projectData.status ?? "active",
          organizationId: org.id,
        },
      });
      console.log(`Created project: ${project.name}`);
    }

    // Ingredients
    const ingredientsMap = new Map<string, string>();
    const ingredientsFile = path.join(dirPath, "ingredients.json");
    if (fs.existsSync(ingredientsFile)) {
      const ingredients: IngredientJson[] = JSON.parse(fs.readFileSync(ingredientsFile, "utf-8"));
      for (const ing of ingredients) {
        let i = await prisma.ingredient.findFirst({ where: { name: ing.name } });
        if (!i) {
          i = await prisma.ingredient.create({
            data: {
              name: ing.name,
              unit: ing.unit,
              costPerUnit: ing.costPerUnit,
              supplier: ing.supplier ?? null,
            },
          });
        }
        ingredientsMap.set(ing.name, i.id);
      }
      console.log(`  Ingredients: ${ingredients.length}`);
    }

    // Recipes
    const recipesMap = new Map<string, string>();
    const recipesFile = path.join(dirPath, "recipes.json");
    if (fs.existsSync(recipesFile)) {
      const recipes: RecipeJson[] = JSON.parse(fs.readFileSync(recipesFile, "utf-8"));
      for (const r of recipes) {
        let recipe = await prisma.recipe.findFirst({
          where: { name: r.name, projectId: project.id },
        });
        if (!recipe) {
          recipe = await prisma.recipe.create({
            data: {
              name: r.name,
              description: r.description ?? null,
              category: r.category ?? null,
              prepTime: r.prepTime ?? null,
              instructions: r.instructions ?? null,
              projectId: project.id,
              recipeIngredients: {
                create: r.ingredients
                  .filter((ri) => ingredientsMap.has(ri.name))
                  .map((ri) => ({
                    ingredientId: ingredientsMap.get(ri.name)!,
                    quantity: ri.quantity,
                    unit: ri.unit,
                  })),
              },
            },
          });
        }
        recipesMap.set(r.name, recipe.id);
      }
      console.log(`  Recipes: ${recipes.length}`);
    }

    // Menus
    const menusFile = path.join(dirPath, "menus.json");
    if (fs.existsSync(menusFile)) {
      const menus: MenuJson[] = JSON.parse(fs.readFileSync(menusFile, "utf-8"));
      for (const m of menus) {
        let menu = await prisma.menu.findFirst({
          where: { name: m.name, projectId: project.id },
        });
        if (!menu) {
          const items = m.items
            .filter((item) => recipesMap.has(item.recipeName))
            .map((item) => ({
              recipeId: recipesMap.get(item.recipeName)!,
              dishName: item.dishName ?? null,
              sellingPrice: item.sellingPrice,
            }));
          if (items.length > 0) {
            menu = await prisma.menu.create({
              data: {
                name: m.name,
                projectId: project.id,
                items: { create: items },
              },
            });
            console.log(`  Menu: ${menu.name} (${items.length} items)`);
          }
        }
      }
    }
  }

  console.log("Import complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
