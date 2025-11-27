# PatchNotesCard Component

A React component that displays game patch notes grouped by date in an attractive card layout with social media-inspired styling.

## Features

- ✦ **Date Grouping**: Patch notes are organized by date with clear headers
- 🎨 **Highlighted Terms**: Automatically highlights bracketed terms (e.g., `[Eclosion]`)
- 🎭 **Smooth Animations**: Hover effects and transitions using Framer Motion
- 📜 **Scrollable Content**: Maximum height constraint with custom scrollbar styling
- 🔽 **Show More Button**: Expandable view for viewing additional updates
- 🌐 **i18n Support**: Built-in English and Thai language support
- ♿ **Accessible**: Proper ARIA labels, semantic HTML, and keyboard navigation
- 📱 **Responsive**: Works seamlessly on all screen sizes

## Usage

### Basic Usage

```tsx
import { PatchNotesCard } from '@/components/news/patch-notes-card'
import { UpdateGroup } from '@/lib/patch-data'

const updates: UpdateGroup[] = [
  {
    date: '2025-11-22',
    displayDate: 'Update Details - 2025-11-22',
    notes: [
      {
        id: 'fix-1',
        description: 'Fixed an issue where the [Eclosion] effect would not apply immediately.',
        highlightedTerms: ['Eclosion'],
        type: 'fix',
      },
    ],
  },
]

function MyComponent() {
  return <PatchNotesCard updates={updates} />
}
```

### With Custom Options

```tsx
<PatchNotesCard
  updates={updates}
  maxHeight="800px"
  maxVisibleUpdates={10}
  showMoreButton={true}
  locale="th"
  className="custom-class"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `updates` | `UpdateGroup[]` | **Required** | Array of update groups with patch notes |
| `maxHeight` | `string` | `"600px"` | Maximum height of the scrollable content area |
| `className` | `string` | `undefined` | Additional CSS classes to apply |
| `locale` | `"en" \| "th"` | `"en"` | Language for UI text |
| `maxVisibleUpdates` | `number` | `5` | Number of update groups to show initially |
| `showMoreButton` | `boolean` | `true` | Whether to show the "Show More" button |

## Data Structure

### UpdateGroup

```typescript
interface UpdateGroup {
  date: string              // e.g., "2025-11-22"
  displayDate: string       // e.g., "Update Details - 2025-11-22"
  notes: PatchNote[]
}
```

### PatchNote

```typescript
interface PatchNote {
  id: string
  description: string
  highlightedTerms: string[]
  type: 'fix' | 'optimization' | 'other'
}
```

## Styling

The component uses Tailwind CSS classes and follows the design system:

- **Card Background**: Dark gradient with subtle transparency
- **Hover Effects**: Smooth elevation and translation animations
- **Icons**: ✦ symbol for each patch note
- **Highlighted Terms**: Cyan background with rounded corners
- **Date Headers**: Yellow text with bottom border
- **Scrollbar**: Custom styled to match the dark theme

### CSS Classes

Key classes used:
- `.update-item` - Individual patch note item
- `.item-icon` - Icon container (✦)
- `.item-description` - Note description text
- `.highlighted-term` - Bracketed terms styling
- `.date-header` - Date group header

## Accessibility

The component follows WCAG 2.1 AA standards:

- **Semantic HTML**: Uses proper heading hierarchy (h3 for date headers)
- **ARIA Labels**: Region and list roles with descriptive labels
- **Keyboard Navigation**: Fully keyboard accessible
- **Screen Readers**: Proper announcement of content structure
- **Focus Indicators**: Visible focus states for interactive elements

### ARIA Attributes

```tsx
<div role="region" aria-label="Patch Notes (Bug Fixes and Improvements)">
  <div role="list" aria-label="List of patch notes grouped by date">
    <div role="listitem">...</div>
  </div>
</div>
```

## Internationalization

### Supported Languages

- **English (en)**: Default language
- **Thai (th)**: Full translation support

### Translation Keys

```typescript
{
  title: "Patch Notes (Bug Fixes and Improvements)",
  empty: "No recent updates",
  showMore: "Show More",
  showLess: "Show Less"
}
```

### Adding New Languages

To add a new language, update the `translations` object in the component:

```typescript
const translations = {
  en: { /* ... */ },
  th: { /* ... */ },
  ja: {
    title: "パッチノート（バグ修正と改善）",
    empty: "最近の更新はありません",
    showMore: "もっと見る",
    showLess: "少なく表示"
  }
}
```

## Examples

### Empty State

```tsx
<PatchNotesCard updates={[]} />
// Displays: "No recent updates"
```

### Thai Language

```tsx
<PatchNotesCard updates={updates} locale="th" />
// Title: "บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)"
```

### Without Show More Button

```tsx
<PatchNotesCard 
  updates={updates} 
  showMoreButton={false}
  maxVisibleUpdates={10}
/>
```

### Custom Height

```tsx
<PatchNotesCard 
  updates={updates} 
  maxHeight="400px"
/>
```

## Performance

The component is optimized for performance:

- **React.memo**: Individual items are memoized to prevent unnecessary re-renders
- **Framer Motion**: Animations use GPU-accelerated transforms
- **Lazy Rendering**: Only visible items are rendered initially
- **Efficient Updates**: State changes only affect necessary components

## Testing

The component includes comprehensive tests:

```bash
npm test patch-notes-card.test.tsx
```

Test coverage includes:
- Rendering with various props
- Date grouping and ordering
- Patch note item rendering
- Term highlighting
- Show More/Less functionality
- Accessibility features
- Edge cases and error handling

## Demo

View the interactive demo at `/demo/patch-notes-card` to see:
- Language switching (English/Thai)
- Adjustable max visible updates
- Show More button toggle
- Empty state
- Single update display

## Related Components

- **KnownIssuesCard**: Companion component for displaying known issues
- **UpdateCard**: Base card component used for layout
- **NewsUpdatesSection**: Parent component that combines both cards

## Browser Support

- Chrome/Edge: ✓ Full support
- Firefox: ✓ Full support
- Safari: ✓ Full support
- Mobile browsers: ✓ Full support

## Dependencies

- `react`: ^18.0.0
- `framer-motion`: ^10.0.0
- `@/components/ui/update-card`: Base card component
- `@/components/ui/button`: Button component
- `@/lib/patch-data`: Type definitions
- `@/lib/utils`: Utility functions (cn)

## Changelog

### Version 1.0.0
- Initial release
- Date grouping functionality
- Term highlighting
- Show More/Less button
- Thai language support
- Full accessibility support
- Comprehensive test coverage

## License

Part of the game website project.
