# UpdateCard Component

A reusable card component designed for the News & Updates section with gradient backgrounds, hover effects, and custom scrollbar styling.

## Features

- **Gradient Background**: Beautiful gradient from `#1a1a2e` to `#16213e`
- **Hover Effects**: Smooth elevation animation with enhanced shadows
- **Custom Scrollbar**: Styled scrollbar for content areas
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper semantic HTML structure
- **Flexible**: Can be used with or without title, custom max height, and scrollbar options

## Components

### UpdateCard

The main card wrapper component with all styling and animations.

```tsx
<UpdateCard 
  title="Card Title"
  maxHeight="600px"
  showScrollbar={true}
  className="custom-class"
>
  {children}
</UpdateCard>
```

**Props:**
- `title?: string` - Optional title displayed in the card header
- `maxHeight?: string` - Maximum height for scrollable content (default: "600px")
- `showScrollbar?: boolean` - Show custom scrollbar styling (default: true)
- `className?: string` - Additional CSS classes
- All standard div props from framer-motion

### UpdateCardHeader

Standalone header component for more control.

```tsx
<UpdateCardHeader className="custom-class">
  {children}
</UpdateCardHeader>
```

### UpdateCardTitle

Semantic h2 heading for card titles.

```tsx
<UpdateCardTitle className="custom-class">
  Title Text
</UpdateCardTitle>
```

### UpdateCardContent

Scrollable content area with custom scrollbar.

```tsx
<UpdateCardContent 
  maxHeight="500px"
  showScrollbar={true}
  className="custom-class"
>
  {children}
</UpdateCardContent>
```

## Usage Examples

### Basic Card with Title

```tsx
import { UpdateCard } from '@/components/ui/update-card';

<UpdateCard title="Known Issues">
  <div className="space-y-2">
    <p>Issue 1</p>
    <p>Issue 2</p>
  </div>
</UpdateCard>
```

### Card with Custom Max Height

```tsx
<UpdateCard title="Patch Notes" maxHeight="400px">
  <div className="space-y-2">
    {/* Long list of items */}
  </div>
</UpdateCard>
```

### Composed Card with Individual Components

```tsx
import { 
  UpdateCard, 
  UpdateCardHeader, 
  UpdateCardTitle, 
  UpdateCardContent 
} from '@/components/ui/update-card';

<UpdateCard>
  <UpdateCardHeader>
    <UpdateCardTitle>Custom Title</UpdateCardTitle>
    <p className="text-sm text-gray-400">Subtitle or description</p>
  </UpdateCardHeader>
  <UpdateCardContent maxHeight="500px">
    {/* Content */}
  </UpdateCardContent>
</UpdateCard>
```

### Two Column Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <UpdateCard title="Known Issues">
    {/* Issues content */}
  </UpdateCard>
  
  <UpdateCard title="Patch Notes">
    {/* Patch notes content */}
  </UpdateCard>
</div>
```

## Styling

### Card Styles

The card includes:
- Gradient background: `from-[#1a1a2e] to-[#16213e]`
- Rounded corners: `rounded-2xl`
- Border: `border border-white/10`
- Shadow: `shadow-[0_4px_6px_rgba(0,0,0,0.1)]`
- Hover shadow: `shadow-[0_12px_24px_rgba(0,0,0,0.2)]`
- Hover lift: `-translate-y-1`
- Smooth transitions: `transition-all duration-300`

### Custom Scrollbar

The custom scrollbar is styled with:
- Width: 6px
- Track: `rgba(255, 255, 255, 0.05)`
- Thumb: `rgba(255, 255, 255, 0.2)`
- Hover thumb: `rgba(255, 255, 255, 0.3)`
- Rounded corners: 3px

### Animations

Entry animation using framer-motion:
```tsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.5, ease: "easeOut" }}
```

## Accessibility

- Uses semantic HTML (`h2` for titles)
- Proper heading hierarchy
- Keyboard accessible scrolling
- Focus indicators (inherited from global styles)
- Screen reader friendly

## Requirements Met

This component satisfies the following requirements from the design document:

- **2.4**: Rounded corners, shadows, and hover effects
- **2.5**: Subtle elevation animation on hover
- **2.6**: Consistent spacing and alignment
- **2.7**: Smooth scrolling within the card
- **5.1**: Smooth elevation animation on hover
- **5.6**: Uses website's color scheme and design system

## Testing

Comprehensive tests are available in `src/components/ui/__tests__/update-card.test.tsx`:

- Rendering tests
- Styling verification
- Props handling
- Accessibility checks
- Integration tests

Run tests:
```bash
npm test -- src/components/ui/__tests__/update-card.test.tsx
```

## Demo

View the component demo at `/demo/update-card` to see:
- Basic card with title
- Scrollable content
- Hover effects
- Two-column layout
- Composed components

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Custom scrollbar works in WebKit browsers and Firefox

## Performance

- Uses CSS transforms for animations (GPU accelerated)
- Framer-motion for smooth entry animations
- Optimized for 60fps hover effects
- Minimal re-renders with React.forwardRef

## Related Components

- `EnhancedCard` - General purpose card component
- `KnownIssuesCard` - Specific implementation for known issues
- `PatchNotesCard` - Specific implementation for patch notes
