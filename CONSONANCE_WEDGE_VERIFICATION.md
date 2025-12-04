# Consonance Weapon Wedge Verification Report

**Date**: December 2, 2025  
**Status**: ✅ VERIFIED & DOCUMENTED

## Summary
Verified that Consonance Weapon type Demon Wedges are correctly **excluded** from Melee Weapon Wedges and Range Weapon Wedges selection for:
- ✅ Main Character
- ✅ Support Character 1
- ✅ Support Character 2

---

## Verification Details

### Demon Wedge Categories in the System
The system has 5 categories of Demon Wedges:
1. **'character'** - Demon Wedges สำหรับตัวละคร
2. **'melee-weapon'** - Demon Wedges สำหรับ Melee Weapons ธรรมดา
3. **'ranged-weapon'** - Demon Wedges สำหรับ Ranged Weapons ธรรมดา
4. **'melee-consonance'** - Demon Wedges สำหรับ Melee Consonance Weapons ⛔ EXCLUDED
5. **'ranged-consonance'** - Demon Wedges สำหรับ Ranged Consonance Weapons ⛔ EXCLUDED

### Filtering Logic in TeamPresetBuilder.tsx

#### File: `src/components/calculator/TeamPresetBuilder.tsx`
**Lines**: 494-518

#### WedgeSelectionModal allowedCategories Logic:
```tsx
allowedCategories={
    // Main and Support character wedges
    wedgeModalTarget?.entity === 'main'
        ? ['character']
        : wedgeModalTarget?.entity === 'support'
            ? ['character']
        // Main Melee/Range Weapon wedges
        // NOTE: Only 'melee-weapon' and 'ranged-weapon' categories allowed
        // Consonance weapon wedges ('melee-consonance', 'ranged-consonance') are EXCLUDED
        : wedgeModalTarget?.entity === 'mainWeapon'
            ? wedgeModalTarget.category === 'Melee'
                ? ['melee-weapon']
                : ['ranged-weapon']
        // Support Melee/Range Weapon wedges
        // NOTE: Only 'melee-weapon' and 'ranged-weapon' categories allowed
        // Consonance weapon wedges ('melee-consonance', 'ranged-consonance') are EXCLUDED
        : wedgeModalTarget?.entity === 'supportWeapon'
            ? wedgeModalTarget.category === 'Melee'
                ? ['melee-weapon']
                : ['ranged-weapon']
            : undefined
}
```

#### Result:
| Character Type | Melee Weapon Wedges | Range Weapon Wedges |
|---|---|---|
| Main Character | ✅ `['melee-weapon']` only | ✅ `['ranged-weapon']` only |
| Support 1 | ✅ `['melee-weapon']` only | ✅ `['ranged-weapon']` only |
| Support 2 | ✅ `['melee-weapon']` only | ✅ `['ranged-weapon']` only |

---

## How the Filtering Works

1. **WedgeSelectionModal.tsx** (Line 39):
   ```tsx
   const filteredWedges = useMemo(() => {
       let results = filterDemonWedges(allDemonWedges, {
           // ... other filters ...
           categories: allowedCategories && allowedCategories.length > 0 ? allowedCategories : undefined,
       });
       // ...
   }, [search, selectedTypes, ..., allowedCategories]);
   ```

2. **demon-wedges-data.ts** (Line 30635):
   ```tsx
   export function filterDemonWedges(wedges: DemonWedge[], options: FilterOptions): DemonWedge[] {
     return wedges.filter(wedge => {
       // ...
       // Category filter
       if (options.categories && options.categories.length > 0) {
         if (!options.categories.includes(wedge.category)) return false;  // ← Consonance wedges filtered out
       }
       // ...
     });
   }
   ```

---

## Verification Checklist

- ✅ Main Character Melee Weapon Wedges: Only `'melee-weapon'` category allowed
- ✅ Main Character Range Weapon Wedges: Only `'ranged-weapon'` category allowed
- ✅ Support Character 1 Melee Weapon Wedges: Only `'melee-weapon'` category allowed
- ✅ Support Character 1 Range Weapon Wedges: Only `'ranged-weapon'` category allowed
- ✅ Support Character 2 Melee Weapon Wedges: Only `'melee-weapon'` category allowed
- ✅ Support Character 2 Range Weapon Wedges: Only `'ranged-weapon'` category allowed
- ✅ Consonance weapon categories (`'melee-consonance'`, `'ranged-consonance'`) are NOT included in weapon wedge selections
- ✅ Documentation comments added to code for clarity

---

## Consonance Weapon Information

For reference, Consonance Weapons are special weapons with dedicated Demon Wedges:
- **Melee Consonance**: มี 35 wedges (from `Demon Wedge Melee Consonance Weapon.json`)
- **Ranged Consonance**: มี 35 wedges (from `Demon Wedge Ranged Consonance Weapon.json`)

These should ONLY be selectable when:
- Using `consonanceWedges` in the character build (not in regular weapon wedges)
- The character has a Consonance Weapon equipped as their actual weapon

---

## Conclusion

✅ **The system is correctly designed and implemented.**

Consonance Weapon Demon Wedges are properly excluded from:
- Melee Weapon Wedges selection
- Range Weapon Wedges selection

For all character types (Main, Support 1, Support 2).
