# NewsUpdatesSection Component

A comprehensive container component that displays game patch notes and known issues in a responsive, animated card layout.

## Overview

The `NewsUpdatesSection` component is the main container for displaying game updates. It orchestrates the layout of `KnownIssuesCard` and `PatchNotesCard` components in a two-column grid on desktop and a stacked layout on mobile devices.

## Features

- ✅ **Responsive Layout**: Two-column grid on desktop, stacked on mobile
- ✅ **Animated Entry**: Smooth fade and slide animations with staggered children
- ✅ **Error Handling**: Graceful error fallback UI with retry options
- ✅ **Empty States**: User-friendly messages when no data is available
- ✅ **Accessibility**: Full ARIA support with proper roles and labels
- ✅ **Internationalization**: English and Thai language support
- ✅ **Performance**: Optimized rendering with proper component structure

## Usage

### Basic Usage

```tsx
import { NewsUpdatesSection } from '@/components/news/news-updates-section'
import { getPatchData } from '@/lib/patch-parser'

export default async function NewsPage() {
  const patchData = await getPatchData()
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Game Updates</h1>
      <NewsUpdatesSection patchData={patchData} />
    </div>
  )
}
```

### With Custom Options

```tsx
<NewsUpdatesSection
  patchData={patchData}
  maxVisibleUpdates={10}
  maxHeight="800px"
  locale="th"
  className="my-custom-class"
/>
```

### Homepage Integration

```tsx
// src/app/page.tsx
import { NewsUpdatesSection } from '@/components/news/news-updates-section'
import { getPatchData } from '@/lib/patch-parser'

export default async function HomePage() {
  const patchData = await getPatchData()
  
  return (
    <main>
      {/* Other sections */}
      
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">
          News & Updates
        </h2>
        <NewsUpdatesSection 
          patchData={patchData}
          maxVisibleUpdates={5}
        />
      </section>
      
      {/* Other sections */}
    </main>
  )
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `patchData` | `PatchData` | Required | Patch data containing known issues and updates |
| `maxVisibleUpdates` | `number` | `5` | Maximum number of visible update groups in patch notes |
| `className` | `string` | `undefined` | Additional CSS classes for the container |
| `locale` | `string` | `"en"` | Locale for translations (`"en"` or `"th"`) |
| `maxHeight` | `string` | `"600px"` | Maximum height for card content areas |

## PatchData Interface

```typescript
interface PatchData {
  knownIssues: KnownIssue[]
  updates: UpdateGroup[]
  lastUpdated: string
  error?: string
}

interface KnownIssue {
  id: string
  description: string
  highlightedTerms: string[]
}

interface UpdateGroup {
  date: string
  displayDate: string
  notes: PatchNote[]
}

interface PatchNote {
  id: string
  description: string
  highlightedTerms: string[]
  type: 'fix' | 'optimization' | 'other'
}
```

## Layout Behavior

### Desktop (≥768px)
- Two-column grid layout
- Known Issues card on the left
- Patch Notes card on the right
- Equal column widths
- 24px gap between columns

### Mobile (<768px)
- Single column stacked layout
- Known Issues card appears first
- Patch Notes card appears second
- 16px gap between cards

## States

### Normal State
Displays both cards with data when `patchData` contains issues or updates.

### Error State
Displays error fallback UI when `patchData.error` is present:
- Error icon (AlertCircle)
- Error title
- Error message
- Proper ARIA alert role

### Empty State
Displays empty message when both `knownIssues` and `updates` arrays are empty:
- Centered message
- Proper ARIA status role
- Localized text

## Animations

### Container Animation
```typescript
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}
```

### Card Animation
```typescript
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
}
```

## Accessibility

### ARIA Attributes
- `role="region"` on main container
- `aria-label` with descriptive text
- `role="alert"` for error states
- `role="status"` for empty states
- `aria-live="polite"` for dynamic content

### Keyboard Navigation
- All interactive elements are keyboard accessible
- Proper tab order (left to right, top to bottom)
- Focus indicators on interactive elements

### Screen Reader Support
- Descriptive labels for all regions
- Proper heading hierarchy
- Clear content structure

## Internationalization

### Supported Languages
- English (`en`)
- Thai (`th`)

### Translation Keys

#### English
```typescript
{
  region: "Game News and Updates",
  error: {
    title: "Unable to load patch notes",
    defaultMessage: "Please try again later."
  },
  empty: "No updates available"
}
```

#### Thai
```typescript
{
  region: "ข่าวสารและการอัปเดตเกม",
  error: {
    title: "ไม่สามารถโหลดบันทึกการแก้ไขได้",
    defaultMessage: "โปรดลองอีกครั้งในภายหลัง"
  },
  empty: "ไม่มีข้อมูลอัปเดต"
}
```

## Styling

### CSS Classes

#### Container
```css
.news-updates-section {
  width: 100%;
}
```

#### Grid
```css
.news-updates-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .news-updates-grid {
    grid-template-columns: 1fr 1fr;
  }
}
```

#### Error State
```css
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1.5rem;
  text-align: center;
}
```

## Testing

### Unit Tests
Run the test suite:
```bash
npm test src/components/news/__tests__/news-updates-section.test.tsx
```

### Test Coverage
- ✅ Layout and rendering
- ✅ Data integration
- ✅ Error handling
- ✅ Empty states
- ✅ Internationalization
- ✅ Responsive behavior
- ✅ Accessibility
- ✅ Props forwarding

### Visual Testing
Visit the demo page:
```
http://localhost:3000/demo/news-updates-section
```

## Performance Considerations

### Optimization Strategies
1. **Component Memoization**: Child components use `React.memo`
2. **Lazy Loading**: Can be lazy loaded with `next/dynamic`
3. **Animation Performance**: Uses CSS transforms for smooth animations
4. **Data Caching**: Supports cached patch data

### Lazy Loading Example
```tsx
import dynamic from 'next/dynamic'

