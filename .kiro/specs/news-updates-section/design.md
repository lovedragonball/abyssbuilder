# Design Document

## Overview

The News & Updates section will be a visually engaging component that displays game patch notes and known issues in a card-based layout. The design follows modern web practices with social media-inspired cards, smooth animations, and responsive layouts. The component will parse HTML patch data, extract relevant information, and present it in an accessible, space-efficient manner.

## Architecture

### Component Structure

```
src/
├── app/
│   └── news/
│       └── page.tsx                    # News & Updates page
├── components/
│   ├── news/
│   │   ├── news-updates-section.tsx    # Main container component
│   │   ├── known-issues-card.tsx       # Left card for known issues
│   │   ├── patch-notes-card.tsx        # Right card for patch notes
│   │   ├── update-item.tsx             # Individual update item
│   │   └── issue-item.tsx              # Individual issue item
│   └── ui/
│       └── update-card.tsx             # Reusable card component
├── lib/
│   ├── patch-parser.ts                 # Parse Patch.txt HTML
│   └── patch-data.ts                   # Type definitions and data structures
└── public/
    └── patches/
        └── latest.json                 # Cached parsed patch data (optional)
```

### Data Flow

1. **Data Loading**: Parse Patch.txt file on server-side or build time
2. **Data Processing**: Extract and structure known issues and patch notes
3. **Component Rendering**: Pass structured data to React components
4. **Client Interaction**: Handle hover effects, scrolling, and animations

## Components and Interfaces

### 1. Data Types

```typescript
// lib/patch-data.ts

export interface KnownIssue {
  id: string;
  description: string;
  highlightedTerms: string[]; // Terms in brackets like [Longbow: Embla Inflorescence]
}

export interface PatchNote {
  id: string;
  description: string;
  highlightedTerms: string[];
  type: 'fix' | 'optimization' | 'other';
}

export interface UpdateGroup {
  date: string; // e.g., "2025-11-22"
  displayDate: string; // e.g., "Update Details - 2025-11-22"
  notes: PatchNote[];
}

export interface PatchData {
  knownIssues: KnownIssue[];
  updates: UpdateGroup[];
  lastUpdated: string;
}
```

### 2. Patch Parser

```typescript
// lib/patch-parser.ts

export class PatchParser {
  /**
   * Parse HTML content from Patch.txt
   */
  static parse(htmlContent: string): PatchData {
    // Use DOMParser or cheerio to parse HTML
    // Extract Known Issues section
    // Extract Update Details sections
    // Return structured data
  }

  /**
   * Extract text and highlight terms in brackets
   */
  static extractHighlightedTerms(text: string): string[] {
    // Match patterns like [Term] or [Term: Subterm]
    // Return array of terms
  }

  /**
   * Determine patch note type based on keywords
   */
  static determinePatchType(description: string): 'fix' | 'optimization' | 'other' {
    // Check for "Fixed", "Optimized", etc.
  }
}
```

### 3. Main Section Component

```typescript
// components/news/news-updates-section.tsx

interface NewsUpdatesSectionProps {
  patchData: PatchData;
  maxVisibleUpdates?: number; // Default: 5
  className?: string;
}

export function NewsUpdatesSection({
  patchData,
  maxVisibleUpdates = 5,
  className
}: NewsUpdatesSectionProps) {
  // Render two-column layout
  // Left: KnownIssuesCard
  // Right: PatchNotesCard
  // Handle responsive stacking on mobile
}
```

### 4. Known Issues Card

```typescript
// components/news/known-issues-card.tsx

interface KnownIssuesCardProps {
  issues: KnownIssue[];
  maxHeight?: string; // Default: "600px"
}

export function KnownIssuesCard({ issues, maxHeight }: KnownIssuesCardProps) {
  // Render card with title "Known Issues (Still Unresolved)"
  // Display scrollable list of issues
  // Each issue with ✧ icon
  // Highlight terms in brackets
}
```

### 5. Patch Notes Card

