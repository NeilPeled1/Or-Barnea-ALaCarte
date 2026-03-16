/**
 * Esther Bar project documents - content embedded from source files
 */

export type DocCategory = "recipes" | "menus" | "ingredients" | "procedures" | "project" | "operations";

export interface EstherDoc {
  id: string;
  title: string;
  titleHe: string;
  category: DocCategory;
  content: string;
  sourceFile: string;
}

import estherData from "./esther-extracted.json";

const raw = estherData as Record<string, { file: string; content: string }>;

const categoryMap: Record<string, DocCategory> = {
  recipe_book: "recipes",
  salads: "recipes",
  menu_update: "menus",
  menu_evening: "menus",
  menu_running: "menus",
  draft_cinema: "menus",
  draft_cinema_alt: "menus",
  menu_updated_v1: "menus",
  product_tree: "ingredients",
  opening_orders: "ingredients",
  orders_presentation: "ingredients",
  orders_tasting: "ingredients",
  orders_esther: "ingredients",
  checklist_prep: "procedures",
  pickup_evening: "procedures",
  pickup_salads: "procedures",
  pickup_bread_health: "procedures",
  pickup_sandwiches: "procedures",
  setup_entry: "project",
  cinema_concept: "project",
  menu_conclusions: "project",
  unnamed: "operations",
};

const titleMap: Record<string, { en: string; he: string }> = {
  recipe_book: { en: "Recipe Book", he: "אסתר בר ספר מתכונים" },
  salads: { en: "Salads", he: "סלטים" },
  menu_update: { en: "Menu Update", he: "מסמך עידכון תפריט" },
  menu_evening: { en: "Evening Menu", he: "תפריט ערב" },
  menu_running: { en: "Running Menu", he: "תפריט הרצה" },
  draft_cinema: { en: "Cinema Draft", he: "טיוטה לתפריט קפה סינמה" },
  draft_cinema_alt: { en: "Cinema Draft Alt", he: "טיוטא לתפריט קפה סינמה" },
  menu_updated_v1: { en: "Menu Updated V1", he: "קובץ תפריט מעודכן" },
  product_tree: { en: "Product Tree", he: "עץ מוצר" },
  opening_orders: { en: "Opening Orders", he: "הזמנות לפתיחה" },
  orders_presentation: { en: "Presentation Orders", he: "הזמנות לפרזנטציה" },
  orders_tasting: { en: "Tasting Orders", he: "הזמנות לטעימות" },
  orders_esther: { en: "Esther Orders", he: "הזמנות אסתר בר" },
  checklist_prep: { en: "Prep Checklist", he: "צ'ק ליסט הכנות" },
  pickup_evening: { en: "Evening Pickup", he: "פיק אפ ערב" },
  pickup_salads: { en: "Salads Pickup", he: "פיק אפ סלטים" },
  pickup_bread_health: { en: "Bread & Health Pickup", he: "פיק אפ לחם חם ובוקר בריאות" },
  pickup_sandwiches: { en: "Sandwiches Pickup", he: "פיק אפ כריכים" },
  setup_entry: { en: "Setup Entry", he: "כניסה להקמה" },
  cinema_concept: { en: "Cinema Concept", he: "קפה סינמה קונספט" },
  menu_conclusions: { en: "Menu Conclusions", he: "מסקנות תפריט" },
  unnamed: { en: "Unnamed", he: "מסמך ללא שם" },
};

export const ESTHER_DOCS: EstherDoc[] = Object.entries(raw)
  .filter(([, v]) => v.content && !v.content.startsWith("[Error"))
  .map(([key, v]) => ({
    id: key,
    title: titleMap[key]?.en ?? key,
    titleHe: titleMap[key]?.he ?? key,
    category: categoryMap[key] ?? "operations",
    content: v.content,
    sourceFile: v.file,
  }));

export const ESTHER_CATEGORIES: { id: DocCategory; label: string; labelHe: string }[] = [
  { id: "recipes", label: "Recipes", labelHe: "מתכונים" },
  { id: "menus", label: "Menus", labelHe: "תפריטים" },
  { id: "ingredients", label: "Ingredients", labelHe: "מצרכים" },
  { id: "procedures", label: "Procedures", labelHe: "נהלים" },
  { id: "project", label: "Project", labelHe: "פרויקט" },
  { id: "operations", label: "Operations", labelHe: "תפעול" },
];