const NewsUpdatesSection = dynamic(
  () => import('@/components/news/news-updates-section').then(mod => mod.NewsUpdatesSection),
  { 
    loading: () => <SkeletonLoader />,
    ssr: true 
  }
)
```

## Error Handling

### Parsing Errors
When `patchData.error` is present, the component displays an error fallback:

```tsx
<ErrorFallback 
  message={patchData.error} 
  locale={locale} 
/>
```

### Empty Data
When both arrays are empty, displays a friendly message:

```tsx
<div role="status" aria-live="polite">
  {locale === "th" ? "ไม่มีข้อมูลอัปเดต" : "No updates available"}
</div>
```

## Browser Support

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `react` - Core React library
- `framer-motion` - Animation library
- `lucide-react` - Icon library (AlertCircle)
- `@/components/news/known-issues-card` - Known issues card component
- `@/components/news/patch-notes-card` - Patch notes card component
- `@/lib/patch-data` - Type definitions
- `@/lib/utils` - Utility functions (cn)

## Related Components

- [`KnownIssuesCard`](./known-issues-card-README.md) - Displays known issues
- [`PatchNotesCard`](./patch-notes-card-README.md) - Displays patch notes
- [`UpdateCard`](../ui/update-card-README.md) - Base card component

## Examples

### Example 1: Homepage Section
```tsx
<section className="py-16 bg-slate-900">
  <div className="container mx-auto px-4">
    <h2 className="text-3xl font-bold text-white mb-8 text-center">
      Latest Updates
    </h2>
    <NewsUpdatesSection patchData={patchData} />
  </div>
</section>
```

### Example 2: Standalone Page
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
  <div className="container mx-auto px-4 py-12">
    <h1 className="text-4xl font-bold text-white mb-4">
      Game Updates
    </h1>
    <p className="text-gray-400 mb-8">
      Stay informed about the latest patches and known issues
    </p>
    <NewsUpdatesSection 
      patchData={patchData}
      maxVisibleUpdates={10}
    />
  </div>
</div>
```

### Example 3: With Custom Styling
```tsx
<NewsUpdatesSection
  patchData={patchData}
  className="max-w-6xl mx-auto"
  maxHeight="800px"
/>
```

## Troubleshooting

### Cards Not Animating
Ensure `framer-motion` is properly installed:
```bash
npm install framer-motion
```

### Layout Issues on Mobile
Check that Tailwind CSS is configured correctly and the responsive classes are working.

### Error State Not Showing
Verify that `patchData.error` is a non-empty string when errors occur.

## Future Enhancements

- [ ] Search and filter functionality
- [ ] Category filtering (fixes, optimizations, etc.)
- [ ] Notification system for new updates
- [ ] Historical archive view
- [ ] RSS feed integration
- [ ] Social sharing buttons

## License

Part of the game website project. See main project LICENSE for details.
