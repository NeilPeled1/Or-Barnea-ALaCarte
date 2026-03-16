# Data Import

Place your project files here to import into À La Carte.

## Structure

Create one folder per project. Each folder should contain files for that project:

```
data/
  project-1/           # First project (e.g. "Menu Redesign")
    project.json       # Project info
    ingredients.json   # Ingredients (shared across recipes)
    recipes.json      # Recipes
    menus.json        # Menus
  project-2/           # Second project
    ...
```

## File Formats

### project.json
```json
{
  "name": "Menu Redesign",
  "description": "Spring menu overhaul",
  "organization": "Bistro Example",
  "status": "active"
}
```

### ingredients.json
```json
[
  { "name": "Chicken breast", "unit": "kg", "costPerUnit": 8.5, "supplier": "Local Farm" },
  { "name": "Olive oil", "unit": "L", "costPerUnit": 12, "supplier": "Bulk Foods" }
]
```

### recipes.json
```json
[
  {
    "name": "Grilled Chicken",
    "description": "Herb-marinated grilled chicken",
    "category": "Main",
    "prepTime": 25,
    "instructions": "1. Marinate\n2. Grill\n3. Serve",
    "ingredients": [
      { "name": "Chicken breast", "quantity": 0.2, "unit": "kg" },
      { "name": "Olive oil", "quantity": 0.02, "unit": "L" }
    ]
  }
]
```

### menus.json
```json
[
  {
    "name": "Spring Dinner Menu",
    "items": [
      { "recipeName": "Grilled Chicken", "dishName": "Grilled Chicken Breast", "sellingPrice": 24 },
      { "recipeName": "Pasta Pomodoro", "sellingPrice": 18 }
    ]
  }
]
```

## Import from Google Drive

1. Download files from your Google Drive folder
2. Organize them into the structure above (one folder per project)
3. Run: `npm run import-data`
