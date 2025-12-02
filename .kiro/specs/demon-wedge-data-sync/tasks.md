# Implementation Plan

- [ ] 1. Update the generator script to correctly parse and transform JSON data
  - [ ] 1.1 Update element parsing logic in the generator script
    - Modify `parseElement()` function to extract element from URL pattern `/elements/{element}.webp`
    - Handle null values correctly
    - _Requirements: 2.1, 2.2_

  - [ ] 1.2 Update polarity parsing logic in the generator script
    - Modify `parsePolarity()` function to map polarity URLs to types:
      - `/polarities/1.webp` → Circle, track: 1
      - `/polarities/2.webp` → Diamond, track: 2
      - `/polarities/3.webp` → Moon, track: 3
      - `/polarities/4.webp` → Rhombus, track: 4
      - `null` → Normal, track: 0
    - _Requirements: 3.1, 3.2_

  - [ ] 1.3 Update wedge transformation logic
    - Ensure `image` field uses `images.main` from JSON
    - Ensure `elementIcon` field uses `images.element` from JSON
    - Ensure `trackIcon` field uses `images.polarity` from JSON
    - Ensure `tolerance` field uses `tolerance` from JSON
    - _Requirements: 1.1, 1.2, 1.3, 4.1, 4.2_

- [ ] 2. Run the generator script to regenerate demon-wedges-data.ts
  - Execute the generator script to read all 5 JSON files
  - Generate new `src/lib/demon-wedges-data.ts` with correct data
  - Verify the generated file compiles without errors
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 6.1, 6.2, 6.3, 6.4_

- [ ] 3. Verify data integrity
  - [ ] 3.1 Verify wedge count matches JSON sources
    - Count total wedges in generated file
    - Compare with total count from all JSON files
    - _Requirements: 5.6, 5.7_

  - [ ] 3.2 Verify sample wedges have correct data
    - Check a few sample wedges for correct image, element, polarity, and tolerance
    - Ensure data matches the source JSON exactly
    - _Requirements: 4.3, 6.4_
