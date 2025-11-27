# KnownIssuesCard Component

A React component that displays a list of known game issues in an attractive card layout with term highlighting and hover effects.

## Features

- ✧ **Icon-based List**: Each issue is displayed with a distinctive ✧ icon
- 🎨 **Term Highlighting**: Automatically highlights bracketed terms (e.g., `[Longbow: Embla Inflorescence]`) in cyan
- 🌐 **i18n Support**: Built-in support for English and Thai languages
- ♿ **Accessible**: Full ARIA support with proper roles and labels
- 🎭 **Smooth Animations**: Hover effects with framer-motion
- 📱 **Responsive**: Works seamlessly on all screen sizes
- 📜 **Scrollable**: Custom-styled scrollbar for long lists

## Usage

### Basic Usage

```tsx
import { KnownIssuesCard } from "@/components/news/known-issues-card"
import { KnownIssue } from "@/lib/patch-data"

const issues: KnownIssue[] = [
  {
    id: 'issue-1',
    description: 'Using the [Longbow: Embla Inflorescence] may cause issues.',
    highlightedTerms: ['Longbow: Embla Inflorescence'],
  },
  // ... more issues
]

export default function MyPage() {
  return <KnownIssuesCard issues={issues} />
}
```

### With Thai Language

```tsx
<KnownIssuesCard issues={issues} locale="th" />
```

### Custom Max Height

```tsx
<KnownIssuesCard issues={issues} maxHeight="400px" />
```

### With Custom Styling

```tsx
<KnownIssuesCard 
  issues={issues} 
  className="shadow-2xl"
  maxHeight="500px"
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `issues` | `KnownIssue[]` | **Required** | Array of known issues to display |
| `maxHeight` | `string` | `"600px"` | Maximum height of the card content area |
| `className` | `string` | `undefined` | Additional CSS classes for the card |
| `locale` | `string` | `"en"` | Language locale (`"en"` or `"th"`) |

## KnownIssue Type

```typescript
interface KnownIssue {
  id: string                    // Unique identifier
  description: string           // Full issue description
  highlightedTerms: string[]    // Terms to highlight (without brackets)
}
```

## Styling

The component uses Tailwind CSS classes and can be customized through:

1. **Custom Classes**: Pass additional classes via the `className` prop
2. **CSS Variables**: Override the default colors in your global CSS
3. **Tailwind Config**: Extend the theme in `tailwind.config.ts`

### Key CSS Classes

- `.update-card` - Main card container
- `.card-header` - Card header section
- `.card-content` - Scrollable content area
- `.update-item` - Individual issue item
- `.item-icon` - The ✧ icon
- `.item-description` - Issue description text
- `.highlighted-term` - Highlighted bracketed terms
- `.custom-scrollbar` - Custom scrollbar styling

## Accessibility

The component follows WCAG 2.1 AA standards:

- **ARIA Roles**: `region`, `list`, `listitem`
- **ARIA Labels**: Descriptive labels for screen readers
- **Keyboard Navigation**: Full keyboard support
- **Color Contrast**: Meets WCAG AA requirements
- **Focus Indicators**: Clear focus states for interactive elements

### Screen Reader Support

```html
<div role="region" aria-label="Known Issues (Still Unresolved)">
  <div role="list" aria-label="List of known issues">
    <div role="listitem">
      <span aria-hidden="true">✧</span>
      <p>Issue description...</p>
    </div>
  </div>
