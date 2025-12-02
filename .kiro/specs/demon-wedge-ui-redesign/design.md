# Design Document: Demon Wedge UI Redesign

## Overview

การปรับปรุง UI ของหน้า Damage Calculator เพื่อให้มีประสบการณ์การใช้งานที่ดีขึ้น โดยเน้นที่:
- Sticky header สำหรับ Stats Comparison
- Layout แบบ A/B side-by-side ตลอดทั้งหน้า
- Demon Wedge slots แบบ 4x2 grid ที่กะทัดรัด
- ลำดับการแสดงผลที่เป็นระบบ: Character → Range Weapon → Melee Weapon → Demon Wedge

## Architecture

### Component Hierarchy

```
CalculatorPage
├── StickyStatsHeader (NEW - wrapper for sticky behavior)
│   └── StatsComparison (existing, modified)
├── ConfigurationSection (NEW - main content area)
│   ├── CharacterSelectionRow (existing, reorganized)
│   │   ├── PresetACharacter
│   │   └── PresetBCharacter
│   ├── WeaponSelectionRow (NEW - side-by-side weapons)
│   │   ├── RangeWeaponSection
│   │   │   ├── PresetASelector
│   │   │   └── PresetBSelector
│   │   └── MeleeWeaponSection
│   │       ├── PresetASelector
│   │       └── PresetBSelector
│   ├── ConsonanceWeaponRow (conditional - for specific characters)
│   │   ├── PresetASelector
│   │   └── PresetBSelector
│   └── DemonWedgeRow (NEW - side-by-side wedge grids)
│       ├── CompactWedgeGrid (Preset A)
│       └── CompactWedgeGrid (Preset B)
└── Modals (existing)
    ├── WedgeSelectionModal
    ├── CharacterSelectionModal
    └── ConditionEditorModal
```

### Layout Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    STICKY STATS HEADER                       │
│  ┌─────────────────────┬─────────────────────┐              │
│  │      Preset A       │      Preset B       │              │
│  │   ATK: 1234         │   ATK: 1456         │              │
│  │   HP: 5678          │   HP: 5890          │              │
│  └─────────────────────┴─────────────────────┘              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    CHARACTER SELECTION                      │
│  ┌─────────────────────┬─────────────────────┐              │
│  │   [Avatar] Lynn     │   [Avatar] Psyche   │              │
│  │   Lv. 80            │   Lv. 80            │              │
│  └─────────────────────┴─────────────────────┘              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    RANGE WEAPON                             │
│  ┌─────────────────────┬─────────────────────┐              │
│  │   Weapon A          │   Weapon B          │              │
│  │   Refinement: 5     │   Refinement: 3     │              │
│  └─────────────────────┴─────────────────────┘              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    MELEE WEAPON                             │
│  ┌─────────────────────┬─────────────────────┐              │
│  │   Weapon A          │   Weapon B          │              │
│  │   Refinement: 5     │   Refinement: 3     │              │
│  └─────────────────────┴─────────────────────┘              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                 DEMON WEDGE CONFIGURATION                   │
│  ┌─────────────────────┬─────────────────────┐              │
│  │   Preset A          │   Preset B          │              │
│  │  ┌──┬──┬──┬──┐     │  ┌──┬──┬──┬──┐     │                │
│  │  │1 │2 │3 │4 │     │  │1 │2 │3 │4 │     │              │
│  │  ├──┼──┼──┼──┤     │  ├──┼──┼──┼──┤     │              │
│  │  │5 │6 │7 │8 │     │  │5 │6 │7 │8 │     │              │
│  │  └──┴──┴──┴──┘     │  └──┴──┴──┴──┘     │              │
│  │  [Configure]        │  [Configure]        │              │
│  └─────────────────────┴─────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### 1. StickyStatsHeader Component

```typescript
interface StickyStatsHeaderProps {
  children: React.ReactNode;
  threshold?: number; // pixels from top before becoming sticky
}
```

Behavior:
- Uses `position: sticky` with `top: 0`
- Adds backdrop blur and shadow when scrolled
- Z-index higher than content below

