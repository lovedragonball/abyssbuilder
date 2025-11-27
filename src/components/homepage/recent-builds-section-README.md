# Recent Builds Section Component

## Overview

The `RecentBuildsSection` component displays a grid of recent or featured character builds on the homepage. It fetches builds from localStorage, displays them using the `BuildCard` component, and provides a call-to-action button to view all builds.

## Features

- **Dynamic Data Loading**: Fetches builds from localStorage
- **Responsive Grid Layout**: Adapts from 1 column (mobile) to 4 columns (desktop)
- **Loading States**: Shows skeleton loaders while data is being fetched
- **Empty State**: Displays a helpful empty state when no builds exist
- **Smooth Animations**: Staggered fade-in animations for build cards
- **View All CTA**: Prominent button linking to the full builds page
- **Configurable**: Customizable title, subtitle, and number of builds to display

## Usage

### Basic Usage

```tsx
import { RecentBuildsSection } from '@/components/homepage/recent-builds-section';

export default function HomePage() {
  return (
    <div>
      <RecentBuildsSection />
    </div>
  );
}
```

### With Custom Props

```tsx
<RecentBuildsSection
  title="Featured Builds"
  subtitle="Discover the most popular character builds"
  maxBuilds={6}
  showFeatured={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | `"Recent Builds"` | Section heading text |
| `subtitle` | `string` | `"Check out the latest character builds from the community"` | Section description text |
| `maxBuilds` | `number` | `4` | Maximum number of builds to display |
| `showFeatured` | `boolean` | `false` | Whether to show sparkle icons for featured builds |

## Data Structure

The component expects builds to be stored in localStorage under the key `'builds'` with the following structure:

```typescript
interface Build {
  id: string;
  buildName: string;
  description?: string;
  itemName: string;
  itemImage: string;
  itemType: string;
  createdAt: string;
  updatedAt: string;
  mods?: (string | null)[];
  primeMod?: string | null;
  [key: string]: any;
}
```

## States

### Loading State
- Displays skeleton loaders matching the grid layout
- Shows while data is being fetched from localStorage

### Empty State
- Displays when no builds exist in localStorage
- Shows an `EmptyState` component with:
  - Sparkles icon
  - "No Builds Yet" title
  - Helpful description
  - "Create Your First Build" CTA button

### Populated State
- Displays build cards in a responsive grid
- Shows "View All Builds" CTA button at the bottom

## Responsive Behavior

| Breakpoint | Columns | Gap |
|------------|---------|-----|
| Mobile (< 640px) | 1 | 16px |
| Small (640px - 1024px) | 2 | 16px |
| Large (1024px - 1280px) | 3 | 24px |
| XL (≥ 1280px) | 4 | 24px |

## Animations

### Section Header
- Fade in from bottom with 0.5s duration
- Triggers when section enters viewport

### Build Cards
- Staggered fade-in animation
- Each card delays by 0.1s * index
- Smooth entrance effect

### CTA Button
- Fade in from bottom
- 0.3s delay after cards
- Hover effect with arrow translation

## Integration with BuildCard

The component uses the `BuildCard` component to display each build with:
- Character thumbnail with gradient overlay
- Build name and character name
- Item type badge
- Mod count stat (if available)
- Hover actions (view, edit, delete)
- Bookmark functionality

## Click Behavior

When a build card is clicked (via `onView`), the user is navigated to:
```
/create?buildId={buildId}
```

This allows users to view and edit the build details.

## Accessibility

- Semantic HTML structure with `<section>` element
- Proper heading hierarchy (h2 for section title)
- Keyboard-navigable CTA button
- Touch-friendly targets (min 44x44px)
- Screen reader-friendly empty state

## Performance Considerations

1. **Lazy Loading**: Build card images use lazy loading
2. **Viewport Animations**: Animations only trigger when section is in view
3. **Limited Data**: Only loads specified number of builds (default: 4)
4. **Optimized Sorting**: Sorts builds by date in-memory

## Error Handling

- Gracefully handles localStorage errors
- Falls back to empty state if data parsing fails
- Console logs errors for debugging

## Styling

The component uses:
- Tailwind CSS utility classes
- Gradient text effects for headings
- Consistent spacing with design system
- Responsive padding and margins

## Requirements Satisfied

This component satisfies the following requirements from the spec:

- **Requirement 1.4**: Display "Recent Builds" or "Featured Builds" section on homepage
- **Requirement 5.1**: Display build cards with consistent styling and visual hierarchy

## Future Enhancements

Potential improvements for future iterations:

1. **Server-Side Data**: Fetch builds from API instead of localStorage
2. **Filtering**: Add ability to filter by character or build type
3. **Sorting Options**: Allow users to sort by date, popularity, or rating
4. **Pagination**: Load more builds on demand
5. **Featured Flag**: Support marking specific builds as "featured"
6. **User Ratings**: Display community ratings on build cards
7. **Share Functionality**: Add social sharing buttons
8. **Build Categories**: Group builds by character class or playstyle

## Testing

To test the component:

1. **With Builds**: Create some builds in the app and verify they appear
2. **Without Builds**: Clear localStorage and verify empty state appears
3. **Loading State**: Throttle network to see skeleton loaders
4. **Responsive**: Test on different screen sizes
5. **Animations**: Verify smooth entrance animations
6. **Navigation**: Click "View All Builds" and verify navigation works
7. **Build Cards**: Click individual builds and verify navigation to edit page

## Example Implementation

See `src/app/page.tsx` for the complete implementation:

```tsx
<RecentBuildsSection
  title="Recent Builds"
  subtitle="Check out the latest character builds from the community"
  maxBuilds={4}
  showFeatured={false}
/>
```
