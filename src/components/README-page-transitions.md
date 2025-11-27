# Page Transition System

## Overview

The page transition system provides smooth fade and slide animations when navigating between pages, along with a loading progress bar at the top of the page during navigation.

## Components

### 1. NavigationProgress

A loading bar that appears at the top of the page during navigation, providing visual feedback that the page is loading.

**Features:**
- Gradient progress bar with glow effect
- Smooth animation from 0% to 100%
- Automatically triggered on route changes
- Simulates realistic loading progress
- Fades out when navigation completes

**Location:** `src/components/navigation-progress.tsx`

**Usage:**
```tsx
import { NavigationProgress } from '@/components/navigation-progress'

// Add to your layout
<NavigationProgress />
```

### 2. PageTransition

A wrapper component that provides fade and slide animations for page content during navigation.

**Features:**
- Fade in/out animation
- Slide up on enter, slide down on exit
- Smooth easing curves
- Automatic animation on route changes
- Uses Framer Motion's AnimatePresence for exit animations

**Location:** `src/components/page-transition.tsx`

**Usage:**
```tsx
import { PageTransition } from '@/components/page-transition'

// Wrap your page content
<PageTransition>
  {children}
</PageTransition>
```

### 3. PageTemplate

A reusable template component for consistent page transitions with staggered child animations.

**Features:**
- Container-level fade and slide animation
- Staggered child animations for sequential reveals
- Composable with PageTemplate.Item for granular control
- Customizable className support

**Location:** `src/components/page-template.tsx`

**Usage:**
```tsx
import { PageTemplate } from '@/components/page-template'

export default function MyPage() {
  return (
    <PageTemplate>
      <PageTemplate.Item>
        <h1>Page Title</h1>
      </PageTemplate.Item>
      
      <PageTemplate.Item>
        <p>This content will animate in after the title</p>
      </PageTemplate.Item>
      
      <PageTemplate.Item>
        <div>More content with staggered animation</div>
      </PageTemplate.Item>
    </PageTemplate>
  )
}
```

## Implementation Details

### Animation Timings

**Page Transitions:**
- Enter duration: 400ms
- Exit duration: 300ms
- Easing: Custom cubic-bezier curves for smooth motion

**Navigation Progress:**
- Simulated progress with random increments
- Completes after 500ms
- Fade out after 300ms

### Animation Variants

**PageTransition:**
```typescript
{
  initial: { opacity: 0, y: 20 },
  enter: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}
```

**PageTemplate:**
```typescript
{
  container: {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, staggerChildren: 0.1 }
  },
  item: {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  }
}
```

## Integration

The page transition system is integrated into the main layout:

```tsx
// src/components/layout/main-layout.tsx
export default function MainLayout({ children }) {
  return (
    <div className="min-h-screen bg-background">
      <NavigationProgress />
      <Header />
      <PageTransition>
        <div className="p-4 sm:p-6 lg:p-8">{children}</div>
      </PageTransition>
    </div>
  )
}
```

## Best Practices

### 1. Use PageTemplate for Complex Pages

For pages with multiple sections that should animate in sequence:

```tsx
export default function ComplexPage() {
  return (
    <PageTemplate className="space-y-8">
      <PageTemplate.Item>
        <HeroSection />
      </PageTemplate.Item>
      
      <PageTemplate.Item>
        <FeatureGrid />
      </PageTemplate.Item>
      
      <PageTemplate.Item>
        <StatsSection />
      </PageTemplate.Item>
    </PageTemplate>
  )
}
```

### 2. Simple Pages Don't Need Extra Wrapping

The PageTransition wrapper in the layout handles basic transitions automatically:

```tsx
export default function SimplePage() {
  return (
    <div>
      <h1>Simple Page</h1>
      <p>Content here will automatically transition</p>
    </div>
  )
}
```

### 3. Disable Transitions for Specific Routes

If needed, you can conditionally render the PageTransition:

```tsx
const noTransitionRoutes = ['/map', '/game']
const shouldTransition = !noTransitionRoutes.includes(pathname)

{shouldTransition ? (
  <PageTransition>{children}</PageTransition>
) : (
  children
)}
```

## Performance Considerations

1. **GPU Acceleration**: All animations use transform and opacity properties for optimal performance
2. **Reduced Motion**: Respects `prefers-reduced-motion` media query (handled by global CSS)
3. **Exit Animations**: Uses AnimatePresence with `mode="wait"` to prevent layout shifts
4. **Cleanup**: Properly cleans up timers and intervals in NavigationProgress

## Accessibility

- Animations respect user's motion preferences
- Loading bar provides visual feedback for navigation
- Smooth transitions don't interfere with screen readers
- Focus management is preserved during transitions

## Requirements Satisfied

- **Requirement 4.5**: Smooth page transitions when navigating between pages
- **Requirement 4.5**: Loading bar at top of page during navigation

## Browser Support

- Modern browsers with CSS transform and opacity support
- Framer Motion handles browser compatibility
- Graceful degradation for older browsers (instant transitions)

## Troubleshooting

### Transitions Not Working

1. Ensure Framer Motion is installed: `npm install framer-motion`
2. Check that components are client components (`"use client"`)
3. Verify pathname changes are triggering re-renders

### Progress Bar Not Showing

1. Check z-index conflicts (progress bar uses z-[200])
2. Ensure NavigationProgress is rendered in layout
3. Verify route changes are being detected

### Janky Animations

1. Check for heavy computations during render
2. Ensure images are optimized and lazy-loaded
3. Use Chrome DevTools Performance tab to identify bottlenecks
