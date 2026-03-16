/**
 * Sheffield Bar project documents - content embedded from source files
 */

export type DocCategory = "recipes" | "menus" | "ingredients" | "procedures" | "project" | "operations";

export interface SheffieldDoc {
  id: string;
  title: string;
  titleHe: string;
  category: DocCategory;
  content: string;
  sourceFile: string;
}

// Content loaded from extracted JSON
import sheffieldData from "../../data/sheffield-extracted.json";

const raw = sheffieldData as Record<string, { file: string; content: string }>;

const categoryMap: Record<string, DocCategory> = {
  recipe_book: "recipes",
  recipe_book_alt: "recipes",
  menu_main: "menus",
  menu_desserts: "menus",
  menu_prices: "menus",
  product_tree: "ingredients",
  suppliers: "ingredients",
  equivalence: "ingredients",
  opening_orders: "ingredients",
  checklist_stations: "procedures",
  pickup_starters: "procedures",
  pickup_pizza: "procedures",
  pickup_mains: "procedures",
  project_management: "project",
  bar_quote: "project",
  summary: "project",
  sales_data: "operations",
  tools_quantities: "operations",
  orders_presentation: "operations",
};

const titleMap: Record<string, { en: string; he: string }> = {
  recipe_book: { en: "Recipe Book 2026", he: "ספר מתכונים שפילד 2026" },
  recipe_book_alt: { en: "Recipe Book (Alt)", he: "ספר מתכונים שפילד" },
  menu_main: { en: "Main Menu", he: "תפריט שפילד סופי" },
  menu_desserts: { en: "Dessert Menu", he: "תפריט קינוחים" },
  menu_prices: { en: "Menu with Prices", he: "שפילד תפריט עם מחירים" },
  product_tree: { en: "Product Tree & Pricing", he: "עץ מוצר שפילד 2026" },
  suppliers: { en: "Suppliers List", he: "אקסל ספקים 2026" },
  equivalence: { en: "Portion Equivalence", he: "מסמך שקילות" },
  opening_orders: { en: "Opening Orders", he: "הזמנות לפתיחה" },
  checklist_stations: { en: "Station Prep Checklist", he: "צ'קליסט הכנות לפי פסים" },
  pickup_starters: { en: "Starters Pickup", he: "פיק אפ ראשונות" },
  pickup_pizza: { en: "Pizza Station Pickup", he: "פיק אפ פס פיצה" },
  pickup_mains: { en: "Mains Pickup", he: "פיק אפ עיקריות" },
  project_management: { en: "Project Management", he: "ניהול פרויקט שפילד" },
  bar_quote: { en: "Bar Quote", he: "הצעת מחיר שפילד בר" },
  summary: { en: "Visit Summary", he: "סיכום שפילד" },
  sales_data: { en: "Sales Data", he: "נתוני מכירות" },
  tools_quantities: { en: "Tools & Quantities", he: "רשימת כלים וכמויות" },
  orders_presentation: { en: "Orders for Presentation", he: "הזמנות לפרזנטציה" },
};

export const SHEFFIELD_DOCS: SheffieldDoc[] = Object.entries(raw)
  .filter(([, v]) => v.content && !v.content.startsWith("[Error"))
  .map(([key, v]) => ({
    id: key,
    title: titleMap[key]?.en ?? key,
    titleHe: titleMap[key]?.he ?? key,
    category: categoryMap[key] ?? "operations",
    content: v.content,
    sourceFile: v.file,
  }));

export const SHEFFIELD_CATEGORIES: { id: DocCategory; label: string; labelHe: string }[] = [
  { id: "recipes", label: "Recipes", labelHe: "מתכונים" },
  { id: "menus", label: "Menus", labelHe: "תפריטים" },
  { id: "ingredients", label: "Ingredients", labelHe: "מצרכים" },
  { id: "procedures", label: "Procedures", labelHe: "נהלים" },
  { id: "project", label: "Project", labelHe: "פרויקט" },
  { id: "operations", label: "Operations", labelHe: "תפעול" },
];
