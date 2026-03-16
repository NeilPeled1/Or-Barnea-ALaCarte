/**
 * Parsed Sheffield content - recipes, menus, ingredients for unified views
 */

import sheffieldData from "./sheffield-extracted.json";
import { SHEFFIELD_PROJECT_ID } from "./sheffield-project";

const raw = sheffieldData as Record<string, { file: string; content: string }>;

// --- Recipes ---
export interface ParsedRecipe {
  id: string;
  name: string;
  nameHe: string;
  projectId: string;
  projectName: string;
  category?: string;
  ingredients: { name: string; quantity: string }[];
  instructions: string[];
}

function parseRecipes(): ParsedRecipe[] {
  const content = (raw.recipe_book?.content ?? "") + "\n" + (raw.recipe_book_alt?.content ?? "");
  const recipes: ParsedRecipe[] = [];
  const lines = content.split("\n").filter(Boolean);

  let currentName = "";
  let currentInstructions: string[] = [];
  let currentIngredients: { name: string; quantity: string }[] = [];
  let inInstructions = false;
  let inIngredients = false;

  const flushRecipe = () => {
    if (currentName && (currentInstructions.length > 0 || currentIngredients.length > 0)) {
      recipes.push({
        id: `sheffield-recipe-${recipes.length}`,
        name: currentName,
        nameHe: currentName,
        projectId: SHEFFIELD_PROJECT_ID,
        projectName: "Sheffield Bar",
        ingredients: currentIngredients,
        instructions: currentInstructions,
      });
    }
    currentInstructions = [];
    currentIngredients = [];
    inInstructions = false;
    inIngredients = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (trimmed.startsWith("אופן הכנה") || trimmed.startsWith("אופן ההכנה")) {
      inInstructions = true;
      const afterColon = trimmed.split(/[：:]/).slice(1).join(":").trim();
      if (afterColon) currentInstructions.push(afterColon);
      continue;
    }

    if (trimmed === "מוצר\tכמות" || (trimmed.startsWith("מוצר\t") && trimmed.length < 20)) {
      inInstructions = false;
      inIngredients = true;
      continue;
    }

    if (inIngredients && trimmed.includes("\t")) {
      const [name, qty] = trimmed.split("\t");
      if (name && name !== "מוצר" && name !== "סה\"כ" && !name.includes("עלות")) {
        currentIngredients.push({ name: name.trim(), quantity: (qty ?? "").trim() });
      }
      continue;
    }

    if (inInstructions && trimmed && !trimmed.startsWith("---")) {
      currentInstructions.push(trimmed);
      continue;
    }

    if (inInstructions && trimmed === "") continue;

    const looksLikeRecipeName = trimmed.match(/^[\u0590-\u05FF\s\-']+$/) && trimmed.length > 2 && trimmed.length < 80 && !trimmed.includes(":");
    if (looksLikeRecipeName && !trimmed.startsWith("---") && !trimmed.startsWith("ספר")) {
      if (currentName && (currentInstructions.length > 0 || currentIngredients.length > 0)) {
        flushRecipe();
      }
      currentName = trimmed;
      inInstructions = false;
      inIngredients = false;
    }
  }
  flushRecipe();

  return recipes;
}

// --- Menus ---
export interface ParsedMenuItem {
  name: string;
  description?: string;
  price?: string;
}

export interface ParsedMenuSection {
  title: string;
  items: ParsedMenuItem[];
}

export interface ParsedMenu {
  id: string;
  name: string;
  projectId: string;
  projectName: string;
  sections: ParsedMenuSection[];
}

function parseMenuContent(content: string): ParsedMenuSection[] {
  const sections: ParsedMenuSection[] = [];
  const lines = content.split("\n").filter(Boolean);
  let currentSection: ParsedMenuSection | null = null;

  const sectionHeaders = ["SHARING", "PIZZA", "MAIN DISHES", "SIDE DISHES", "Sliders", "קינוחים", "ראשונות", "עיקריות"];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const isSection = sectionHeaders.some((h) => trimmed.toUpperCase().startsWith(h.toUpperCase())) || /^[A-Z\s]+$/.test(trimmed);

    if (isSection && trimmed.length < 50) {
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: trimmed, items: [] };
      continue;
    }

    if (currentSection) {
      const prevItem = currentSection.items[currentSection.items.length - 1];
      if (prevItem && !prevItem.description && trimmed.length > 10 && trimmed.match(/[\u0590-\u05FF]/)) {
        prevItem.description = trimmed;
      } else if (trimmed.match(/[\u0590-\u05FF]/) && trimmed.length > 2) {
        currentSection.items.push({ name: trimmed });
      }
    }
  }
  if (currentSection && currentSection.items.length > 0) {
    sections.push(currentSection);
  }
  return sections;
}

function parseMenus(): ParsedMenu[] {
  const menus: ParsedMenu[] = [];

  const mainContent = raw.menu_main?.content ?? "";
  if (mainContent) {
    menus.push({
      id: "sheffield-menu-main",
      name: "Main Menu",
      projectId: SHEFFIELD_PROJECT_ID,
      projectName: "Sheffield Bar",
      sections: parseMenuContent(mainContent),
    });
  }

  const dessertsContent = raw.menu_desserts?.content ?? "";
  if (dessertsContent) {
    const items: ParsedMenuItem[] = dessertsContent.split("\n").filter(Boolean).map((line) => ({ name: line.trim() }));
    menus.push({
      id: "sheffield-menu-desserts",
      name: "Dessert Menu",
      projectId: SHEFFIELD_PROJECT_ID,
      projectName: "Sheffield Bar",
      sections: [{ title: "Desserts", items }],
    });
  }

  return menus;
}

// --- Ingredients ---
export interface ParsedIngredient {
  id: string;
  name: string;
  unit: string;
  cost?: number;
  supplier?: string;
  projectId: string;
  projectName: string;
}

function parseIngredients(): ParsedIngredient[] {
  const ingredients: ParsedIngredient[] = [];
  const seen = new Set<string>();

  const add = (name: string, unit: string, cost?: number, supplier?: string) => {
    const key = name.toLowerCase().trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    ingredients.push({
      id: `sheffield-ing-${ingredients.length}`,
      name,
      unit,
      cost,
      supplier,
      projectId: SHEFFIELD_PROJECT_ID,
      projectName: "Sheffield Bar",
    });
  };

  const equivContent = raw.equivalence?.content ?? "";
  equivContent.split("\n").forEach((line) => {
    const [name, qty] = line.split("\t");
    if (name && name !== "מוצר" && qty) add(name.trim(), qty.trim());
  });

  const productTree = raw.product_tree?.content ?? "";
  const lines = productTree.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split("\t");
    if (parts.length >= 2) {
      const name = parts[0]?.trim();
      const cost = parseFloat(parts[1]?.replace(/[^\d.]/g, "") || "0");
      if (name && name !== "יחידת מידה" && !name.startsWith("---")) {
        add(name, parts[1]?.includes("ק\"ג") ? "kg" : "unit", isNaN(cost) ? undefined : cost);
      }
    }
  }

  return ingredients;
}

// --- Exports ---
export const SHEFFIELD_RECIPES = parseRecipes();
export const SHEFFIELD_MENUS = parseMenus();
export const SHEFFIELD_INGREDIENTS = parseIngredients();
