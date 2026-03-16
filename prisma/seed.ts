import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  let org = await prisma.organization.findFirst({
    where: { name: "Bistro Example" },
  });
  if (!org) {
    org = await prisma.organization.create({
      data: { name: "Bistro Example", type: "restaurant" },
    });
  }

  let admin = await prisma.user.findUnique({
    where: { email: "admin@alacarte.com" },
  });
  if (!admin) {
    admin = await prisma.user.create({
      data: {
        email: "admin@alacarte.com",
        name: "Admin User",
        password: hashedPassword,
        role: "ADMIN",
      },
    });
  }

  let client = await prisma.user.findUnique({
    where: { email: "client@bistro.com" },
  });
  if (!client) {
    client = await prisma.user.create({
      data: {
        email: "client@bistro.com",
        name: "Restaurant Owner",
        password: hashedPassword,
        role: "CLIENT",
        organizationId: org.id,
      },
    });
  }

  let proj1 = await prisma.project.findFirst({
    where: { name: "Menu Redesign", organizationId: org.id },
  });
  if (!proj1) {
    proj1 = await prisma.project.create({
      data: {
        name: "Menu Redesign",
        description: "Spring menu overhaul",
        status: "active",
        startDate: new Date("2025-01-15"),
        organizationId: org.id,
      },
    });
  }

  let proj2 = await prisma.project.findFirst({
    where: { name: "Cost Optimization", organizationId: org.id },
  });
  if (!proj2) {
    proj2 = await prisma.project.create({
      data: {
        name: "Cost Optimization",
        description: "Reduce food costs",
        status: "active",
        organizationId: org.id,
      },
    });
  }

  let generalProj = await prisma.project.findFirst({
    where: { name: "General", organizationId: org.id },
  });
  if (!generalProj) {
    generalProj = await prisma.project.create({
      data: {
        name: "General",
        description: "Tasks not assigned to a specific project",
        status: "active",
        organizationId: org.id,
      },
    });
  }

  const ingredientNames = [
    { name: "Chicken breast", unit: "kg", costPerUnit: 8.5, supplier: "Local Farm" },
    { name: "Olive oil", unit: "L", costPerUnit: 12, supplier: "Bulk Foods" },
    { name: "Garlic", unit: "kg", costPerUnit: 6, supplier: "Produce Co" },
    { name: "Lemon", unit: "each", costPerUnit: 0.5, supplier: "Produce Co" },
    { name: "Pasta", unit: "kg", costPerUnit: 3, supplier: "Bulk Foods" },
    { name: "Tomato", unit: "kg", costPerUnit: 4, supplier: "Produce Co" },
    { name: "Basil", unit: "bunch", costPerUnit: 2.5, supplier: "Produce Co" },
    { name: "Flour", unit: "kg", costPerUnit: 1.5, supplier: "Bulk Foods" },
    { name: "Butter", unit: "kg", costPerUnit: 7, supplier: "Dairy Co" },
    { name: "Sugar", unit: "kg", costPerUnit: 2, supplier: "Bulk Foods" },
  ];

  const ingredients: { id: string }[] = [];
  for (const ing of ingredientNames) {
    let i = await prisma.ingredient.findFirst({ where: { name: ing.name } });
    if (!i) {
      i = await prisma.ingredient.create({ data: ing });
    }
    ingredients.push(i);
  }

  const recipesData = [
    {
      name: "Grilled Chicken",
      description: "Herb-marinated grilled chicken breast",
      category: "Main",
      prepTime: 25,
      instructions: "1. Marinate chicken\n2. Grill 6 min per side\n3. Rest and serve",
      projectId: proj1.id,
      ings: [
        { idx: 0, qty: 0.2, unit: "kg" },
        { idx: 1, qty: 0.02, unit: "L" },
        { idx: 2, qty: 0.01, unit: "kg" },
        { idx: 3, qty: 0.5, unit: "each" },
      ],
    },
    {
      name: "Pasta Pomodoro",
      description: "Classic tomato basil pasta",
      category: "Main",
      prepTime: 20,
      instructions: "1. Cook pasta\n2. Make sauce\n3. Combine and serve",
      projectId: proj1.id,
      ings: [
        { idx: 4, qty: 0.15, unit: "kg" },
        { idx: 5, qty: 0.2, unit: "kg" },
        { idx: 6, qty: 0.5, unit: "bunch" },
        { idx: 1, qty: 0.02, unit: "L" },
      ],
    },
    {
      name: "Garlic Bread",
      category: "Starter",
      prepTime: 10,
      projectId: proj1.id,
      ings: [
        { idx: 8, qty: 0.05, unit: "kg" },
        { idx: 2, qty: 0.005, unit: "kg" },
        { idx: 1, qty: 0.01, unit: "L" },
      ],
    },
    {
      name: "Lemon Chicken",
      category: "Main",
      prepTime: 30,
      projectId: proj1.id,
      ings: [
        { idx: 0, qty: 0.2, unit: "kg" },
        { idx: 3, qty: 1, unit: "each" },
        { idx: 1, qty: 0.02, unit: "L" },
      ],
    },
    {
      name: "Simple Salad",
      category: "Starter",
      prepTime: 5,
      projectId: proj2.id,
      ings: [
        { idx: 1, qty: 0.02, unit: "L" },
        { idx: 3, qty: 0.5, unit: "each" },
      ],
    },
  ];

  const recipes: { id: string }[] = [];
  for (const r of recipesData) {
    let recipe = await prisma.recipe.findFirst({
      where: { name: r.name, projectId: r.projectId },
    });
    if (!recipe) {
      recipe = await prisma.recipe.create({
        data: {
          name: r.name,
          description: r.description,
          category: r.category,
          prepTime: r.prepTime,
          instructions: r.instructions,
          projectId: r.projectId,
          recipeIngredients: {
            create: r.ings.map((i) => ({
              ingredientId: ingredients[i.idx].id,
              quantity: i.qty,
              unit: i.unit,
            })),
          },
        },
      });
    }
    recipes.push(recipe);
  }

  let menu = await prisma.menu.findFirst({
    where: { name: "Spring Dinner Menu", projectId: proj1.id },
  });
  if (!menu) {
    menu = await prisma.menu.create({
      data: {
        name: "Spring Dinner Menu",
        projectId: proj1.id,
        items: {
          create: [
            { recipeId: recipes[0].id, sellingPrice: 24 },
            { recipeId: recipes[1].id, sellingPrice: 18 },
            { recipeId: recipes[2].id, sellingPrice: 8 },
            { recipeId: recipes[3].id, sellingPrice: 22 },
          ],
        },
      },
    });
  }

  const taskCount = await prisma.task.count({ where: { projectId: proj1.id } });
  if (taskCount === 0) {
    await prisma.task.createMany({
      data: [
        { projectId: proj1.id, title: "Source suppliers", status: "todo", assignedToId: admin.id },
        { projectId: proj1.id, title: "Test grilled chicken", status: "in_progress", assignedToId: admin.id },
        { projectId: proj1.id, title: "Staff training", status: "todo" },
        { projectId: proj1.id, title: "Menu tasting", status: "todo", dueDate: new Date("2025-02-01") },
        { projectId: proj2.id, title: "Audit current costs", status: "todo" },
      ],
    });
  }

  const msgCount = await prisma.message.count({ where: { projectId: proj1.id } });
  if (msgCount === 0) {
    await prisma.message.create({
      data: {
        projectId: proj1.id,
        authorId: admin.id,
        content: "Welcome to the project! Let me know when you're ready to start the menu redesign.",
      },
    });
  }

  console.log("Seed complete:", {
    org: org.name,
    admin: admin.email,
    client: client.email,
    projects: 2,
    ingredients: ingredients.length,
    recipes: recipes.length,
    menu: menu.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
