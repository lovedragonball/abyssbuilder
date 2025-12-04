# Consonance Wedge Filtering - Code Flow Diagram

## Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    TeamPresetBuilder.tsx                         │
│  (Handles Team Preset Creation with Melee/Range Weapons)        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
     ┌───────────────────────────────────────┐
     │  User clicks "Select Wedge" for:      │
     │  - Main Character Melee Weapon        │
     │  - Main Character Range Weapon        │
     │  - Support 1 Melee Weapon             │
     │  - Support 1 Range Weapon             │
     │  - Support 2 Melee Weapon             │
     │  - Support 2 Range Weapon             │
     └────────────────┬──────────────────────┘
                      │
                      ▼
     ┌─────────────────────────────────────────────────┐
     │    WedgeSelectionModal opens with:              │
     │    allowedCategories = ['melee-weapon'] OR      │
     │                        ['ranged-weapon']        │
     │                                                 │
     │    ⚠️  NEVER includes:                          │
     │    - 'melee-consonance' ❌                      │
     │    - 'ranged-consonance' ❌                     │
     └────────────────┬────────────────────────────────┘
                      │
                      ▼
     ┌──────────────────────────────────────────────────────┐
     │  WedgeSelectionModal.tsx                             │
     │  Calls: filterDemonWedges(allDemonWedges, {          │
     │    categories: allowedCategories                     │
     │  })                                                  │
     └────────────────┬─────────────────────────────────────┘
                      │
                      ▼
     ┌──────────────────────────────────────────────────────┐
     │  demon-wedges-data.ts                                │
     │  filterDemonWedges() function:                        │
     │                                                      │
     │  if (options.categories) {                           │
     │    if (!categories.includes(wedge.category))         │
     │      return false; // ← Filter out consonance        │
     │  }                                                   │
     │                                                      │
     │  Returns ONLY:                                       │
     │  ✅ 'melee-weapon' wedges      (for Melee)          │
     │  ✅ 'ranged-weapon' wedges     (for Range)          │
     │  ❌ 'melee-consonance' blocked                      │
     │  ❌ 'ranged-consonance' blocked                     │
     └────────────────┬─────────────────────────────────────┘
                      │
                      ▼
     ┌──────────────────────────────────────────────────────┐
     │  Display filtered wedges to user                     │
     │  Only regular Melee or Range weapon wedges shown    │
     │  Consonance wedges are NOT visible                   │
     └──────────────────────────────────────────────────────┘
```

---

## Data Structure Reference

### DemonWedge Interface (from demon-wedges-data.ts)
```typescript
interface DemonWedge {
  id: string;
  name: string;
  fullName: string;
  category: DemonWedgeCategory;  // ← This is the key field
  type: DemonWedgeType;
  rarity: DemonWedgeRarity;
  element?: DemonWedgeElement;
  polarity?: string;
  tolerance: number;
  usage: string;
  tags: string[];
  // ... more fields
}

type DemonWedgeCategory = 
  | 'character'
  | 'melee-weapon'       ✅ Allowed for weapon wedges
  | 'ranged-weapon'      ✅ Allowed for weapon wedges
  | 'melee-consonance'   ❌ NOT allowed for weapon wedges
  | 'ranged-consonance'; ❌ NOT allowed for weapon wedges
```

---

## AllowedCategories Matrix

### Weapon Wedge Selection

| Scenario | Melee Weapon | Range Weapon |
|----------|-------------|-------------|
| **Main Character** | `['melee-weapon']` | `['ranged-weapon']` |
| **Support 1** | `['melee-weapon']` | `['ranged-weapon']` |
| **Support 2** | `['melee-weapon']` | `['ranged-weapon']` |

**Result**: ✅ Consonance wedges automatically filtered out

### Character Wedge Selection

| Scenario |
|----------|
| **Main Character** |
| `['character']` |
| **Support 1** |
| `['character']` |
| **Support 2** |
| `['character']` |

**Result**: ✅ Consonance wedges NOT applicable (not in 'character' category)

---

## Testing Scenarios

### ✅ Correct Behavior (Should Work)
1. Select Melee Weapon → See only 'melee-weapon' category wedges
2. Select Range Weapon → See only 'ranged-weapon' category wedges
3. Character Wedge → See only 'character' category wedges

### ❌ Incorrect Behavior (Should NOT Happen)
1. Select Melee Weapon → See 'melee-consonance' wedges (**BLOCKED**)
2. Select Range Weapon → See 'ranged-consonance' wedges (**BLOCKED**)

---

## Why This Design?

Consonance weapons are special weapons that have their own dedicated wedge types:
- **Regular Melee Weapon** → Uses `'melee-weapon'` category wedges
- **Regular Range Weapon** → Uses `'ranged-weapon'` category wedges
- **Consonance Melee Weapon** → Uses `'melee-consonance'` category wedges (for consonanceWedges field)
- **Consonance Range Weapon** → Uses `'ranged-consonance'` category wedges (for consonanceWedges field)

This separation ensures:
1. Correct damage calculations
2. Proper visual representation
3. No mixing of incompatible wedge types

---

## Implementation Status

✅ **All weapon wedge selections correctly exclude Consonance wedges**
✅ **Code properly documented with comments**
✅ **No errors or warnings**