```typescript
// components/news/patch-notes-card.tsx

interface PatchNotesCardProps {
  updates: UpdateGroup[];
  maxHeight?: string; // Default: "600px"
  showMoreButton?: boolean;
}

export function PatchNotesCard({ 
  updates, 
  maxHeight,
  showMoreButton 
}: PatchNotesCardProps) {
  // Render card with title "Patch Notes (Bug Fixes and Improvements)"
  // Display scrollable list grouped by date
  // Each note with ✦ icon
  // Date headers for each group
  // Optional "Show More" button
}
```

## Data Models

### Parsing Strategy

The parser will use the following approach:

1. **HTML Parsing**: Use `cheerio` (server-side) or `DOMParser` (client-side)
2. **Known Issues Extraction**:
   - Find section with heading "Known Issues"
   - Extract all lines starting with ✧
   - Parse bracketed terms for highlighting
3. **Update Details Extraction**:
   - Find all sections with "[Update Details - DATE]"
   - Extract date from header
   - Extract all lines starting with ✦
   - Group by date
4. **Term Highlighting**:
   - Use regex: `/\[([^\]]+)\]/g`
   - Store matched terms for styling

### Example Parsed Data

```json
{
  "knownIssues": [
    {
      "id": "issue-1",
      "description": "In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause the launch point of homing arrows to be positioned incorrectly after charging.",
      "highlightedTerms": ["Longbow: Embla Inflorescence"]
    }
  ],
  "updates": [
    {
      "date": "2025-11-22",
      "displayDate": "Update Details - 2025-11-22",
      "notes": [
        {
          "id": "fix-1",
          "description": "Fixed an issue where the pick-up range bonus from the [Eclosion] effect would not apply immediately.",
          "highlightedTerms": ["Eclosion"],
          "type": "fix"
        }
      ]
    }
  ],
  "lastUpdated": "2025-11-22T00:00:00Z"
}
```

## Styling and Visual Design

### Card Design

```css
/* Base card styles */
.update-card {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.update-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  border-color: rgba(255, 255, 255, 0.2);
}

/* Card header */
.card-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
}

.card-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* Card content */
.card-content {
  padding: 16px 24px;
  max-height: 600px;
  overflow-y: auto;
}

/* Custom scrollbar */
.card-content::-webkit-scrollbar {
  width: 6px;
}

.card-content::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.card-content::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

.card-content::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}
```

### Item Styles

```css
/* Issue/Update item */
.update-item {
  padding: 12px 16px;
  margin-bottom: 8px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  transition: all 0.2s ease;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.update-item:hover {
  background: rgba(255, 255, 255, 0.08);
  transform: translateX(4px);
}

/* Icon */
.item-icon {
  color: #ffd700;
  font-size: 1rem;
  flex-shrink: 0;
  margin-top: 2px;
}

/* Description */
.item-description {
  color: #e0e0e0;
  font-size: 0.9rem;
  line-height: 1.6;
}

/* Highlighted terms */
.highlighted-term {
  color: #4fc3f7;
  background: rgba(79, 195, 247, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

/* Date header */
.date-header {
  font-size: 1rem;
  font-weight: 600;
  color: #ffd700;
  margin: 16px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 215, 0, 0.2);
}
```

### Layout

```css
/* Two-column layout */
.news-updates-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin: 32px 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .news-updates-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}
```

## Animations

### Card Entry Animation

```typescript
// Using framer-motion
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
};

// Stagger children
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};
```

### Item Hover Animation

```typescript
const itemVariants = {
  rest: { x: 0, backgroundColor: "rgba(255, 255, 255, 0.03)" },
  hover: { 
    x: 4, 
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    transition: {
      duration: 0.2,
      ease: "easeInOut"
    }
  }
};
```

## Error Handling

### Parsing Errors

```typescript
try {
  const patchData = PatchParser.parse(htmlContent);
  return patchData;
} catch (error) {
  console.error('Failed to parse patch data:', error);
  return {
    knownIssues: [],
    updates: [],
    lastUpdated: new Date().toISOString(),
    error: 'Failed to load patch notes'
  };
}
```

### Fallback UI

```typescript
// Display when parsing fails
<div className="error-state">
  <AlertCircle className="error-icon" />
  <p>Unable to load patch notes. Please try again later.</p>
</div>
```

## Testing Strategy

### Unit Tests

