# Demon Wedges Data Synchronization

## Overview
The `demon-wedges-data.ts` file is **AUTO-GENERATED** from the JSON files in the `Info Demon Wedge` folder. All data including images, elements, polarities, and tolerances are kept synchronized using the `sync-demon-wedges-from-json.js` script.

## Structure

### Source Data Files
Located in: `C:\Users\chawa\Downloads\AbyssBuilder\Info Demon Wedge\`

- **Demon Wedge Character.json** - Character wedges (249 items)
- **Demon Wedge Melee Weapon.json** - Melee weapon wedges (89 items)
- **Demon Wedge Ranged Weapon.json** - Ranged weapon wedges (85 items)
- **Demon Wedge Melee Consonance Weapon.json** - Melee consonance wedges (35 items)
- **Demon Wedge Ranged Consonance Weapon.json** - Ranged consonance wedges (35 items)

**Total: 493 Demon Wedges**

### Generated File
- **src/lib/demon-wedges-data.ts** - TypeScript data file with all wedge information

## Data Mapping

### From JSON to TypeScript

Each JSON entry is converted with the following mapping:

| JSON Field | TypeScript Field | Notes |
| :--- | :--- | :--- |
| `id` | `id` | Unique identifier (UUID) |
| `name` | `fullName` | Full name from JSON (e.g., "Phoenix's Blaze - Wings") |
| Base name extracted from `name` | `name` | Clean base name (e.g., "Phoenix's Blaze") |
| `rarity` | `rarity` | 2, 3, 4, or 5 stars |
| `images.main` | `image` | Main wedge image URL |
| `images.element` | `elementIcon` | Element icon URL |
| `images.polarity` | `trackIcon` | Polarity/track icon URL |
| `tolerance` | `tolerance` | Tolerance value |
| Extracted from `images.polarity` | `type` | Circle, Diamond, Moon, Rhombus, or Normal |
| Extracted from `images.element` | `element` | Pyro, Hydro, Electro, Lumino, Anemo, Umbro |
| `stats.base.*` | `stats[]` | Array of stat objects |
| `effect` | `description` | Effect description |
| Filename determines | `category` | character, melee-weapon, ranged-weapon, melee-consonance, ranged-consonance |
| Based on category | `usage` | Character, Weapon, or Consonance Weapon |

### Tags Generation
Tags are automatically extracted from:
1. The base name (split by spaces)
2. The suffix after " - "
3. Category tags (Character, Melee, Ranged, Consonance)

Example: "Phoenix's Blaze - Wings" (Character) → tags: ["Phoenix's", "Blaze", "Wings", "Character"]

## Sync Process

### To Update Data

Run the sync script:
```bash
node scripts/sync-demon-wedges-from-json.js
```

This will:
1. Read all 5 JSON files from the `Info Demon Wedge` folder
2. Parse and convert each entry to TypeScript format
3. Generate the complete `src/lib/demon-wedges-data.ts` file
4. Output a summary of loaded items

### Expected Output
```
🔄 Syncing Demon Wedges from JSON files...
✅ Loaded 249 items from character
✅ Loaded 89 items from melee-weapon
✅ Loaded 85 items from ranged-weapon
✅ Loaded 35 items from melee-consonance
✅ Loaded 35 items from ranged-consonance
📦 Total items: 493
✨ Successfully generated: C:\...\src\lib\demon-wedges-data.ts

📊 Summary:
   - Total Demon Wedges: 493
   - Characters: 249
   - Melee Weapons: 89
   - Ranged Weapons: 85
   - Melee Consonance: 35
   - Ranged Consonance: 35
```

## Data Validation

The sync script ensures:
- ✅ All image URLs are correctly captured from JSON
- ✅ Element icons are extracted and formatted
- ✅ Polarity icons are extracted and formatted as track icons
- ✅ Tolerance values are preserved exactly
- ✅ Stats are correctly mapped to each wedge
- ✅ Categories are properly assigned based on source file
- ✅ Usage types are correctly determined (Character/Weapon/Consonance Weapon)
- ✅ No data is lost or corrupted during conversion

## Important Notes

⚠️ **DO NOT manually edit** `src/lib/demon-wedges-data.ts` - it will be overwritten!

✨ **Always update** the source JSON files in `Info Demon Wedge/` folder, then run the sync script.

## Display in UI

The `DemonWedgeCard` component displays:
- Main image (from `image`)
- Element icon (from `elementIcon` or derived from `element`)
- Track/Polarity icon (from `trackIcon` or derived from `type`)
- Full name, stats, tolerance, and track information
- Rarity-based styling

All icons and images are loaded from the CDN URLs stored in the data.
