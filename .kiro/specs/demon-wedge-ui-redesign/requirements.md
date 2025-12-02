# Requirements Document

## Introduction

ปรับปรุง UI ของหน้า Damage Calculator โดยเฉพาะส่วน Demon Wedge Configuration ให้มีการแสดงผลที่ดีขึ้น โดยมี sticky header ที่ freeze ไว้เวลาเลื่อนลง, การเลือกอาวุธแบบ A/B side-by-side (ไม่ใช่ tab switching), และ Demon Wedge slots แบบ 4x2 grid ที่กะทัดรัดเพื่อให้เห็น stats ทั้งหมดพร้อมกัน

## Requirements

### Requirement 1: Sticky Header สำหรับ Stats Comparison

**User Story:** As a user, I want the stats comparison section to stay visible when scrolling, so that I can see the impact of my changes in real-time.

#### Acceptance Criteria

1. WHEN user scrolls down the calculator page THEN the Stats Comparison section SHALL remain fixed at the top of the viewport
2. WHEN the sticky header is active THEN it SHALL have a subtle background blur and shadow to distinguish it from content below
3. WHEN user scrolls back to top THEN the Stats Comparison section SHALL return to its normal position seamlessly

### Requirement 2: Side-by-Side A/B Layout (ไม่ใช่ Tab Switching)

**User Story:** As a user, I want to see Preset A and Preset B configurations side-by-side, so that I can compare them easily without switching tabs.

#### Acceptance Criteria

1. WHEN viewing the calculator page THEN the system SHALL display Preset A and Preset B in a two-column layout side-by-side
2. WHEN on mobile/small screens THEN the layout SHALL stack vertically while maintaining the A/B structure
3. IF user is configuring weapons or demon wedges THEN both presets SHALL be visible simultaneously without tab navigation

### Requirement 3: ลำดับการแสดงผล - Character → Range Weapon → Melee Weapon

**User Story:** As a user, I want the configuration sections to be ordered logically (Character first, then Range Weapon, then Melee Weapon), so that I can follow a natural build flow.

#### Acceptance Criteria

1. WHEN viewing each preset column THEN the sections SHALL be ordered as: Character Selection → Range Weapon → Melee Weapon → Demon Wedge Configuration
2. WHEN a character is selected THEN the weapon sections SHALL show weapons compatible with that character
3. WHEN scrolling through a preset THEN the order SHALL remain consistent: Character → Range → Melee → Demon Wedges

### Requirement 4: Demon Wedge Slots แบบ 4x2 Grid

**User Story:** As a user, I want the Demon Wedge slots to be displayed in a compact 4x2 grid layout, so that I can see all 8 slots at once without excessive scrolling.

#### Acceptance Criteria

1. WHEN viewing Demon Wedge Configuration THEN the system SHALL display 8 slots in a 4 columns × 2 rows grid layout
2. WHEN a slot is empty THEN it SHALL show a clickable placeholder with a "+" icon
3. WHEN a slot has a wedge equipped THEN it SHALL show the wedge icon, name (truncated if needed), and rarity indicator
4. WHEN hovering over an equipped slot THEN it SHALL show a remove button

### Requirement 5: ขนาดกะทัดรัดเพื่อให้เห็น Stats ทั้งหมด

**User Story:** As a user, I want the UI to be compact enough to see all stats and configurations on one screen, so that I can make informed decisions without scrolling.

#### Acceptance Criteria

1. WHEN viewing the calculator THEN the Demon Wedge slots SHALL be sized compactly (approximately 60-80px per slot)
2. WHEN all sections are visible THEN the total height SHALL be optimized to fit within a typical viewport (1080p or higher)
3. WHEN displaying wedge information THEN only essential info (icon, abbreviated name) SHALL be shown in the grid, with full details on hover/click
4. IF screen space is limited THEN the layout SHALL prioritize showing all slots over showing detailed information

### Requirement 6: Weapon Selection แบบ A/B เหมือนตัวละคร

**User Story:** As a user, I want to select weapons for both presets in a similar manner to character selection (A and B side-by-side), so that the experience is consistent.

#### Acceptance Criteria

1. WHEN selecting Range Weapon THEN the system SHALL show Preset A weapon selector on the left and Preset B on the right
2. WHEN selecting Melee Weapon THEN the system SHALL show Preset A weapon selector on the left and Preset B on the right
3. WHEN a weapon is selected THEN it SHALL display the weapon name, refinement level, and key stats
4. WHEN changing refinement level THEN the stats SHALL update immediately for that preset

### Requirement 7: Consonance Weapon Support (สำหรับตัวละครที่ต้องการ)

**User Story:** As a user with a character that requires consonance weapons (Lynn, Lisbell, Psyche, Berenica), I want to see consonance weapon options, so that I can fully configure my build.

#### Acceptance Criteria

1. IF selected character is Lynn, Lisbell, Psyche, or Berenica THEN the system SHALL show a Consonance Weapon section
2. WHEN Consonance Weapon section is visible THEN it SHALL follow the same A/B side-by-side pattern
3. WHEN Consonance Weapon is not needed THEN the section SHALL be hidden to save space
