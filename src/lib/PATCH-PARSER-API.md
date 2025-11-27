# Patch Parser API Reference

## Overview

The Patch Parser module provides functionality to parse HTML patch files and extract structured data including known issues and patch notes. This document provides a complete API reference for all public interfaces, types, and methods.

---

## Table of Contents

1. [Type Definitions](#type-definitions)
2. [PatchParser Class](#patchparser-class)
3. [Usage Examples](#usage-examples)
4. [Error Handling](#error-handling)
5. [Performance Considerations](#performance-considerations)

---

## Type Definitions

### PatchData

Main data structure containing all patch information.

```typescript
interface PatchData {
  knownIssues: KnownIssue[];
  updates: UpdateGroup[];
  lastUpdated: string;
  error?: string;
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `knownIssues` | `KnownIssue[]` | Array of known issues extracted from the patch file |
| `updates` | `UpdateGroup[]` | Array of update groups, sorted by date (newest first) |
| `lastUpdated` | `string` | ISO 8601 timestamp of when the data was parsed |
| `error` | `string?` | Optional error message if parsing failed |

**Example:**

```typescript
const patchData: PatchData = {
  knownIssues: [
    {
      id: 'issue-1',
      description: 'Bug description',
      highlightedTerms: ['Term1']
    }
  ],
  updates: [
    {
      date: '2025-11-22',
      displayDate: 'Update Details - 2025-11-22',
      notes: [
        {
          id: 'note-1',
          description: 'Fixed bug',
          highlightedTerms: ['Bug'],
          type: 'fix'
        }
      ]
    }
  ],
  lastUpdated: '2025-11-22T10:30:00.000Z'
};
```

---

### KnownIssue

Represents a single known issue in the game.

```typescript
interface KnownIssue {
  id: string;
  description: string;
  highlightedTerms: string[];
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier for the issue (e.g., "issue-1") |
| `description` | `string` | Full description of the issue |
| `highlightedTerms` | `string[]` | Array of terms extracted from brackets in the description |

**Example:**

```typescript
const issue: KnownIssue = {
  id: 'issue-1',
  description: 'In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause issues.',
  highlightedTerms: ['Longbow: Embla Inflorescence']
};
```

---

### UpdateGroup

Represents a group of patch notes for a specific date.

```typescript
interface UpdateGroup {
  date: string;
  displayDate: string;
  notes: PatchNote[];
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `date` | `string` | Date in YYYY-MM-DD format (e.g., "2025-11-22") |
| `displayDate` | `string` | Formatted display date (e.g., "Update Details - 2025-11-22") |
| `notes` | `PatchNote[]` | Array of patch notes for this date |

**Example:**

```typescript
const updateGroup: UpdateGroup = {
  date: '2025-11-22',
  displayDate: 'Update Details - 2025-11-22',
  notes: [
    {
      id: '2025-11-22-note-1',
      description: 'Fixed an issue',
      highlightedTerms: [],
      type: 'fix'
    }
  ]
};
```

---

### PatchNote

Represents a single patch note or fix.

```typescript
interface PatchNote {
  id: string;
  description: string;
  highlightedTerms: string[];
  type: 'fix' | 'optimization' | 'other';
}
```

**Properties:**

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique identifier (e.g., "2025-11-22-note-1") |
| `description` | `string` | Full description of the patch note |
| `highlightedTerms` | `string[]` | Array of terms extracted from brackets |
| `type` | `'fix' \| 'optimization' \| 'other'` | Type of patch note based on keywords |

**Patch Note Types:**

- `'fix'`: Contains keywords "fixed" or "fix"
- `'optimization'`: Contains keywords "optimized" or "optimization"
- `'other'`: No recognized keywords

**Example:**

```typescript
const patchNote: PatchNote = {
  id: '2025-11-22-note-1',
  description: 'Fixed an issue where [Eclosion] would not apply.',
  highlightedTerms: ['Eclosion'],
  type: 'fix'
};
```

---

## PatchParser Class

Static class providing methods to parse HTML patch files.

### Methods

#### `parse(htmlContent: string): PatchData`

Parses HTML content and returns structured patch data.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `htmlContent` | `string` | Raw HTML string from patch file |

**Returns:** `PatchData` - Structured patch data object

**Throws:** Does not throw. Returns error in `PatchData.error` field if parsing fails.

**Algorithm:**

1. Parse HTML using DOMParser
2. Extract Known Issues section (lines starting with ✧)
3. Extract Update Details sections (lines starting with ✦)
4. Group updates by date
5. Sort updates by date (newest first)
6. Assign unique IDs to all items
7. Return structured PatchData

**Example:**

```typescript
import { PatchParser } from '@/lib/patch-parser';
import fs from 'fs';

// Read HTML file
const htmlContent = fs.readFileSync('Patch.txt', 'utf-8');

// Parse content
const patchData = PatchParser.parse(htmlContent);

// Check for errors
if (patchData.error) {
  console.error('Parse error:', patchData.error);
} else {
  console.log('Found', patchData.knownIssues.length, 'known issues');
  console.log('Found', patchData.updates.length, 'update groups');
}
```

**Expected HTML Structure:**

```html
<div class="ace-line"><strong>▍Known Issues</strong></div>
<div class="ace-line">✧ Issue description with [Bracketed Term]</div>
<div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
<div class="ace-line">✦ Fixed issue with [Term]</div>
```

---

#### `extractHighlightedTerms(text: string): string[]`

Extracts terms enclosed in square brackets from text.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `text` | `string` | Text to search for bracketed terms |

**Returns:** `string[]` - Array of terms found in brackets (without the brackets)

**Algorithm:**

1. Use regex pattern `/\[([^\]]+)\]/g`
2. Find all matches of `[term]` in text
3. Extract content between brackets
4. Return array of matched terms

**Example:**

```typescript
import { PatchParser } from '@/lib/patch-parser';

const text = 'Fixed [Longbow: Embla] and [Summon: Aurelia] issues.';
const terms = PatchParser.extractHighlightedTerms(text);

console.log(terms);
// Output: ['Longbow: Embla', 'Summon: Aurelia']
```

**Edge Cases:**

```typescript
// Empty brackets
PatchParser.extractHighlightedTerms('Text with []');
// Returns: []

// No brackets
PatchParser.extractHighlightedTerms('Text without brackets');
// Returns: []

// Multiple brackets
PatchParser.extractHighlightedTerms('[A] and [B] and [C]');
// Returns: ['A', 'B', 'C']

// Nested content
PatchParser.extractHighlightedTerms('[Item: Name & Description]');
// Returns: ['Item: Name & Description']
```

---

#### `determinePatchType(description: string): 'fix' | 'optimization' | 'other'`

Determines the type of patch note based on keywords in the description.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `description` | `string` | Patch note description text |

**Returns:** `'fix' | 'optimization' | 'other'` - Type of patch note

**Algorithm:**

1. Convert description to lowercase
2. Check for keyword "fixed" or "fix" → return `'fix'`
3. Check for keyword "optimized" or "optimization" → return `'optimization'`
4. Otherwise → return `'other'`

**Priority:** If both "fixed" and "optimized" appear, returns `'fix'` (checked first).

**Example:**

```typescript
import { PatchParser } from '@/lib/patch-parser';

// Fix type
PatchParser.determinePatchType('Fixed an issue with the game');
// Returns: 'fix'

// Optimization type
PatchParser.determinePatchType('Optimized performance on mobile');
// Returns: 'optimization'

// Other type
PatchParser.determinePatchType('Updated game content');
// Returns: 'other'

// Case insensitive
PatchParser.determinePatchType('FIXED AN ISSUE');
// Returns: 'fix'

// Mixed keywords (fix takes priority)
PatchParser.determinePatchType('Fixed and optimized the system');
// Returns: 'fix'
```

---

## Usage Examples

### Basic Parsing

```typescript
import { PatchParser } from '@/lib/patch-parser';

const html = `
  <div class="ace-line"><strong>▍Known Issues</strong></div>
  <div class="ace-line">✧ Issue 1</div>
  <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
  <div class="ace-line">✦ Fixed bug</div>
`;

const patchData = PatchParser.parse(html);
console.log(patchData);
```

### Server-Side Usage (Next.js)

```typescript
// lib/patch-data-server.ts
import fs from 'fs';
import path from 'path';
import { PatchParser } from './patch-parser';

export async function getPatchData() {
  const patchPath = path.join(process.cwd(), 'Patch.txt');
  const htmlContent = fs.readFileSync(patchPath, 'utf-8');
  return PatchParser.parse(htmlContent);
}

// app/news/page.tsx
import { getPatchData } from '@/lib/patch-data-server';

export default async function NewsPage() {
  const patchData = await getPatchData();
  return <NewsSection data={patchData} />;
}
```

### Client-Side Usage with Caching

```typescript
// hooks/use-patch-data.ts
import { useState, useEffect } from 'react';
import { PatchParser } from '@/lib/patch-parser';
import { getCachedPatchData, setCachedPatchData } from '@/lib/patch-cache';

export function usePatchData() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      // Check cache first
      const cached = getCachedPatchData();
      if (cached) {
        setData(cached);
        setLoading(false);
        return;
      }

      // Fetch and parse
      try {
        const response = await fetch('/api/patch-data');
        const html = await response.text();
        const patchData = PatchParser.parse(html);
        
        setCachedPatchData(patchData);
        setData(patchData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
```

### Filtering and Transforming Data

```typescript
import { PatchParser } from '@/lib/patch-parser';

const patchData = PatchParser.parse(html);

// Get only fixes
const fixes = patchData.updates.flatMap(update => 
  update.notes.filter(note => note.type === 'fix')
);

// Get recent updates (last 7 days)
const sevenDaysAgo = new Date();
sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

const recentUpdates = patchData.updates.filter(update => 
  new Date(update.date) >= sevenDaysAgo
);

// Get all highlighted terms
const allTerms = new Set([
  ...patchData.knownIssues.flatMap(issue => issue.highlightedTerms),
  ...patchData.updates.flatMap(update => 
    update.notes.flatMap(note => note.highlightedTerms)
  )
]);
```

---

## Error Handling

### Graceful Degradation

The parser never throws errors. Instead, it returns an error message in the `PatchData.error` field:

```typescript
const patchData = PatchParser.parse(malformedHTML);

if (patchData.error) {
  console.error('Parse error:', patchData.error);
  // Display fallback UI
} else {
  // Display parsed data
}
```

### Common Error Scenarios

1. **Malformed HTML**: Returns empty arrays for issues and updates
2. **Missing sections**: Returns empty arrays for missing sections
3. **Invalid dates**: Skips invalid date entries
4. **Empty input**: Returns empty PatchData structure

### Error Recovery

```typescript
function safeParse(html: string): PatchData {
  try {
    const patchData = PatchParser.parse(html);
    
    // Validate data
    if (patchData.knownIssues.length === 0 && patchData.updates.length === 0) {
      console.warn('No data extracted from HTML');
    }
    
    return patchData;
  } catch (error) {
    console.error('Unexpected error:', error);
    
    // Return empty data structure
    return {
      knownIssues: [],
      updates: [],
      lastUpdated: new Date().toISOString(),
      error: 'Failed to parse patch data'
    };
  }
}
```

---

## Performance Considerations

### Parsing Performance

- **Small files** (< 100 KB): < 50ms
- **Medium files** (100-500 KB): 50-200ms
- **Large files** (> 500 KB): 200-500ms

### Optimization Tips

1. **Cache parsed data**: Don't re-parse on every render
2. **Parse server-side**: Use Next.js server components
3. **Lazy load**: Only parse when needed
4. **Memoize results**: Use React.useMemo for derived data

### Memory Usage

- **Typical usage**: 1-5 MB for parsed data
- **Large datasets**: 10-20 MB for 1000+ items

### Benchmarking

```typescript
function benchmarkParse(html: string) {
  const iterations = 100;
  const start = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    PatchParser.parse(html);
  }
  
  const end = performance.now();
  const avgTime = (end - start) / iterations;
  
  console.log(`Average parse time: ${avgTime.toFixed(2)}ms`);
}
```

---

## Best Practices

### 1. Always Check for Errors

```typescript
const patchData = PatchParser.parse(html);
if (patchData.error) {
  // Handle error
}
```

### 2. Cache Parsed Data

```typescript
const cached = getCachedPatchData();
if (!cached) {
  const patchData = PatchParser.parse(html);
  setCachedPatchData(patchData);
}
```

### 3. Validate Input

```typescript
if (!html || typeof html !== 'string') {
  throw new Error('Invalid HTML input');
}
```

### 4. Use TypeScript

```typescript
import { PatchData, KnownIssue, UpdateGroup } from '@/lib/patch-data';

function processData(data: PatchData): void {
  // TypeScript ensures type safety
}
```

### 5. Handle Edge Cases

```typescript
// Empty data
if (patchData.knownIssues.length === 0) {
  return <EmptyState />;
}

// No recent updates
const hasRecentUpdates = patchData.updates.length > 0;
```

---

## Migration Guide

### From v0.x to v1.0

**Breaking Changes:**

1. `parse()` now returns `PatchData` instead of throwing errors
2. Date format changed from `MM/DD/YYYY` to `YYYY-MM-DD`
3. `highlightedTerms` is now always an array (never null)

**Migration Steps:**

```typescript
// Old code (v0.x)
try {
  const data = PatchParser.parse(html);
} catch (error) {
  console.error(error);
}

// New code (v1.0)
const data = PatchParser.parse(html);
if (data.error) {
  console.error(data.error);
}
```

---

## FAQ

### Q: Can I parse non-HTML content?

A: No, the parser expects HTML with specific structure. For other formats, you'll need a different parser.

### Q: How do I handle very large patch files?

A: Consider streaming parsing or splitting the file into chunks. The current implementation loads the entire file into memory.

### Q: Can I customize the parsing logic?

A: Yes, you can extend the `PatchParser` class or create a custom parser using the same interfaces.

### Q: Does it work in Node.js?

A: Yes, but you need to provide a DOMParser implementation (e.g., using `jsdom` or `linkedom`).

---

## Support

For issues or questions:
- Check the [main documentation](./NEWS-UPDATES-DOCUMENTATION.md)
- Review [test examples](./__tests__/README-TESTING.md)
- Open an issue in the project repository

---

## License

This API is part of the main application and follows the same license.