### 2. CompactWedgeGrid Component (NEW)

```typescript
interface CompactWedgeGridProps {
  slots: (EquippedCalculatorWedge | undefined)[];
  presetId: 'A' | 'B';
  onSlotClick: (slotIndex: number) => void;
  onRemoveWedge: (slotIndex: number) => void;
  onOpenDetails: (slotIndex: number) => void;
  gradient: string;
  title: string;
  trialRank?: number | null;
  onTrialRankChange?: (rank: number | null) => void;
  onOpenConditionModal: () => void;
}
```

Features:
- 4x2 grid layout (8 slots)
- Compact slot size (~60-70px)
- Hover to show remove button
- Click to open wedge selector or details

### 3. CompactWeaponSelector Component (NEW)

```typescript
interface CompactWeaponSelectorProps {
  category: 'Ranged' | 'Melee' | 'Consonance';
  selectedWeapon: Weapon | null;
  refinement: number;
  onSelectWeapon: (weapon: Weapon | null) => void;
  onRefinementChange: (level: number) => void;
  gradient: string;
  label: string;
}
```

Features:
- Dropdown for weapon selection
- Compact refinement slider
- Shows key stats inline

### 4. Modified StatsComparison Component

Changes:
- Add `isSticky` state for visual feedback
- Reduce vertical padding when sticky
- Collapsible sections for damage buckets

## Data Models

No changes to existing data models. The redesign is purely UI/UX focused.

Existing models used:
- `EquippedCalculatorWedge` - wedge with level and conditions
- `Character` - character data
- `Weapon` - weapon with refinement data
- `CalculationResult` - damage calculation results
- `FinalStats` - computed character stats

## Error Handling

1. **Empty States**
   - Empty wedge slot: Show "+" placeholder
   - No character selected: Show "Select Character" prompt
   - No weapon selected: Show "Select Weapon" dropdown

2. **Responsive Fallbacks**
   - On mobile: Stack A/B vertically
   - On very small screens: Reduce grid to 4x2 with smaller slots

3. **Loading States**
   - Skeleton loaders for character/weapon images
   - Disabled state while loading data

## Testing Strategy

### Unit Tests
1. `CompactWedgeGrid` - slot rendering, click handlers, remove functionality
2. `CompactWeaponSelector` - weapon selection, refinement changes
3. `StickyStatsHeader` - sticky behavior, visual state changes

### Integration Tests
1. Full calculator flow with new layout
2. A/B preset copying with new components
3. Responsive layout switching

### Visual Tests
1. Sticky header appearance at different scroll positions
2. 4x2 grid alignment and spacing
3. Side-by-side layout consistency

## Implementation Notes

### CSS/Styling Approach

```css
/* Sticky Header */
.sticky-stats-header {
  position: sticky;
  top: 0;
  z-index: 40;
  transition: all 0.2s ease;
}

.sticky-stats-header.is-scrolled {
  backdrop-filter: blur(12px);
  background: rgba(26, 26, 31, 0.95);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* Compact Wedge Grid */
.wedge-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.wedge-slot {
  aspect-ratio: 1;
  width: 60px;
  min-width: 50px;
  max-width: 70px;
}
```

### Responsive Breakpoints

- Desktop (≥1024px): Full side-by-side layout
- Tablet (768px-1023px): Slightly compressed, still side-by-side
- Mobile (<768px): Stacked layout, A above B

### Performance Considerations

1. Use `useMemo` for computed stats to avoid recalculation
2. Lazy load wedge images with Next.js Image component
3. Debounce scroll event listener for sticky header
4. Use CSS transforms for animations (GPU accelerated)

## Migration Path

1. Create new components without modifying existing ones
2. Update `CalculatorPage` to use new layout structure
3. Modify `DemonWedgePanel` to support compact 4x2 grid mode
4. Add sticky wrapper around `StatsComparison`
5. Remove tab-based weapon selection, replace with side-by-side
6. Test thoroughly before removing old code paths
