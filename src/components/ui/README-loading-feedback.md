# Loading and Feedback Components

This document describes the newly implemented loading and feedback components for the UI/UX enhancement.

## Components

### 1. SkeletonLoader

A versatile skeleton loader component with multiple variants and smooth transitions.

**File:** `src/components/ui/skeleton-loader.tsx`

**Features:**
- ✅ Shimmer animation effect
- ✅ Multiple variants: card, list, text, avatar
- ✅ Configurable count prop for multiple skeletons
- ✅ Smooth fade-out transition when content loads
- ✅ Support for conditional loading with children

**Props:**
```typescript
interface SkeletonLoaderProps {
  variant: 'card' | 'list' | 'text' | 'avatar'
  count?: number
  className?: string
  isLoading?: boolean
  children?: React.ReactNode
}
```

**Usage Examples:**

```tsx
// Basic skeleton
<SkeletonLoader variant="card" count={3} />

// With content loading
<SkeletonLoader variant="list" isLoading={isLoading}>
  <YourContent />
</SkeletonLoader>
```

**Variants:**

1. **Card Variant** - Full card skeleton with image placeholder and text lines
2. **List Variant** - List item with avatar and text lines
3. **Text Variant** - Multiple text line placeholders
4. **Avatar Variant** - Avatar with name and subtitle placeholders

### 2. ProgressIndicator

A progress indicator component with linear and circular variants, featuring smooth animations and gradient fills.

**File:** `src/components/ui/progress-indicator.tsx`

**Features:**
- ✅ Linear and circular variants
- ✅ Smooth progress animation with spring physics
- ✅ Gradient fill for progress bar
- ✅ Animated percentage counter
- ✅ Configurable sizes (sm, md, lg)
- ✅ Optional label and percentage display
- ✅ Shimmer effect on linear progress

**Props:**
```typescript
interface ProgressIndicatorProps {
  progress: number
  label?: string
  variant?: 'linear' | 'circular'
  showPercentage?: boolean
  className?: string
  size?: 'sm' | 'md' | 'lg'
}
```

**Usage Examples:**

```tsx
// Linear progress
<ProgressIndicator 
  progress={75} 
  label="Upload Progress" 
  variant="linear"
  size="md"
/>

// Circular progress
<ProgressIndicator 
  progress={50} 
  variant="circular"
  size="lg"
  showPercentage={true}
/>
```

**Variants:**

1. **Linear** - Horizontal progress bar with gradient fill and shimmer effect
2. **Circular** - Circular progress ring with gradient stroke

**Sizes:**
- **sm** - Small (linear: h-2, circular: 60px)
- **md** - Medium (linear: h-3, circular: 80px)
- **lg** - Large (linear: h-4, circular: 120px)

## Demo

A comprehensive demo page is available at:
- **File:** `src/app/demo/loading-feedback/page.tsx`
- **Component:** `src/components/ui/loading-feedback-demo.tsx`

The demo showcases:
- All SkeletonLoader variants
- Content loading transitions
- Linear progress indicators in all sizes
- Circular progress indicators in all sizes
- Interactive controls to test functionality

## Requirements Satisfied

### Requirement 8.1 (SkeletonLoader)
✅ WHEN a user loads a page THEN the system SHALL display skeleton screens that match the final content layout

### Requirement 8.2 (ProgressIndicator)
✅ WHEN a user performs an action THEN the system SHALL show loading spinners or progress bars for operations taking more than 300ms

### Requirement 8.3 (ProgressIndicator)
✅ WHEN a user uploads images THEN the system SHALL display upload progress with percentage indicators

### Requirement 8.4 (SkeletonLoader)
✅ WHEN a user waits for content THEN the system SHALL show animated placeholders with shimmer effects

## Technical Implementation

### Animations
- Uses Framer Motion for smooth transitions and spring physics
- Shimmer effect implemented with CSS keyframes
- Smooth fade transitions between loading and content states
- Staggered animations for multiple skeleton items

### Styling
- Follows the enhanced Abyss theme color palette
- Uses gradient fills from primary to accent colors
- Consistent with existing UI component patterns
- Responsive and accessible

### Performance
- GPU-accelerated animations (transform, opacity)
- Efficient re-renders with React.memo patterns
- Smooth 60fps animations
- Optimized for mobile devices

## Integration

These components can be used throughout the application:

1. **Page Loading** - Use SkeletonLoader while fetching data
2. **File Uploads** - Use ProgressIndicator for upload progress
3. **Form Submissions** - Use ProgressIndicator for processing
4. **Image Loading** - Use SkeletonLoader for image placeholders
5. **List Loading** - Use SkeletonLoader list variant for dynamic lists

## Next Steps

These components are ready to be integrated into:
- Build list pages (my-builds, tier-list)
- Image upload flows (build creation)
- Map loading states
- Material guide loading
- Any async data fetching scenarios
