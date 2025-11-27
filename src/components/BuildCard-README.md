# BuildCard Component

A specialized card component for displaying game builds with enhanced visual design, animations, and interactive features.

## Features

- ✅ Enhanced visual design with glassmorphism and gradients
- ✅ Smooth hover animations and lift effects
- ✅ Checkbox selection for bulk operations
- ✅ Hover-reveal action buttons (view, edit, delete)
- ✅ Bookmark/favorite functionality
- ✅ Stat badges display
- ✅ Lazy loading images with blur placeholders
- ✅ Responsive design with proper touch targets
- ✅ Accessibility compliant (WCAG AA)

## Usage

### Basic Usage

```tsx
import { BuildCard } from '@/components/BuildCard';

<BuildCard
  id="build-123"
  buildName="My Awesome Build"
  description="A powerful DPS build for endgame content"
  itemName="Character Name"
  itemImage="/images/character.jpg"
  itemType="character"
  createdAt="2024-01-15T10:30:00Z"
  updatedAt="2024-01-20T15:45:00Z"
  onView={(id) => console.log('View:', id)}
  onEdit={(id) => console.log('Edit:', id)}
  onDelete={(id) => console.log('Delete:', id)}
/>
```

### With Selection (Bulk Operations)

```tsx
const [selectedBuilds, setSelectedBuilds] = useState<Set<string>>(new Set());

const handleSelect = (id: string, checked: boolean) => {
  const newSelected = new Set(selectedBuilds);
  if (checked) {
    newSelected.add(id);
  } else {
    newSelected.delete(id);
  }
  setSelectedBuilds(newSelected);
};

<BuildCard
  id="build-123"
  buildName="My Build"
  // ... other props
  isSelected={selectedBuilds.has('build-123')}
  showCheckbox={true}
  onSelect={handleSelect}
/>
```

### With Stat Badges

```tsx
import { Sword, Shield, Zap } from 'lucide-react';

<BuildCard
  id="build-123"
  buildName="My Build"
  // ... other props
  stats={[
    { label: 'Attack', value: '2500', icon: <Sword /> },
    { label: 'Defense', value: '1800', icon: <Shield /> },
    { label: 'Energy', value: '95%', icon: <Zap /> }
  ]}
/>
```

### With Bookmark

```tsx
const [bookmarkedBuilds, setBookmarkedBuilds] = useState<Set<string>>(new Set());

const handleBookmark = (id: string) => {
  const newBookmarked = new Set(bookmarkedBuilds);
  if (newBookmarked.has(id)) {
    newBookmarked.delete(id);
  } else {
    newBookmarked.add(id);
  }
  setBookmarkedBuilds(newBookmarked);
};

<BuildCard
  id="build-123"
  buildName="My Build"
  // ... other props
  isBookmarked={bookmarkedBuilds.has('build-123')}
  onBookmark={handleBookmark}
/>
```

## Props

### Required Props

| Prop | Type | Description |
|------|------|-------------|
| `id` | `string` | Unique identifier for the build |
| `buildName` | `string` | Name of the build |
| `itemName` | `string` | Name of the character/weapon |
| `itemImage` | `string` | Path to the character/weapon image |
| `itemType` | `string` | Type of item (e.g., "character", "weapon") |
| `createdAt` | `string` | ISO date string of creation |
| `updatedAt` | `string` | ISO date string of last update |

### Optional Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `undefined` | Build description |
| `stats` | `Array<StatBadge>` | `[]` | Array of stat badges to display |
| `isBookmarked` | `boolean` | `false` | Whether the build is bookmarked |
| `isSelected` | `boolean` | `false` | Whether the build is selected |
| `showCheckbox` | `boolean` | `false` | Show selection checkbox |
| `onView` | `(id: string) => void` | `undefined` | View button callback |
| `onEdit` | `(id: string) => void` | `undefined` | Edit button callback |
| `onDelete` | `(id: string) => void` | `undefined` | Delete button callback |
| `onBookmark` | `(id: string) => void` | `undefined` | Bookmark button callback |
| `onSelect` | `(id: string, checked: boolean) => void` | `undefined` | Selection callback |
| `className` | `string` | `undefined` | Additional CSS classes |

### StatBadge Type

```typescript
interface StatBadge {
  label: string;           // Stat name (shown in tooltip)
  value: string | number;  // Stat value (shown in badge)
  icon?: React.ReactNode;  // Optional icon
}
```

## Behavior

### Hover Effects

- **Image**: Zooms in (scale-110) on hover
- **Card**: Lifts up with enhanced shadow
- **Actions**: Reveal overlay with action buttons
- **Stat Badges**: Scale up slightly on hover

### Click Behavior

- **Card Click**: Triggers `onView` callback
- **Checkbox**: Triggers `onSelect` callback (stops propagation)
- **Bookmark**: Triggers `onBookmark` callback (stops propagation)
- **Action Buttons**: Trigger respective callbacks (stop propagation)

