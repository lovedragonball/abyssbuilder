# PageTransition Component - Configuration Guide

## Overview

The `PageTransition` component provides smooth, configurable page transitions with built-in accessibility support and fallback mechanisms. It wraps page content with animations powered by Framer Motion.

## Features

- ✅ **Configurable Animations**: Enable/disable animations or customize duration
- ✅ **Accessibility First**: Respects `prefers-reduced-motion` media query
- ✅ **Fallback Mechanism**: Ensures content always renders even if animations fail
- ✅ **Custom Variants**: Support for custom animation variants
- ✅ **TypeScript Support**: Fully typed with clear interfaces
- ✅ **Performance Optimized**: Uses GPU-accelerated properties (opacity, transform)

## Installation

The component is already included in the project. Import it from:

```tsx
import { PageTransition, PageTransitionConfig } from '@/components/page-transition';
```

## Basic Usage

### Default Configuration

```tsx
<PageTransition>
  {children}
</PageTransition>
```

This uses the default configuration:
- Animation enabled
- 1000ms fallback delay
- 0.4s animation duration
- Smooth easing curves

### With Custom Configuration

```tsx
<PageTransition config={{ 
  enableAnimation: true, 
  fallbackDelay: 1500,
  duration: 0.6 
}}>
  {children}
</PageTransition>
```

## Configuration Options

### `PageTransitionConfig` Interface

```typescript
interface PageTransitionConfig {
  /** Enable or disable animations (default: true) */
  enableAnimation?: boolean;
  
  /** Fallback delay in milliseconds before forcing render (default: 1000) */
  fallbackDelay?: number;
  
  /** Animation duration in seconds (default: 0.4) */
  duration?: number;
  
  /** Custom animation variants (optional) */
  variants?: Variants;
}
```

### Option Details

#### `enableAnimation`
- **Type**: `boolean`
- **Default**: `true`
- **Description**: Controls whether animations are enabled. When `false`, content renders immediately without animation.

```tsx
// Disable animations
<PageTransition config={{ enableAnimation: false }}>
  {children}
</PageTransition>
```

#### `fallbackDelay`
- **Type**: `number` (milliseconds)
- **Default**: `1000`
- **Description**: Maximum time to wait for animation completion before forcing render. Prevents content from being stuck if animation fails.

```tsx
// Increase fallback delay to 2 seconds
<PageTransition config={{ fallbackDelay: 2000 }}>
  {children}
</PageTransition>
```

#### `duration`
- **Type**: `number` (seconds)
- **Default**: `0.4`
- **Description**: Duration of the enter animation. Exit animation is automatically 75% of this value for faster transitions.

```tsx
// Slower animation
<PageTransition config={{ duration: 0.8 }}>
  {children}
</PageTransition>

// Faster animation
<PageTransition config={{ duration: 0.2 }}>
  {children}
</PageTransition>
```

#### `variants`
- **Type**: `Variants` (Framer Motion)
- **Default**: Built-in variants
- **Description**: Custom animation variants for complete control over animation behavior.

```tsx
<PageTransition config={{ 
  variants: {
    initial: { opacity: 0, scale: 0.9, y: 20 },
    enter: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    },
    exit: { 
      opacity: 0, 
      scale: 1.1, 
      y: -20,
      transition: { duration: 0.3, ease: 'easeIn' }
    }
  }
}}>
  {children}
</PageTransition>
```

## Built-in Animation Variants

### Default Variants
Smooth fade with vertical slide:
```typescript
{
  initial: { opacity: 0, y: 20 },
  enter: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: [0.4, 0, 1, 1] }
  }
}
```

### Reduced Motion Variants
Minimal animation for accessibility:
```typescript
{
  initial: { opacity: 0 },
  enter: { 
    opacity: 1,
    transition: { duration: 0.2 }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.15 }
  }
}
```

## Accessibility

### Prefers Reduced Motion

The component automatically detects the user's motion preference:

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
```

When a user prefers reduced motion:
- Automatically switches to minimal animation variants
- Only animates opacity (no movement)
- Shorter animation duration

### Manual Override

You can also manually disable animations:

```tsx
<PageTransition config={{ enableAnimation: false }}>
  {children}
