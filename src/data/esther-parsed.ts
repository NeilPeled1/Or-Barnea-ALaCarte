/**
 * Parsed Esther Bar content - recipes, menus, ingredients for unified views
 */

import estherData from "./esther-extracted.json";
import { ESTHER_PROJECT_ID } from "./esther-project";
import type { ParsedRecipe, ParsedMenu, ParsedMenuSection, ParsedMenuItem, ParsedIngredient } from "./sheffield-parsed";

const raw = estherData as Record<string, { file: string; content: string }>;

function parseRecipes(): ParsedRecipe[] {
  const content = (raw.recipe_book?.content ?? "") + "\n" + (raw.salads?.content ?? "");
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
        id: `esther-recipe-${recipes.length}`,
        name: currentName,
        nameHe: currentName,
        projectId: ESTHER_PROJECT_ID,
        projectName: "אסתר בר דיזינגוף",
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
    if (looksLikeRecipeName && !trimmed.startsWith("---") && !trimmed.startsWith("ספר") && !trimmed.startsWith("מרכיבים")) {
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

function parseMenuSection(content: string, sectionTitle: string): ParsedMenuSection {
  const items: ParsedMenuItem[] = [];
  const lines = content.split("\n").filter(Boolean);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("---") || trimmed.startsWith("קטגוריה") || trimmed.startsWith("שם המנה")) continue;
    const priceMatch = trimmed.match(/(\d+\.?\d*)\s*$/);
    const price = priceMatch ? priceMatch[1] : undefined;
    const name = priceMatch ? trimmed.replace(/\s*\d+\.?\d*\s*$/, "").trim() : trimmed;
    if (name && name.length > 1) {
      items.push({ name, price });
    }
  }
  return { title: sectionTitle, items };
}

function parseMenus(): ParsedMenu[] {
  const menus: ParsedMenu[] = [];
  const projectName = "אסתר בר דיזינגוף";

  const draftContent = raw.draft_cinema_alt?.content ?? "";
  const menuUpdateContent = raw.menu_update?.content ?? "";
  const menuRunningContent = raw.menu_running?.content ?? "";
  const menuEveningContent = raw.menu_evening?.content ?? "";
  const menuV1Content = raw.menu_updated_v1?.content ?? "";

  const allMenuContent = [draftContent, menuUpdateContent, menuRunningContent, menuEveningContent, menuV1Content].join("\n");

  const sections: ParsedMenuSection[] = [];
  const sectionTitles = ["כריכי בוקר", "סלטים", "לחם חם", "בריאות", "מאפים", "כריכי פניני", "מגשי ערב"];
  const lines = allMenuContent.split("\n").filter(Boolean);
  let currentSection: ParsedMenuSection | null = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("---") || trimmed.startsWith("קטגוריה") || trimmed.startsWith("שם המנה")) continue;

    const isSection = sectionTitles.some((t) => trimmed.includes(t) && trimmed.length < 40);
    if (isSection && trimmed.length < 50) {
      if (currentSection && currentSection.items.length > 0) {
        sections.push(currentSection);
      }
      currentSection = { title: trimmed, items: [] };
      continue;
    }

    if (currentSection) {
      const priceMatch = trimmed.match(/(\d+\.?\d*)\s*$/);
      const price = priceMatch ? priceMatch[1] : undefined;
      const name = priceMatch ? trimmed.replace(/\s*\d+\.?\d*\s*$/, "").trim() : trimmed;
      if (name && name.length > 2 && !name.includes("דוגמא") && !name.includes("לשנות")) {
        currentSection.items.push({ name, price });
      }
    }
  }
  if (currentSection && currentSection.items.length > 0) {
    sections.push(currentSection);
  }

  if (sections.length > 0) {
    menus.push({
      id: "esther-menu-main",
      name: "תפריט ראשי",
      projectId: ESTHER_PROJECT_ID,
      projectName,
      sections,
    });
  }

  const saladsContent = raw.salads?.content ?? "";
  if (saladsContent) {
    const saladItems = saladsContent.split("\n").filter(Boolean).map((l) => l.trim()).filter((l) => l.length > 2 && !l.startsWith("אופן"));
    if (saladItems.length > 0) {
      menus.push({
        id: "esther-menu-salads",
        name: "סלטים",
        projectId: ESTHER_PROJECT_ID,
        projectName,
        sections: [{ title: "סלטים", items: saladItems.map((n) => ({ name: n })) }],
      });
    }
  }

  return menus;
}

function parseIngredients(): ParsedIngredient[] {
  const ingredients: ParsedIngredient[] = [];
  const seen = new Set<string>();

  const add = (name: string, unit: string, cost?: number, supplier?: string) => {
    const key = name.toLowerCase().trim();
    if (!key || seen.has(key)) return;
    seen.add(key);
    ingredients.push({
      id: `esther-ing-${ingredients.length}`,
      name,
      unit,
      cost,
      supplier,
      projectId: ESTHER_PROJECT_ID,
      projectName: "אסתר בר דיזינגוף",
    });
  };

  const productTree = raw.product_tree?.content ?? "";
  const lines = productTree.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const parts = lines[i].split("\t");
    if (parts.length >= 2) {
      const name = parts[0]?.trim();
      const costVal = parts[1]?.replace(/[^\d.]/g, "") || "0";
      const cost = parseFloat(costVal);
      if (name && name !== "יחידת מידה" && !name.startsWith("---") && !name.includes("Sheet") && !name.includes("#DIV")) {
        const unit = parts[1]?.includes("ק\"ג") ? "kg" : parts[1]?.includes("יח") ? "unit" : "g";
        add(name, unit, isNaN(cost) ? undefined : cost);
      }
    }
  }

  return ingredients;
}

export const ESTHER_RECIPES = parseRecipes();
export const ESTHER_MENUS = parseMenus();
export const ESTHER_INGREDIENTS = parseIngredients();
