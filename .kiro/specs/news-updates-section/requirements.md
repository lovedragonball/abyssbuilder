# Requirements Document

## Introduction

This feature adds a News & Updates section to the website that displays game patch notes and known issues in an engaging, social media-inspired card layout. The section will parse data from the Patch.txt file and present it in a visually appealing, space-efficient format with Known Issues on the left and Patch Notes on the right, similar to Twitter, Reddit, and Facebook post cards.

## Requirements

### Requirement 1: Data Extraction and Parsing

**User Story:** As a website visitor, I want to see the latest game updates and known issues extracted from the patch notes, so that I can stay informed about the game's current state.

#### Acceptance Criteria

1. WHEN the system loads patch data THEN it SHALL parse the Patch.txt HTML file and extract Known Issues section
2. WHEN the system loads patch data THEN it SHALL parse and extract all Update Details sections with their dates
3. WHEN parsing update details THEN the system SHALL group fixes by date (e.g., 2025-11-22, 2025-11-20, etc.)
4. WHEN parsing known issues THEN the system SHALL extract each issue with its description
5. IF the Patch.txt file is malformed THEN the system SHALL display a fallback error message
6. WHEN new patch data is available THEN the system SHALL automatically update the displayed content

### Requirement 2: Card-Based Layout Design

**User Story:** As a website visitor, I want to see updates displayed in attractive cards similar to social media posts, so that the information is easy to scan and visually appealing.

#### Acceptance Criteria

1. WHEN viewing the News & Updates section THEN the system SHALL display content in a two-column card layout
2. WHEN viewing on desktop THEN Known Issues SHALL appear on the left side and Patch Notes SHALL appear on the right side
3. WHEN viewing on mobile devices THEN cards SHALL stack vertically with Known Issues appearing first
4. WHEN displaying cards THEN each card SHALL have rounded corners, shadows, and hover effects
5. WHEN a card is hovered THEN it SHALL display a subtle elevation animation
6. WHEN cards are displayed THEN they SHALL have consistent spacing and alignment
7. WHEN content exceeds card height THEN the system SHALL provide smooth scrolling within the card

### Requirement 3: Known Issues Display

**User Story:** As a player, I want to see all current known issues in an organized list, so that I understand what bugs are being worked on.

#### Acceptance Criteria

1. WHEN displaying Known Issues THEN the system SHALL show a card titled "Known Issues (Still Unresolved)"
2. WHEN displaying issues THEN each issue SHALL be shown with a distinctive icon (✧ symbol)
3. WHEN displaying issues THEN the system SHALL highlight game elements in brackets (e.g., [Longbow: Embla Inflorescence])
4. WHEN the issues list is long THEN the card SHALL have a maximum height with scrollable content
5. WHEN displaying issues THEN the system SHALL use readable typography with proper line spacing
6. WHEN an issue mentions a fix timeline THEN it SHALL be visually emphasized

### Requirement 4: Patch Notes Display

**User Story:** As a player, I want to see recent bug fixes and improvements organized by date, so that I can track what has been fixed.

#### Acceptance Criteria

1. WHEN displaying Patch Notes THEN the system SHALL show a card titled "Patch Notes (Bug Fixes and Improvements)"
2. WHEN displaying patch notes THEN they SHALL be grouped by date in reverse chronological order (newest first)
3. WHEN displaying a date group THEN it SHALL have a clear date header (e.g., "Update Details - 2025-11-22")
4. WHEN displaying fixes THEN each fix SHALL be shown with a distinctive icon (✦ symbol)
5. WHEN displaying fixes THEN the system SHALL highlight game elements in brackets
6. WHEN the patch notes list is long THEN the card SHALL have a maximum height with scrollable content
7. WHEN displaying multiple dates THEN the system SHALL show at least the 5 most recent update dates
8. WHEN there are more updates THEN the system SHALL provide a "Show More" or "View All" option

### Requirement 5: Interactive Elements and Visual Polish

**User Story:** As a website visitor, I want interactive and visually polished elements, so that the experience feels modern and engaging.

#### Acceptance Criteria

1. WHEN hovering over a card THEN it SHALL display a smooth elevation animation
2. WHEN hovering over individual items THEN they SHALL have a subtle highlight effect
3. WHEN cards load THEN they SHALL animate in with a fade and slide effect
4. WHEN scrolling within a card THEN the scrollbar SHALL be styled to match the design
5. WHEN viewing on different screen sizes THEN the layout SHALL be fully responsive
6. WHEN cards are displayed THEN they SHALL use the website's color scheme and design system
7. WHEN displaying text THEN it SHALL use proper contrast ratios for accessibility
8. WHEN game elements are mentioned THEN they SHALL be styled with a distinct color or background

### Requirement 6: Space Efficiency and Readability

**User Story:** As a website visitor, I want the updates section to be compact yet readable, so that it doesn't overwhelm the page while still being informative.

#### Acceptance Criteria

1. WHEN displaying the section THEN it SHALL occupy a reasonable vertical space on the page
2. WHEN cards have long content THEN they SHALL use a maximum height constraint with scrolling
3. WHEN displaying text THEN it SHALL use appropriate font sizes for readability
4. WHEN displaying on mobile THEN the system SHALL optimize spacing for smaller screens
5. WHEN multiple items are shown THEN they SHALL have consistent, comfortable spacing
6. WHEN the section is empty THEN it SHALL display a minimal placeholder message

### Requirement 7: Thai Language Support

**User Story:** As a Thai-speaking player, I want to see section titles and UI elements in Thai, so that I can understand the content in my native language.

#### Acceptance Criteria

1. WHEN displaying section titles THEN they SHALL support Thai language text
2. WHEN displaying UI elements THEN they SHALL properly render Thai characters
3. WHEN displaying dates THEN they SHALL support Thai date formatting if needed
4. WHEN displaying mixed content THEN Thai and English text SHALL coexist properly
5. WHEN using Thai fonts THEN they SHALL be readable and properly sized

### Requirement 8: Performance and Loading

**User Story:** As a website visitor, I want the updates section to load quickly, so that I don't experience delays when viewing the page.

#### Acceptance Criteria

1. WHEN loading the page THEN the updates section SHALL load within 2 seconds
2. WHEN parsing patch data THEN it SHALL not block the main thread
3. WHEN displaying cards THEN images and content SHALL load progressively
4. WHEN the section is not in viewport THEN it SHALL lazy load
5. WHEN data is cached THEN subsequent loads SHALL be near-instantaneous
6. WHEN parsing fails THEN the system SHALL fail gracefully without breaking the page