</PageTransition>
```

## Performance Considerations

### GPU Acceleration

The default animations use GPU-accelerated properties:
- `opacity` - Fully GPU accelerated
- `transform` (y, scale) - GPU accelerated

Avoid animating:
- `width`, `height` - Causes layout recalculation
- `top`, `left` - Not GPU accelerated
- `margin`, `padding` - Causes layout shifts

### Best Practices

1. **Keep animations short**: 0.2-0.5s is ideal
2. **Use transform over position**: Better performance
3. **Avoid layout shifts**: Animate opacity and transform only
4. **Test on low-end devices**: Ensure smooth 60fps

## Common Use Cases

### 1. Standard Page Transitions

```tsx
// In your layout component
<PageTransition>
  <main>{children}</main>
</PageTransition>
```

### 2. Fast Transitions for Frequent Navigation

```tsx
<PageTransition config={{ duration: 0.2 }}>
  {children}
</PageTransition>
```

### 3. Disabled for Performance-Critical Pages

```tsx
<PageTransition config={{ enableAnimation: false }}>
  {children}
</PageTransition>
```

### 4. Custom Animation for Special Pages

```tsx
<PageTransition config={{ 
  variants: {
    initial: { opacity: 0, rotateY: -90 },
    enter: { 
      opacity: 1, 
      rotateY: 0,
      transition: { duration: 0.6 }
    },
    exit: { 
      opacity: 0, 
      rotateY: 90,
      transition: { duration: 0.4 }
    }
  }
}}>
  {children}
</PageTransition>
```

## Troubleshooting

### Content Not Appearing

If content doesn't appear:
1. Check console for error messages
2. Verify `fallbackDelay` is sufficient
3. Try disabling animations temporarily: `enableAnimation: false`
4. Check if `prefers-reduced-motion` is affecting behavior

### Animations Too Slow/Fast

Adjust the `duration` prop:
```tsx
// Faster
<PageTransition config={{ duration: 0.2 }}>

// Slower
<PageTransition config={{ duration: 0.8 }}>
```

### Animation Stuttering

1. Ensure you're only animating GPU-accelerated properties
2. Check for layout shifts during animation
3. Reduce animation complexity
4. Consider disabling animations on low-end devices

## Testing

### Unit Tests

```tsx
import { render, screen } from '@testing-library/react';
import { PageTransition } from '@/components/page-transition';

test('renders with custom config', () => {
  render(
    <PageTransition config={{ enableAnimation: false }}>
      <div>Test Content</div>
    </PageTransition>
  );
  
  expect(screen.getByText('Test Content')).toBeInTheDocument();
});
```

### Integration Tests

Test page navigation with animations:
```tsx
// Navigate to different pages and verify content appears
await user.click(screen.getByText('Next Page'));
await waitFor(() => {
  expect(screen.getByText('New Page Content')).toBeInTheDocument();
});
```

## Demo

Visit `/demo/page-transition-config` to see all configuration options in action.

## API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | Content to animate |
| `config` | `PageTransitionConfig` | `{}` | Configuration options |

### Config Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enableAnimation` | `boolean` | `true` | Enable/disable animations |
| `fallbackDelay` | `number` | `1000` | Fallback timeout in ms |
| `duration` | `number` | `0.4` | Animation duration in seconds |
| `variants` | `Variants` | Built-in | Custom animation variants |

## Migration Guide

### From Previous Version

If you're using the old PageTransition without config:

**Before:**
```tsx
<PageTransition>
  {children}
</PageTransition>
```

**After (no changes needed):**
```tsx
// Still works! Config is optional
<PageTransition>
  {children}
</PageTransition>

// Or with config
<PageTransition config={{ duration: 0.6 }}>
  {children}
</PageTransition>
```

## Related Components

- `SafePageTransition` - Error boundary wrapper for PageTransition
- `NavigationProgress` - Progress bar for page navigation
- `MainLayout` - Main layout component that uses PageTransition

## Support

For issues or questions:
1. Check the demo page: `/demo/page-transition-config`
2. Review console logs for debugging information
3. Verify configuration matches expected format
4. Test with animations disabled to isolate issues