</div>
```

## Animations

The component uses framer-motion for smooth animations:

- **Card Entry**: Fade and slide up on mount
- **Item Hover**: Translate right and background color change
- **Smooth Transitions**: 200ms ease-in-out timing

### Animation Variants

```typescript
// Item hover animation
initial={{ x: 0, backgroundColor: "rgba(255, 255, 255, 0.03)" }}
whileHover={{ x: 4, backgroundColor: "rgba(255, 255, 255, 0.08)" }}
transition={{ duration: 0.2, ease: "easeInOut" }}
```

## Internationalization

### Supported Languages

- **English** (`en`): Default language
- **Thai** (`th`): Full Thai language support

### Adding New Languages

To add a new language, update the `translations` object in the component:

```typescript
const translations = {
  en: {
    title: "Known Issues (Still Unresolved)",
    empty: "No known issues at this time"
  },
  th: {
    title: "ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)",
    empty: "ไม่มีปัญหาที่ทราบในขณะนี้"
  },
  // Add your language here
  fr: {
    title: "Problèmes connus (non résolus)",
    empty: "Aucun problème connu pour le moment"
  }
}
```

## Term Highlighting

The component automatically highlights terms enclosed in square brackets:

### Input
```typescript
{
  description: "Using [Longbow: Embla Inflorescence] may cause issues.",
  highlightedTerms: ['Longbow: Embla Inflorescence']
}
```

### Output
```
Using [Longbow: Embla Inflorescence] may cause issues.
       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^
       (highlighted in cyan)
```

### Highlighting Logic

The `highlightTerms` function uses regex to find and wrap bracketed terms:

```typescript
const pattern = /\[([^\]]+)\]/g
// Matches: [Term], [Term: Subterm], [Any: Text: Here]
```

## Empty State

When no issues are provided, the component displays a friendly empty state:

```tsx
<KnownIssuesCard issues={[]} />
// Displays: "No known issues at this time"
```

## Performance

- **React.memo**: IssueItem component is memoized to prevent unnecessary re-renders
- **Efficient Rendering**: Only visible items are affected by scroll
- **Optimized Animations**: Uses CSS transforms for better performance

## Testing

The component includes comprehensive tests covering:

- ✅ Rendering with different props
- ✅ Term highlighting functionality
- ✅ Accessibility features
- ✅ Internationalization
- ✅ Edge cases and error handling

### Running Tests

```bash
npm test -- src/components/news/__tests__/known-issues-card.test.tsx
```

## Demo

View the component in action:

```bash
npm run dev
# Navigate to: http://localhost:3000/demo/known-issues-card
```

## Examples

### With Real Data

```tsx
import { getPatchData } from "@/lib/patch-parser"

export default async function NewsPage() {
  const patchData = await getPatchData()
  
  return (
    <div className="container mx-auto p-8">
      <KnownIssuesCard issues={patchData.knownIssues} />
    </div>
  )
}
```

### Side-by-Side Comparison

```tsx
<div className="grid grid-cols-2 gap-4">
  <KnownIssuesCard issues={issues} locale="en" />
  <KnownIssuesCard issues={issues} locale="th" />
</div>
```

### Compact Version

```tsx
<KnownIssuesCard 
  issues={issues.slice(0, 3)} 
  maxHeight="300px"
  className="max-w-md"
/>
```

## Browser Support

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- `react` - Core React library
- `framer-motion` - Animation library
- `@/lib/patch-data` - Type definitions
- `@/components/ui/update-card` - Base card component
- `@/lib/utils` - Utility functions (cn)

## Related Components

- `UpdateCard` - Base card component
- `PatchNotesCard` - Companion component for patch notes
- `NewsUpdatesSection` - Parent section component

## Troubleshooting

### Issue: Terms not highlighting

**Solution**: Ensure `highlightedTerms` array contains the exact text without brackets:

```typescript
// ❌ Wrong
highlightedTerms: ['[Longbow]']

// ✅ Correct
highlightedTerms: ['Longbow']
```

### Issue: Scrollbar not visible

**Solution**: Ensure content exceeds `maxHeight`:

```tsx
<KnownIssuesCard 
  issues={manyIssues}  // Need enough items
  maxHeight="400px"    // Set appropriate height
/>
```

### Issue: Hover effects not working

**Solution**: Ensure framer-motion is installed:

```bash
npm install framer-motion
```

## Contributing

When contributing to this component:

1. Maintain accessibility standards
2. Add tests for new features
3. Update this README
4. Follow the existing code style
5. Test with screen readers

## License

Part of the AbyssBuilder project.
