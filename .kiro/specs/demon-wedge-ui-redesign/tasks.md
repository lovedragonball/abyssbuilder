# Implementation Plan

- [x] 1. Create StickyStatsHeader wrapper component




  - Create `src/components/calculator/StickyStatsHeader.tsx`
  - Implement sticky positioning with `position: sticky` and `top: 0`
  - Add scroll detection using `IntersectionObserver` or scroll event
  - Apply backdrop blur and shadow when scrolled
  - Export component for use in calculator page
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 2. Create CompactWedgeGrid component





  - [x] 2.1 Create base CompactWedgeGrid component structure

    - Create `src/components/calculator/CompactWedgeGrid.tsx`
    - Define props interface with slots, presetId, callbacks
    - Implement 4x2 CSS grid layout with `grid-template-columns: repeat(4, 1fr)`
    - Set slot size to ~60-70px with aspect-ratio: 1
    - _Requirements: 4.1, 5.1, 5.2_

  - [x] 2.2 Implement empty slot rendering
    - Render clickable placeholder with "+" icon for empty slots
    - Add hover state styling
    - Wire up onClick to open wedge selection modal

    - _Requirements: 4.2_
  - [x] 2.3 Implement equipped slot rendering
    - Display wedge icon using Next.js Image component
    - Show truncated name below icon
    - Add rarity border color indicator
    - Show remove button on hover

    - _Requirements: 4.3, 4.4, 5.3_
  - [x] 2.4 Add header with title and Trial Rank selector
    - Include preset title (Preset A / Preset B) with gradient
    - Integrate existing TrialRankSelector component
    - Add "Configure Conditions" button
    - _Requirements: 4.1_
-

- [x] 3. Create CompactWeaponSelector component





  - [x] 3.1 Create base CompactWeaponSelector component

    - Create `src/components/calculator/CompactWeaponSelector.tsx`
    - Define props interface for weapon, refinement, callbacks
    - Implement dropdown for weapon selection with search
    - _Requirements: 6.1, 6.2_
  - [x] 3.2 Add refinement slider and stats display


    - Add compact refinement slider (0-5)
    - Display key weapon stats inline
    - Show weapon effect text (collapsible if long)
    - _Requirements: 6.3, 6.4_
-

- [x] 4. Refactor calculator page layout




  - [x] 4.1 Wrap StatsComparison with StickyStatsHeader


    - Import StickyStatsHeader in calculator page
    - Wrap existing StatsComparison component
    - Test sticky behavior on scroll
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 4.2 Reorganize Character Selection to side-by-side row

    - Create single row with Preset A on left, Preset B on right
    - Maintain existing character selection functionality
    - Add responsive stacking for mobile
    - _Requirements: 2.1, 2.2, 3.1_

  - [x] 4.3 Replace tab-based weapon selection with side-by-side layout

    - Remove activeTab state and tab navigation
    - Create Range Weapon row with A/B side-by-side
    - Create Melee Weapon row with A/B side-by-side
    - Use CompactWeaponSelector for each
    - _Requirements: 2.1, 2.3, 3.2, 3.3, 6.1, 6.2_

  - [x] 4.4 Add conditional Consonance Weapon row

    - Check if selected character requires consonance (Lynn, Lisbell, Psyche, Berenica)
    - Show Consonance Weapon row only when needed
    - Use same A/B side-by-side pattern
    - _Requirements: 7.1, 7.2, 7.3_

  - [x] 4.5 Replace DemonWedgePanel with CompactWedgeGrid

    - Create Demon Wedge Configuration row
    - Use CompactWedgeGrid for Preset A (left)
    - Use CompactWedgeGrid for Preset B (right)
    - Wire up all existing callbacks (add, remove, update level, toggle, conditions)
    - _Requirements: 2.1, 4.1, 4.2, 4.3, 4.4_
-

- [x] 5. Add responsive styling




  - [x] 5.1 Implement desktop layout (≥1024px)


    - Full side-by-side layout for all sections
    - Optimal spacing and sizing
    - _Requirements: 2.1, 5.2_

  - [ ] 5.2 Implement tablet layout (768px-1023px)
    - Slightly compressed side-by-side
    - Reduce padding and margins

    - _Requirements: 2.2_
  - [ ] 5.3 Implement mobile layout (<768px)
    - Stack A above B for all sections
    - Maintain functionality
    - Adjust wedge slot sizes if needed
    - _Requirements: 2.2, 5.4_
-

- [x] 6. Update existing components for compatibility





  - [x] 6.1 Modify StatsComparison for sticky mode

    - Add optional `compact` prop to reduce padding when sticky
    - Ensure proper z-index layering
    - _Requirements: 1.2_

  - [x] 6.2 Update WedgeSelectionModal for new grid

    - Ensure modal works correctly with new slot indices
    - Verify wedge selection updates correct preset/slot
    - _Requirements: 4.2, 4.3_

- [x] 7. Testing and verification





  - [x] 7.1 Test sticky header behavior


    - Verify header stays fixed on scroll
    - Check backdrop blur and shadow appearance
    - Test return to normal position on scroll up
    - _Requirements: 1.1, 1.2, 1.3_

  - [x] 7.2 Test wedge grid functionality

    - Add wedges to all 8 slots
    - Remove wedges
    - Verify rarity colors and icons
    - Test hover states
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 7.3 Test weapon selection

    - Select weapons for both presets
    - Change refinement levels
    - Verify stats update correctly
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [x] 7.4 Test responsive layouts

    - Test on desktop, tablet, and mobile viewports
    - Verify side-by-side on desktop
    - Verify stacked on mobile
    - _Requirements: 2.2, 5.4_
