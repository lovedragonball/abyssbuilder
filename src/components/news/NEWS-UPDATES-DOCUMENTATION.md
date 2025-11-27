# News Updates Section - Comprehensive Documentation

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Component API](#component-api)
4. [Data Structures](#data-structures)
5. [Parsing Logic](#parsing-logic)
6. [Usage Examples](#usage-examples)
7. [Styling Guide](#styling-guide)
8. [Testing](#testing)
9. [Accessibility](#accessibility)
10. [Performance](#performance)
11. [Internationalization](#internationalization)
12. [Troubleshooting](#troubleshooting)

---

## Overview

The News Updates Section is a feature-rich component that displays game patch notes and known issues in an engaging, social media-inspired card layout. It parses HTML patch data and presents it in a visually appealing, space-efficient format.

### Key Features

- **Card-based Layout**: Social media-inspired design with Known Issues and Patch Notes cards
- **Responsive Design**: Two-column desktop layout, single-column mobile layout
- **Smart Parsing**: Extracts and structures data from HTML patch files
- **Term Highlighting**: Automatically highlights game elements in brackets (e.g., `[Longbow: Embla Inflorescence]`)
- **Date Grouping**: Organizes patch notes by date in reverse chronological order
- **Smooth Animations**: Fade-in, slide, and hover effects using Framer Motion
- **Accessibility**: WCAG AA compliant with proper ARIA labels and keyboard navigation
- **Performance**: Lazy loading, caching, and optimized rendering
- **Internationalization**: Full support for English and Thai languages

---

## Architecture

### Component Hierarchy

```
NewsUpdatesSection (Main Container)
├── KnownIssuesCard (Left Card)
│   └── UpdateCard (Base Card Component)
│       └── Multiple Issue Items
│           ├── Icon (✧)
│           └── Description with Highlighted Terms
└── PatchNotesCard (Right Card)
    └── UpdateCard (Base Card Component)
        └── Multiple Update Groups
            ├── Date Header
            └── Multiple Note Items
                ├── Icon (✦)
                └── Description with Highlighted Terms
```

### File Structure

```
src/
├── components/
│   ├── news/
│   │   ├── news-updates-section.tsx       # Main container
│   │   ├── known-issues-card.tsx          # Known issues display
│   │   ├── patch-notes-card.tsx           # Patch notes display
│   │   ├── news-error-boundary.tsx        # Error handling
│   │   ├── news-skeleton.tsx              # Loading state
│   │   └── __tests__/                     # Component tests
│   └── ui/
│       └── update-card.tsx                # Reusable card base
├── lib/
│   ├── patch-data.ts                      # Type definitions
│   ├── patch-parser.ts                    # HTML parsing logic
│   ├── patch-cache.ts                     # Caching mechanism
│   ├── patch-data-server.ts               # Server-side data fetching
│   └── __tests__/                         # Parser tests
└── hooks/
    └── use-patch-data.ts                  # Data fetching hook
```

---

## Component API

### NewsUpdatesSection

Main container component that orchestrates the display of news updates.

```typescript
interface NewsUpdatesSectionProps {
  patchData: PatchData;           // Parsed patch data
  maxVisibleUpdates?: number;     // Max update groups to show (default: 5)
  maxHeight?: string;             // Max height for cards (default: "600px")
  locale?: 'en' | 'th';          // Language locale (default: 'en')
  className?: string;             // Additional CSS classes
}
```

**Example:**

```tsx
<NewsUpdatesSection 
  patchData={patchData}
  maxVisibleUpdates={5}
  maxHeight="700px"
  locale="en"
  className="my-custom-class"
/>
```

### KnownIssuesCard

Displays a list of known issues in a scrollable card.

```typescript
interface KnownIssuesCardProps {
  issues: KnownIssue[];          // Array of known issues
  maxHeight?: string;            // Max height for scrollable area
  locale?: 'en' | 'th';         // Language locale
  className?: string;            // Additional CSS classes
}
```

**Example:**

```tsx
<KnownIssuesCard 
  issues={patchData.knownIssues}
  maxHeight="600px"
  locale="en"
/>
```

### PatchNotesCard

Displays patch notes grouped by date in a scrollable card.

```typescript
interface PatchNotesCardProps {
  updates: UpdateGroup[];        // Array of update groups
  maxHeight?: string;            // Max height for scrollable area
  maxVisibleUpdates?: number;    // Max groups to show initially
  locale?: 'en' | 'th';         // Language locale
  className?: string;            // Additional CSS classes
}
```

**Example:**

```tsx
<PatchNotesCard 
  updates={patchData.updates}
  maxHeight="600px"
  maxVisibleUpdates={5}
  locale="en"
/>
```

### UpdateCard

Reusable base card component with consistent styling.

```typescript
interface UpdateCardProps {
  title: string;                 // Card title
  icon?: React.ReactNode;        // Optional icon
  children: React.ReactNode;     // Card content
  className?: string;            // Additional CSS classes
  ariaLabel?: string;           // ARIA label for accessibility
}
```

**Example:**

```tsx
<UpdateCard 
  title="My Card"
  icon={<Icon />}
  ariaLabel="My custom card"
>
  <div>Card content here</div>
</UpdateCard>
```

---

## Data Structures

### PatchData

Main data structure containing all patch information.

```typescript
interface PatchData {
  knownIssues: KnownIssue[];     // Array of known issues
  updates: UpdateGroup[];         // Array of update groups
  lastUpdated: string;            // ISO timestamp of last update
  error?: string;                 // Optional error message
}
```

### KnownIssue

Represents a single known issue.

```typescript
interface KnownIssue {
  id: string;                     // Unique identifier
  description: string;            // Issue description
  highlightedTerms: string[];     // Terms to highlight (from brackets)
}
```

### UpdateGroup

Represents a group of patch notes for a specific date.

```typescript
interface UpdateGroup {
  date: string;                   // Date in YYYY-MM-DD format
  displayDate: string;            // Formatted display date
  notes: PatchNote[];             // Array of patch notes
}
```

### PatchNote

Represents a single patch note or fix.

```typescript
interface PatchNote {
  id: string;                     // Unique identifier
  description: string;            // Note description
  highlightedTerms: string[];     // Terms to highlight
  type: 'fix' | 'optimization' | 'other';  // Note type
}
```

---

## Parsing Logic

### PatchParser Class

The `PatchParser` class handles extraction of data from HTML patch files.

#### Main Methods

##### `parse(htmlContent: string): PatchData`

Parses HTML content and returns structured patch data.

**Algorithm:**

1. Parse HTML using DOMParser (browser) or cheerio (Node.js)
2. Extract Known Issues section:
   - Find heading containing "Known Issues"
   - Extract all lines starting with ✧
   - Parse bracketed terms for highlighting
3. Extract Update Details sections:
   - Find all headings matching `[Update Details - DATE]`
   - Extract date from heading
   - Extract all lines starting with ✦ under each date
   - Group notes by date
4. Sort updates by date (newest first)
5. Assign unique IDs to all items
6. Return structured `PatchData` object

**Example:**

```typescript
const htmlContent = fs.readFileSync('Patch.txt', 'utf-8');
const patchData = PatchParser.parse(htmlContent);
```

##### `extractHighlightedTerms(text: string): string[]`

Extracts terms enclosed in brackets from text.

**Algorithm:**

1. Use regex pattern: `/\[([^\]]+)\]/g`
2. Match all occurrences of `[term]` in text
3. Extract content between brackets
4. Return array of matched terms

**Example:**

```typescript
const text = 'Fixed [Longbow: Embla] and [Summon: Aurelia] issues.';
const terms = PatchParser.extractHighlightedTerms(text);
// Returns: ['Longbow: Embla', 'Summon: Aurelia']
```

##### `determinePatchType(description: string): 'fix' | 'optimization' | 'other'`

Determines the type of patch note based on keywords.

**Algorithm:**

1. Convert description to lowercase
2. Check for keyword "fixed" → return 'fix'
3. Check for keyword "optimized" → return 'optimization'
4. Otherwise → return 'other'

**Example:**

```typescript
const type1 = PatchParser.determinePatchType('Fixed an issue');
// Returns: 'fix'

const type2 = PatchParser.determinePatchType('Optimized performance');
// Returns: 'optimization'
```

### HTML Structure Expected

The parser expects HTML with the following structure:

```html
<!DOCTYPE html>
<html>
  <body>
    <!-- Known Issues Section -->
    <div class="ace-line"><strong>▍Known Issues</strong></div>
    <div class="ace-line">Description text</div>
    <div class="ace-line">✧ Issue 1 with [Bracketed Term]</div>
    <div class="ace-line">✧ Issue 2 with [Another Term]</div>
    
    <!-- Update Details Section -->
    <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
    <div class="ace-line">✦ Fixed issue with [Term]</div>
    <div class="ace-line">✦ Optimized [Another Term]</div>
    
    <!-- Additional Update Sections -->
    <div class="ace-line"><strong>[Update Details - 2025-11-20]</strong></div>
    <div class="ace-line">✦ Fixed another issue</div>
  </body>
</html>
```

---

## Usage Examples

### Basic Usage

```tsx
import { NewsUpdatesSection } from '@/components/news/news-updates-section';
import { getPatchData } from '@/lib/patch-data-server';

export default async function NewsPage() {
  const patchData = await getPatchData();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Game Updates</h1>
      <NewsUpdatesSection patchData={patchData} />
    </div>
  );
}
```

### With Custom Configuration

```tsx
<NewsUpdatesSection 
  patchData={patchData}
  maxVisibleUpdates={10}
  maxHeight="800px"
  locale="th"
  className="custom-news-section"
/>
```

### Client-Side with Hook

```tsx
'use client';

import { usePatchData } from '@/hooks/use-patch-data';
import { NewsUpdatesSection } from '@/components/news/news-updates-section';
import { NewsSkeleton } from '@/components/news/news-skeleton';

export function ClientNewsSection() {
  const { data, loading, error } = usePatchData();
  
  if (loading) return <NewsSkeleton />;
  if (error) return <div>Error: {error}</div>;
  
  return <NewsUpdatesSection patchData={data} />;
}
```

### Individual Card Usage

```tsx
import { KnownIssuesCard } from '@/components/news/known-issues-card';
import { PatchNotesCard } from '@/components/news/patch-notes-card';

export function CustomLayout({ patchData }: { patchData: PatchData }) {
  return (
    <div className="custom-layout">
      <div className="sidebar">
        <KnownIssuesCard issues={patchData.knownIssues} />
      </div>
      <div className="main-content">
        <PatchNotesCard updates={patchData.updates} />
      </div>
    </div>
  );
}
```

### With Error Boundary

```tsx
import { NewsErrorBoundary } from '@/components/news/news-error-boundary';

export function SafeNewsSection({ patchData }: { patchData: PatchData }) {
  return (
    <NewsErrorBoundary>
      <NewsUpdatesSection patchData={patchData} />
    </NewsErrorBoundary>
  );
}
```

---

## Styling Guide

### CSS Classes

#### Card Classes

- `.update-card` - Base card styling
- `.card-header` - Card header area
- `.card-title` - Card title text
- `.card-content` - Scrollable content area

#### Item Classes

- `.update-item` - Individual issue/note item
- `.item-icon` - Icon (✧ or ✦)
- `.item-description` - Item description text
- `.highlighted-term` - Highlighted bracketed terms

#### Layout Classes

- `.news-updates-grid` - Main grid container
- `.news-updates-section` - Section wrapper

#### Date Classes

- `.date-header` - Date group header

### Customization

Override default styles by targeting classes:

```css
/* Custom card background */
.update-card {
  background: linear-gradient(135deg, #your-color-1, #your-color-2);
}

/* Custom highlight color */
.highlighted-term {
  color: #your-highlight-color;
  background: rgba(your-color, 0.1);
}

/* Custom scrollbar */
.card-content::-webkit-scrollbar-thumb {
  background: #your-scrollbar-color;
}
```

### Tailwind Customization

Extend Tailwind config for custom colors:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'news-card': '#1a1a2e',
        'news-highlight': '#4fc3f7',
      },
    },
  },
};
```

---

## Testing

### Unit Tests

Test individual functions and components in isolation.

```typescript
// Test PatchParser
import { PatchParser } from '@/lib/patch-parser';

describe('PatchParser', () => {
  it('should extract highlighted terms', () => {
    const text = 'Fixed [Term1] and [Term2]';
    const terms = PatchParser.extractHighlightedTerms(text);
    expect(terms).toEqual(['Term1', 'Term2']);
  });
});
```

### Component Tests

Test component rendering and interactions.

```typescript
// Test KnownIssuesCard
import { render, screen } from '@testing-library/react';
import { KnownIssuesCard } from '@/components/news/known-issues-card';

describe('KnownIssuesCard', () => {
  it('should render issues', () => {
    const issues = [
      { id: '1', description: 'Test issue', highlightedTerms: [] }
    ];
    render(<KnownIssuesCard issues={issues} />);
    expect(screen.getByText('Test issue')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test complete data flow from parsing to rendering.

```typescript
// Test full integration
import { PatchParser } from '@/lib/patch-parser';
import { NewsUpdatesSection } from '@/components/news/news-updates-section';

describe('News Updates Integration', () => {
  it('should parse and render patch data', () => {
    const html = '<div>...</div>'; // Sample HTML
    const patchData = PatchParser.parse(html);
    const { container } = render(<NewsUpdatesSection patchData={patchData} />);
    expect(container.querySelector('.news-updates-grid')).toBeInTheDocument();
  });
});
```

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test patch-parser.test.ts

# Run tests in watch mode
npm test -- --watch

# Run tests with coverage
npm test -- --coverage
```

---

## Accessibility

### ARIA Labels

All components include proper ARIA labels:

```tsx
<div role="region" aria-label="Game News and Updates">
  <div role="article" aria-label="Known Issues">
    {/* Content */}
  </div>
</div>
```

### Keyboard Navigation

- Cards are focusable with `Tab` key
- Scrollable areas support keyboard scrolling
- Interactive elements have visible focus indicators

### Screen Reader Support

- Proper heading hierarchy (h2 for cards, h3 for dates)
- Descriptive text for icons
- Status and alert roles for dynamic content

### Color Contrast

All text meets WCAG AA standards:

- Normal text: 4.5:1 contrast ratio
- Large text: 3:1 contrast ratio
- Interactive elements: 3:1 contrast ratio

### Testing Accessibility

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<NewsUpdatesSection patchData={data} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Performance

### Optimization Techniques

1. **Lazy Loading**: Component loads only when in viewport
2. **Caching**: Parsed data cached for 1 hour
3. **Memoization**: React.memo for card components
4. **Virtual Scrolling**: For very long lists (optional)
5. **Code Splitting**: Dynamic imports for heavy components

### Caching Strategy

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

### Performance Monitoring

```typescript
import { measurePerformance } from '@/lib/performance-monitor';

const metrics = measurePerformance(() => {
  const patchData = PatchParser.parse(html);
  return patchData;
});

console.log('Parse time:', metrics.duration, 'ms');
```

---

## Internationalization

### Supported Languages

- English (en)
- Thai (th)

### Translation Files

```json
// public/locales/en/common.json
{
  "news": {
    "knownIssues": {
      "title": "Known Issues (Still Unresolved)",
      "empty": "No known issues at this time"
    },
    "patchNotes": {
      "title": "Patch Notes (Bug Fixes and Improvements)",
      "showMore": "Show More",
      "empty": "No recent updates"
    }
  }
}
```

```json
// public/locales/th/common.json
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

```tsx
<NewsUpdatesSection patchData={patchData} locale="th" />
```

---

## Troubleshooting

### Common Issues

#### Issue: Cards not rendering

**Solution:** Check that `patchData` is properly formatted and contains data.

```typescript
console.log('Patch data:', patchData);
console.log('Issues:', patchData.knownIssues.length);
console.log('Updates:', patchData.updates.length);
```

#### Issue: Parsing fails

**Solution:** Verify HTML structure matches expected format.

```typescript
try {
  const patchData = PatchParser.parse(html);
} catch (error) {
  console.error('Parse error:', error);
}
```

#### Issue: Highlighted terms not showing

**Solution:** Ensure terms are enclosed in brackets `[Term]`.

```typescript
const terms = PatchParser.extractHighlightedTerms(description);
console.log('Extracted terms:', terms);
```

#### Issue: Animations not working

**Solution:** Check that Framer Motion is properly installed.

```bash
npm install framer-motion
```

#### Issue: Styles not applying

**Solution:** Verify Tailwind CSS is configured and classes are not purged.

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
  ],
};
```

### Debug Mode

Enable debug logging:

```typescript
const DEBUG = process.env.NODE_ENV === 'development';

if (DEBUG) {
  console.log('Parsing HTML...');
  console.log('Found issues:', knownIssues.length);
  console.log('Found updates:', updates.length);
}
```

### Performance Issues

If experiencing slow rendering:

1. Reduce `maxVisibleUpdates`
2. Implement virtual scrolling
3. Check for unnecessary re-renders
4. Use React DevTools Profiler

---

## Additional Resources

- [Framer Motion Documentation](https://www.framer.com/motion/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/react)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

## Changelog

### Version 1.0.0 (2025-11-24)

- Initial release
- Card-based layout with Known Issues and Patch Notes
- HTML parsing with term highlighting
- Responsive design
- Accessibility features
- Performance optimizations
- Thai language support

---

## License

This component is part of the main application and follows the same license.

---

## Support

For issues or questions, please contact the development team or open an issue in the project repository.
