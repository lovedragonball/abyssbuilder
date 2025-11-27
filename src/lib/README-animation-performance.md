# Animation Performance Optimization Guide

This guide explains the animation performance optimizations implemented in the AbyssBuilder project.

## Overview

All animations have been optimized to use GPU-accelerated properties and respect user preferences for reduced motion, ensuring smooth 60fps animations and accessibility compliance.

## Key Optimizations

### 1. GPU-Accelerated Properties

All animations use only GPU-accelerated CSS properties:
- `transform` (translateX, translateY, translateZ, scale, rotate)
- `opacity`

**Avoid using:**
- `width`, `height` (causes layout recalculation)
- `top`, `left`, `right`, `bottom` (causes layout recalculation)
- `margin`, `padding` (causes layout recalculation)

### 2. Will-Change Hints

Heavy animations use `will-change` hints to inform the browser to optimize rendering:

```css
.animate-lift {
  animation: lift 0.3s ease-out forwards;
  will-change: transform;
}
```

**Important:** `will-change` is automatically removed after animation completes to avoid memory issues.

### 3. Reduced Motion Support

All animations respect the `prefers-reduced-motion` media query:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

## Usage

### Using Animation Utilities

```typescript
import { 
  prefersReducedMotion, 
  getAnimationConfig,
  performanceVariants 
} from '@/lib/animation-performance';

// Check if user prefers reduced motion
if (prefersReducedMotion()) {
  // Skip complex animations
}

// Get animation config with reduced motion support
const config = getAnimationConfig(animationConfig.normal);
```

### Using Performance Hooks

```typescript
import { 
  useReducedMotion,
  useWillChange,
  useScrollAnimation,
  useStaggerAnimation 
} from '@/hooks/use-performance-animation';

function MyComponent() {
  // Detect reduced motion preference
  const reducedMotion = useReducedMotion();
  
  // Manage will-change for performance
  const ref = useWillChange<HTMLDivElement>(['transform', 'opacity']);
  
  // Scroll-triggered animation
  const { ref: scrollRef, isVisible } = useScrollAnimation();
  
  // Staggered animations
  const visibleItems = useStaggerAnimation(5, 100);
  
  return (
    <div ref={ref}>
      {/* Your content */}
    </div>
  );
}
```

### Framer Motion with Performance

```typescript
import { motion } from 'framer-motion';
import { performanceVariants, getAnimationConfig } from '@/lib/animation-performance';

function AnimatedComponent() {
  return (
    <motion.div
      initial={performanceVariants.fadeInUp.initial}
      animate={performanceVariants.fadeInUp.animate}
      transition={getAnimationConfig(animationConfig.normal)}
    >
      Content
    </motion.div>
  );
}
```

## Animation Classes

### Available Animation Classes

All classes automatically handle reduced motion:

- `animate-fade-in` - Simple fade in
- `animate-fade-in-up` - Fade in from bottom
- `animate-fade-in-down` - Fade in from top
- `animate-slide-in-right` - Slide in from right
- `animate-slide-in-left` - Slide in from left
- `animate-scale-in` - Scale in
- `animate-lift` - Lift up on hover
- `animate-ripple` - Ripple effect
- `animate-shimmer` - Shimmer loading effect
- `animate-skeleton` - Skeleton pulse
- `animate-spin-slow` - Slow rotation
- `animate-glow-pulse` - Glow pulse effect
- `animate-shake` - Shake animation
- `animate-float` - Floating animation

### Usage Example

```tsx
<div className="animate-fade-in-up">
  This will fade in from bottom
</div>

<button className="hover:animate-lift">
  This will lift on hover
</button>
```

## Performance Best Practices

### 1. Use Transform Instead of Position

❌ **Bad:**
```css
.element {
  position: relative;
  left: 100px;
  transition: left 0.3s;
}
```

✅ **Good:**
```css
.element {
  transform: translateX(100px);
  transition: transform 0.3s;
}
```

### 2. Batch Animations with RequestAnimationFrame

❌ **Bad:**
```typescript
elements.forEach(el => {
  el.style.transform = 'translateY(10px)';
});
```

✅ **Good:**
```typescript
requestAnimationFrame(() => {
  elements.forEach(el => {
    el.style.transform = 'translateY(10px)';
  });
});
```

### 3. Use Will-Change Sparingly

❌ **Bad:**
```css
.element {
  will-change: transform, opacity, width, height, color;
}
```

✅ **Good:**
```css
.element:hover {
  will-change: transform;
}

.element:not(:hover) {
  will-change: auto;
}
```

### 4. Debounce Scroll Events

❌ **Bad:**
```typescript
window.addEventListener('scroll', () => {
  // Heavy computation
});
```

✅ **Good:**
```typescript
let ticking = false;

window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      // Heavy computation
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });
```

## Testing Performance

### Chrome DevTools

1. Open DevTools (F12)
2. Go to Performance tab
3. Record while interacting with animations
4. Look for:
   - Frame rate (should be 60fps)
   - Long tasks (should be < 50ms)
   - Layout shifts (should be minimal)

### Lighthouse

Run Lighthouse audit to check:
- Performance score
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)

### Manual Testing

Test on:
- Low-end devices
- Slow network connections
- With reduced motion enabled
- Different browsers (Chrome, Firefox, Safari)

## Accessibility

### Reduced Motion

Always respect user preferences:

```typescript
// Check preference
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (reducedMotion) {
  // Disable or simplify animations
}
```

### Focus Indicators

Ensure animations don't interfere with focus indicators:

```css
button:focus-visible {
  outline: 3px solid hsl(var(--primary));
  outline-offset: 2px;
  /* Animation should not affect outline */
}
```

## Common Issues and Solutions

### Issue: Janky Animations

**Solution:** Use GPU-accelerated properties only (transform, opacity)

### Issue: High Memory Usage

**Solution:** Remove will-change after animation completes

### Issue: Animations Not Smooth on Mobile

**Solution:** 
- Reduce animation complexity
- Use simpler easing functions
- Test on actual devices

### Issue: Animations Cause Layout Shifts

**Solution:**
- Reserve space for animated elements
- Use transform instead of changing dimensions
- Set explicit dimensions

## Resources

- [CSS Triggers](https://csstriggers.com/) - See what CSS properties trigger
- [Web Animations API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Reduced Motion Guide](https://web.dev/prefers-reduced-motion/)