### Selection State

When `isSelected` is true:
- Primary border color
- Ring effect (ring-2 ring-primary/20)
- Smooth transition

### Responsive Behavior

- **Mobile (< 640px)**:
  - Touch targets: 44x44px minimum
  - Larger text and spacing
  - Single column grid recommended

- **Tablet (640px - 1024px)**:
  - Touch targets: 44x44px minimum
  - Two column grid recommended

- **Desktop (> 1024px)**:
  - Standard touch targets
  - Three column grid recommended

## Accessibility

### Keyboard Navigation

- Tab through interactive elements
- Enter/Space to activate buttons
- Checkbox follows standard keyboard behavior

### Screen Readers

- All buttons have proper ARIA labels
- Images have descriptive alt text
- Tooltips provide additional context

### Touch Targets

- All interactive elements meet WCAG guidelines
- Minimum 44x44px on mobile devices
- Adequate spacing between targets

### Color Contrast

- All text meets WCAG AA standards (4.5:1)
- Focus indicators are clearly visible
- Selection state has sufficient contrast

## Performance

### Image Optimization

- Uses Next.js Image component
- Lazy loading enabled
- Blur placeholder for better perceived performance
- Responsive image sizes

### Animation Performance

- GPU-accelerated properties (transform, opacity)
- Smooth 60fps animations
- Reduced motion support (respects user preferences)

### Re-render Optimization

- Memoized callbacks recommended
- Proper key usage in lists
- Minimal re-renders on state changes

## Examples

### Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {builds.map((build) => (
    <BuildCard
      key={build.id}
      {...build}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  ))}
</div>
```

### With Loading State

```tsx
{isLoading ? (
  <SkeletonLoader variant="card" count={6} />
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {builds.map((build) => (
      <BuildCard key={build.id} {...build} />
    ))}
  </div>
)}
```

### With Empty State

```tsx
{builds.length === 0 ? (
  <EmptyState
    title="No builds yet"
    description="Create your first build to get started!"
    action={{
      label: "Create Build",
      onClick: () => router.push('/create')
    }}
  />
) : (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {builds.map((build) => (
      <BuildCard key={build.id} {...build} />
    ))}
  </div>
)}
```

## Styling

### Custom Styling

You can add custom classes via the `className` prop:

```tsx
<BuildCard
  {...props}
  className="custom-class"
/>
```

### Theme Integration

The component uses CSS custom properties from the design system:
- `--primary-*`: Primary color scale
- `--accent-*`: Accent color scale
- `--background-*`: Background colors
- `--shadow-*`: Shadow definitions

## Best Practices

1. **Always provide unique `id`**: Required for proper selection and callbacks
2. **Use memoized callbacks**: Prevents unnecessary re-renders
3. **Provide all required props**: Ensures proper display
4. **Use proper grid layout**: Responsive grid for different screen sizes
5. **Handle loading states**: Show skeleton loaders while loading
6. **Handle empty states**: Show empty state when no builds
7. **Optimize images**: Use appropriate image sizes and formats
8. **Test accessibility**: Verify keyboard navigation and screen readers

## Related Components

- `EnhancedCard`: Base card component with variants
- `EmptyState`: Empty state component for no builds
- `SkeletonLoader`: Loading state component
- `Button`: Button component used for actions
- `Checkbox`: Checkbox component for selection

## Migration Guide

### From Old Card Component

**Before:**
```tsx
<Card>
  <div className="relative aspect-video">
    <Checkbox />
    <Image src={image} alt={name} />
    <div className="gradient" />
    <div className="info">
      <h3>{name}</h3>
    </div>
  </div>
  <CardContent>
    <p>{description}</p>
    <Button onClick={handleEdit}>Edit</Button>
    <Button onClick={handleDelete}>Delete</Button>
  </CardContent>
</Card>
```

**After:**
```tsx
<BuildCard
  id={id}
  buildName={name}
  description={description}
  itemName={itemName}
  itemImage={image}
  itemType={type}
  createdAt={createdAt}
  updatedAt={updatedAt}
  onEdit={handleEdit}
  onDelete={handleDelete}
/>
```

## Troubleshooting

### Images not loading
- Verify image path is correct
- Check Next.js Image configuration
- Ensure images are in public directory or properly imported

### Animations not smooth
- Check if GPU acceleration is enabled
- Verify no heavy operations during animations
- Test on different devices

### Selection not working
- Ensure `showCheckbox` is true
- Verify `onSelect` callback is provided
- Check if `isSelected` state is properly managed

### Touch targets too small on mobile
- Component automatically handles touch target sizes
- Verify viewport meta tag is set correctly
- Test on actual mobile devices

## Support

For issues or questions:
1. Check this documentation
2. Review the component source code
3. Check the design system documentation
4. Review related components documentation
