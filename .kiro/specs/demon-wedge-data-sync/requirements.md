# Requirements Document

## Introduction

ฟีเจอร์นี้เป็นการ sync ข้อมูล Demon Wedges ในหน้า Demon Wedges Info ให้ตรงกับไฟล์ JSON ใน folder `Info Demon Wedge/` ทั้งหมด โดยข้อมูลที่ต้องตรงกันได้แก่ รูปภาพ (image), element, polarity และ tolerance สำหรับ Demon Wedge ทุกใบ

ไฟล์ JSON ที่เป็น source of truth:
- `Info Demon Wedge/Demon Wedge Character.json` - Demon Wedge สำหรับ Character
- `Info Demon Wedge/Demon Wedge Melee Weapon.json` - Demon Wedge สำหรับ Melee Weapon
- `Info Demon Wedge/Demon Wedge Ranged Weapon.json` - Demon Wedge สำหรับ Ranged Weapon
- `Info Demon Wedge/Demon Wedge Melee Consonance Weapon.json` - Demon Wedge สำหรับ Melee Consonance Weapon
- `Info Demon Wedge/Demon Wedge Ranged Consonance Weapon.json` - Demon Wedge สำหรับ Ranged Consonance Weapon

## Requirements

### Requirement 1: Sync Demon Wedge Images

**User Story:** As a user, I want to see the correct images for each Demon Wedge, so that I can identify them accurately.

#### Acceptance Criteria

1. WHEN a Demon Wedge is displayed THEN the system SHALL show the main image (`images.main`) from the corresponding JSON file
2. WHEN a Demon Wedge has an element icon (`images.element`) THEN the system SHALL display the element icon correctly
3. WHEN a Demon Wedge has a polarity icon (`images.polarity`) THEN the system SHALL display the polarity icon correctly

### Requirement 2: Sync Demon Wedge Element Data

**User Story:** As a user, I want to see the correct element for each Demon Wedge, so that I can filter and identify them by element.

#### Acceptance Criteria

1. WHEN a Demon Wedge has an element defined in JSON (`images.element` URL contains element name) THEN the system SHALL set the correct element type (Pyro, Hydro, Electro, Lumino, Anemo, Umbro)
2. WHEN a Demon Wedge has no element (`images.element` is null) THEN the system SHALL not assign any element to that wedge
3. WHEN filtering by element THEN the system SHALL only show Demon Wedges with matching element data

### Requirement 3: Sync Demon Wedge Polarity Data

**User Story:** As a user, I want to see the correct polarity (track) for each Demon Wedge, so that I can identify their type.

#### Acceptance Criteria

1. WHEN a Demon Wedge has a polarity defined in JSON (`images.polarity`) THEN the system SHALL set the correct polarity type based on the URL:
   - `polarities/1.webp` = Circle
   - `polarities/2.webp` = Diamond
   - `polarities/3.webp` = Moon
   - `polarities/4.webp` = Rhombus
2. WHEN a Demon Wedge has no polarity (`images.polarity` is null) THEN the system SHALL set type as "Normal"
3. WHEN displaying a Demon Wedge THEN the system SHALL show the correct polarity icon (trackIcon)

### Requirement 4: Sync Demon Wedge Tolerance Data

**User Story:** As a user, I want to see the correct tolerance value for each Demon Wedge, so that I can plan my builds accurately.

#### Acceptance Criteria

1. WHEN a Demon Wedge is displayed THEN the system SHALL show the tolerance value from the JSON file
2. WHEN the tolerance value in JSON differs from current data THEN the system SHALL update to match the JSON value
3. WHEN all Demon Wedges are loaded THEN every wedge SHALL have the correct tolerance matching its JSON source

### Requirement 5: Complete Data Coverage

**User Story:** As a user, I want all Demon Wedges from all categories to be available, so that I have complete information.

#### Acceptance Criteria

1. WHEN loading Demon Wedges THEN the system SHALL include all wedges from Character JSON
2. WHEN loading Demon Wedges THEN the system SHALL include all wedges from Melee Weapon JSON
3. WHEN loading Demon Wedges THEN the system SHALL include all wedges from Ranged Weapon JSON
4. WHEN loading Demon Wedges THEN the system SHALL include all wedges from Melee Consonance Weapon JSON
5. WHEN loading Demon Wedges THEN the system SHALL include all wedges from Ranged Consonance Weapon JSON
6. WHEN a new Demon Wedge exists in JSON but not in the app THEN the system SHALL add it
7. WHEN a Demon Wedge exists in the app but not in JSON THEN the system SHALL remove it

### Requirement 6: Data Integrity

**User Story:** As a user, I want the Demon Wedge data to be consistent and accurate, so that I can trust the information.

#### Acceptance Criteria

1. WHEN syncing data THEN the system SHALL preserve the unique ID for each Demon Wedge
2. WHEN syncing data THEN the system SHALL correctly map the category (character, melee-weapon, ranged-weapon, melee-consonance, ranged-consonance)
3. WHEN syncing data THEN the system SHALL correctly map the usage type (Character, Weapon, Consonance Weapon)
4. WHEN syncing data THEN the system SHALL preserve all stats and effects from the JSON
