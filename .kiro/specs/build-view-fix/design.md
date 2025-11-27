# Design Document

## Overview

การแก้ไขนี้จะเพิ่ม Weapon Mods section ที่หายไปใน Support Character 1 card และปรับปรุง UI ของ Weapon Mods ทั้งหมดให้มีรูปอาวุธเป็นหัวข้อ เพื่อความชัดเจนและง่ายต่อการใช้งาน

## Architecture

### Current Structure
```
Support Character Card
├── Header (Character Image + Name)
├── Weapon Info (Small display)
└── Character Mods Grid (5 columns)
    └── Missing: Weapon Mods Grid ❌
```

### New Structure
```
Support Character Card
├── Header (Character Image + Name)
├── Weapon Info (Small display)
├── Character Mods Section
│   ├── Label: "Character Mods"
│   └── Grid (5 columns, 9 slots)
└── Weapon Mods Section ✅
    ├── Header with Weapon Image + Name ✅
    └── Grid (5 columns, 9 slots)
```

## Components and Interfaces

### 1. WeaponModsHeader Component (New)

ส่วนหัวข้อที่แสดงรูปอาวุธและชื่อ:

```typescript
interface WeaponModsHeaderProps {
  weapon: Weapon | null;
  label?: string;
}

// Visual Design:
// [Weapon Image 32x32] Weapon Name
// └─ Small icon + name in a flex container
```

**Styling:**
- Background: `bg-white/5` (subtle highlight)
- Border radius: `rounded-lg`
- Padding: `p-2`
- Gap between image and text: `gap-3`
- Image container: `w-8 h-8 rounded overflow-hidden`
- Text: `text-sm font-medium`

### 2. Modified Support Card Layout

แต่ละ Support Character card จะมี:

```typescript
<CardContent className="p-4 space-y-4">
  {/* Weapon Display - Existing */}
  <div className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
    {/* Weapon image + name */}
  </div>

  {/* Character Mods Section */}
  <div>
    <p className="text-[10px] uppercase text-muted-foreground font-semibold mb-2 tracking-wider">
      Character Mods
    </p>
    <div className="grid grid-cols-5 gap-1.5">
      {/* 9 mod slots */}
    </div>
  </div>

  {/* Weapon Mods Section - NEW */}
  <div>
    {/* Weapon Header with Image */}
    <div className="flex items-center gap-2 mb-2">
      <div className="w-6 h-6 rounded overflow-hidden relative bg-black/50 shrink-0">
        {weapon ? (
          <Image src={weapon.image} alt={weapon.name} fill className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground">?</div>
        )}
      </div>
      <p className="text-[10px] uppercase text-muted-foreground font-semibold tracking-wider">
        {weapon?.name || 'No Weapon'} Mods
      </p>
    </div>
    <div className="grid grid-cols-5 gap-1.5">
      {/* 9 mod slots */}
    </div>
  </div>
</CardContent>
```

## Data Models

### Build Interface (Existing)
```typescript
interface Build {
  // ... existing fields
  supportMods?: Record<string, (string | null)[]>;
  // Keys:
  // - 'support-char-0': Character 1 mods (9 slots)
  // - 'support-char-1': Character 2 mods (9 slots)
  // - 'support-wpn-0': Weapon 1 mods (9 slots) ← Currently not displayed
  // - 'support-wpn-1': Weapon 2 mods (9 slots)
  // - 'consonance-wpn': Consonance mods (4 slots)
  
  supportAdjustedSlots?: Record<string, number[]>;
  // Same keys as supportMods
}
```

### Data Access Pattern
```typescript
// Support Character 1
const supportModsChar1 = build.supportMods?.['support-char-0'] || Array(9).fill(null);
const supportModsWpn1 = build.supportMods?.['support-wpn-0'] || Array(9).fill(null); // ← Add this
const adjustedSlotsWpn1 = build.supportAdjustedSlots?.['support-wpn-0'] || [];

// Support Character 2
const supportModsChar2 = build.supportMods?.['support-char-1'] || Array(9).fill(null);
const supportModsWpn2 = build.supportMods?.['support-wpn-1'] || Array(9).fill(null);
const adjustedSlotsWpn2 = build.supportAdjustedSlots?.['support-wpn-1'] || [];
```

## Error Handling

### Missing Data Scenarios

1. **No Weapon Selected**
   - Display: Placeholder icon with "No Weapon" text
   - Mods: Still show empty slots (user might add weapon later)

2. **No Mods Data**
   - Display: 9 empty slots with "+" placeholder
   - Behavior: Same as current empty slots

3. **Invalid Mod Names**
   - Display: Empty slot (handled by existing `ReadOnlyModSlot` component)
   - No error thrown

4. **Missing supportMods Key**
   - Fallback: `Array(9).fill(null)`
   - Prevents crashes

## Testing Strategy

### Visual Testing
1. Test with complete build (all mods filled)
2. Test with partial build (some mods empty)
3. Test with no weapon selected
4. Test with no mods at all
5. Test responsive layout (mobile, tablet, desktop)

### Data Testing
1. Verify `supportMods['support-wpn-0']` is read correctly
2. Verify `supportAdjustedSlots['support-wpn-0']` applies green ring
3. Verify fallback to empty array works
4. Verify weapon image loads correctly

### Regression Testing
1. Ensure Support Character 2 still works correctly
2. Ensure Consonance Weapon section unchanged
3. Ensure Main Configuration section unchanged
4. Ensure Character Mods section unchanged

## Implementation Notes

### Code Changes Required

**File:** `src/app/view/[id]/page.tsx`

**Location 1:** Around line 550-580 (Support Character 1 card)
- Add Weapon Mods section after Character Mods section
- Use same pattern as Support Character 2

**Location 2:** Around line 580-650 (Support Character 2 card)
- Update Weapon Mods header to include weapon image
- Keep existing functionality

**Location 3:** Data extraction (around line 400)
- Already exists: `const supportModsWpn1 = build.supportMods?.['support-wpn-0'] || Array(9).fill(null);`
- Verify this line is present

### Styling Consistency

Use existing classes from the codebase:
- Card: `border-white/5 bg-black/20`
- Section spacing: `space-y-4`
- Grid: `grid grid-cols-5 gap-1.5`
- Labels: `text-[10px] uppercase text-muted-foreground font-semibold mb-2 tracking-wider`
- Weapon container: `w-6 h-6 rounded overflow-hidden relative bg-black/50`

### Responsive Behavior

- Desktop (xl): 3 columns (Support 1, Support 2, Consonance)
- Tablet (md): 2 columns
- Mobile: 1 column (stacked)
- Weapon image scales appropriately on all sizes

## Design Decisions

### Why Add Weapon Image to Header?

**Problem:** Users can't tell which mods belong to which weapon
**Solution:** Show weapon image + name as section header
**Benefit:** Clear visual association between weapon and its mods

### Why Keep Weapon Display at Top?

**Decision:** Keep existing weapon display (larger) at top of card
**Reason:** Provides overview of equipped weapon
**Addition:** Smaller weapon image in mods section for context

### Why Use Same Grid Layout?

**Decision:** Use 5-column grid for both Character and Weapon mods
**Reason:** Consistency and familiarity
**Benefit:** Users already understand the layout

### Why Show Empty Slots?

**Decision:** Show empty slots even when no weapon selected
**Reason:** Indicates that weapon mods are possible
**Benefit:** Educates users about build structure