1. **Patch Parser Tests**
   - Test HTML parsing with valid input
   - Test extraction of known issues
   - Test extraction of update details
   - Test term highlighting regex
   - Test error handling with malformed HTML

2. **Component Tests**
   - Test KnownIssuesCard rendering
   - Test PatchNotesCard rendering
   - Test responsive layout
   - Test hover interactions
   - Test scrolling behavior

### Integration Tests

1. **Data Flow Tests**
   - Test end-to-end data loading and display
   - Test card interactions
   - Test responsive breakpoints

### Visual Regression Tests

1. **Screenshot Tests**
   - Desktop layout
   - Mobile layout
   - Hover states
   - Scrolled states

## Accessibility

### ARIA Labels

```typescript
<div 
  role="region" 
  aria-label="Game Updates and Known Issues"
  className="news-updates-section"
>
  <div 
    role="article" 
    aria-label="Known Issues"
    className="known-issues-card"
  >
    {/* Content */}
  </div>
  
  <div 
    role="article" 
    aria-label="Patch Notes"
    className="patch-notes-card"
  >
    {/* Content */}
  </div>
</div>
```

### Keyboard Navigation

- Cards should be focusable
- Scrollable areas should be keyboard accessible
- Tab order should be logical (left to right, top to bottom)

### Screen Reader Support

- Proper heading hierarchy (h2 for card titles, h3 for date headers)
- Descriptive text for icons
- Clear labels for interactive elements

## Performance Optimization

### Data Caching

```typescript
// Cache parsed data
const CACHE_KEY = 'patch-data-cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export function getCachedPatchData(): PatchData | null {
  const cached = localStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  const { data, timestamp } = JSON.parse(cached);
  if (Date.now() - timestamp > CACHE_DURATION) {
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
  
  return data;
}
```

### Lazy Loading

```typescript
// Lazy load the news section
const NewsUpdatesSection = dynamic(
  () => import('@/components/news/news-updates-section'),
  { 
    loading: () => <SkeletonLoader />,
    ssr: true 
  }
);
```

### Virtual Scrolling

For very long lists, implement virtual scrolling:

```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

// Only render visible items
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: () => 60,
  overscan: 5
});
```

## Internationalization

### Thai Language Support

```typescript
// translations/th.json
{
  "news": {
    "knownIssues": {
      "title": "ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)",
      "empty": "ไม่มีปัญหาที่ทราบในขณะนี้"
    },
    "patchNotes": {
      "title": "บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)",
      "showMore": "แสดงเพิ่มเติม",
      "empty": "ไม่มีการอัปเดตล่าสุด"
    }
  }
}
```

### Usage

```typescript
import { useTranslation } from 'next-i18next';

export function KnownIssuesCard() {
  const { t } = useTranslation('common');
  
  return (
    <div className="card">
      <h2>{t('news.knownIssues.title')}</h2>
      {/* Content */}
    </div>
  );
}
```

## Integration Points

### Homepage Integration

```typescript
// src/app/page.tsx

import { NewsUpdatesSection } from '@/components/news/news-updates-section';
import { getPatchData } from '@/lib/patch-parser';

export default async function HomePage() {
  const patchData = await getPatchData();
  
  return (
    <main>
      {/* Other sections */}
      
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8">News & Updates</h2>
        <NewsUpdatesSection patchData={patchData} />
      </section>
      
      {/* Other sections */}
    </main>
  );
}
```

### Standalone Page

```typescript
// src/app/news/page.tsx

export default async function NewsPage() {
  const patchData = await getPatchData();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Game Updates</h1>
      <p className="text-gray-400 mb-8">
        Stay informed about the latest patches and known issues
      </p>
      <NewsUpdatesSection 
        patchData={patchData} 
        maxVisibleUpdates={10}
      />
    </div>
  );
}
```

## Future Enhancements

1. **Search and Filter**: Add ability to search through patch notes
2. **Categories**: Filter by bug fixes, optimizations, new features
3. **Notifications**: Alert users to new updates
4. **Archive**: View historical patch notes
5. **RSS Feed**: Subscribe to updates
6. **Social Sharing**: Share specific updates on social media
