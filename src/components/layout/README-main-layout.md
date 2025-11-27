# MainLayout Component

## Overview

The `MainLayout` component is the primary layout wrapper for all pages in the application. It provides a consistent structure with header navigation, page transitions, error handling, and loading indicators.

## Features

### 1. Safe Page Transitions
- Wraps `PageTransition` with `SafePageTransition` error boundary
- Gracefully handles animation errors
- Provides fallback UI when animations fail
- Automatic recovery mechanism

### 2. Configurable Animations
- Customizable animation settings via `PAGE_TRANSITION_CONFIG`
- Respects user's `prefers-reduced-motion` preference
- Fallback timeout to prevent stuck animations
- Smooth transitions between pages

### 3. Loading Indicator
- Visual feedback during page transitions
- Accessible with proper ARIA attributes
- Automatically shows/hides based on pathname changes
- Minimal, non-intrusive design

### 4. Consistent Navigation
- Always-visible header with navigation
- Navigation progress bar
- Mobile-responsive design
- Keyboard shortcuts support

## Structure

```tsx
<div className="min-h-screen bg-background">
  <NavigationProgress />
  <Header />
  {isLoading && <LoadingIndicator />}
  <SafePageTransition fallback={<FallbackUI />}>
    <PageTransition config={PAGE_TRANSITION_CONFIG}>
      <main id="main-content">
        {children}
      </main>
    </PageTransition>
  </SafePageTransition>
</div>
```

## Configuration

### Page Transition Config

Located at the top of the component:

```typescript
const PAGE_TRANSITION_CONFIG: PageTransitionConfig = {
  enableAnimation: true,      // Enable/disable animations
  fallbackDelay: 1000,        // Timeout before forcing render (ms)
  duration: 0.4,              // Animation duration (seconds)
};
```

### Customization Options

You can modify the configuration to:

1. **Disable animations globally**:
   ```typescript
   enableAnimation: false
   ```

2. **Adjust animation speed**:
   ```typescript
   duration: 0.6  // Slower animations
   ```

3. **Change fallback timeout**:
   ```typescript
   fallbackDelay: 1500  // Wait longer before fallback
   ```

## Error Handling

### SafePageTransition Error Boundary

The component uses `SafePageTransition` to catch and handle errors from Framer Motion animations:

- **Automatic Recovery**: Attempts to recover from errors automatically
- **Fallback UI**: Shows content without animations if errors persist
- **Error Logging**: Logs detailed error information for debugging
- **User Actions**: Provides "Try Again" and "Refresh Page" buttons

### Fallback UI

When animations fail, users see:
- A warning message explaining the situation
- The page content without animations
- Options to retry or refresh

## Loading States

### Loading Indicator

A subtle loading bar appears at the top of the page during transitions:

```tsx
{isLoading && (
  <div 
    className="fixed top-16 left-0 right-0 h-1 bg-primary/20 z-50"
    role="progressbar"
    aria-label="Page loading"
    aria-busy="true"
  >
    <div className="h-full bg-primary animate-pulse" />
  </div>
)}
```

Features:
- Fixed position below header
- Accessible with ARIA attributes
- Pulsing animation for visual feedback
- Automatically managed based on pathname

## Accessibility

### ARIA Attributes

- `role="progressbar"` on loading indicator
- `aria-label="Page loading"` for screen readers
- `aria-busy="true"` during loading states
- `id="main-content"` for skip-to-content links

### Keyboard Navigation

- All navigation items are keyboard accessible
- Keyboard shortcuts for common actions (via Header)
- Focus management during page transitions

### Reduced Motion

- Respects `prefers-reduced-motion` media query
- Automatically disables animations for users who prefer reduced motion
- Provides instant page transitions when animations are disabled

## Testing

### Unit Tests

Located in `src/components/layout/__tests__/main-layout.test.tsx`:

```bash
npm test -- main-layout.test.tsx
```

Tests verify:
- All components render correctly
- Proper component hierarchy
- Children content is displayed
- Correct CSS classes and structure

### Manual Testing

1. **Navigation Testing**:
   - Click through all menu items
   - Verify smooth transitions
   - Check loading indicator appears

2. **Error Testing**:
   - Simulate animation errors
   - Verify fallback UI appears
   - Test recovery mechanisms

3. **Accessibility Testing**:
   - Test with keyboard only
   - Use screen reader
   - Enable reduced motion preference

## Integration with Other Components

### Header Component

The Header is always visible and provides:
- Logo and branding
- Navigation menu
- Mobile menu toggle
- Keyboard shortcuts

### PageTransition Component

Handles the actual page transition animations:
- Configurable animation variants
- Reduced motion support
- Fallback mechanisms
- Debug logging

### SafePageTransition Component

Error boundary that wraps PageTransition:
- Catches animation errors
- Provides fallback UI
- Automatic recovery
- Error logging

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**: Components are loaded on demand
2. **Memoization**: Uses React.memo where appropriate
3. **GPU Acceleration**: Animations use transform and opacity
4. **Timeout Management**: Cleans up timers properly

### Bundle Size

The MainLayout adds minimal overhead:
- No additional dependencies
- Reuses existing components
- Efficient error handling

## Troubleshooting

### Issue: Pages not rendering

**Solution**: Check browser console for errors. SafePageTransition should catch and display errors.

### Issue: Animations not working

**Solution**: 
1. Check if `enableAnimation` is set to `true`
2. Verify user doesn't have `prefers-reduced-motion` enabled
3. Check for JavaScript errors in console

### Issue: Loading indicator stuck

**Solution**: The fallback timeout (1000ms) should force render. If stuck, check for JavaScript errors.

### Issue: Header not visible

**Solution**: Verify Header component is rendering correctly. Check z-index and positioning.

## Migration Notes

### From Previous Version

The updated MainLayout includes:
- ✅ SafePageTransition wrapper (new)
- ✅ Loading indicator (new)
- ✅ Configuration object (new)
- ✅ Enhanced error handling (improved)
- ✅ Better accessibility (improved)

### Breaking Changes

None. The component maintains backward compatibility.

## Best Practices

1. **Don't modify PAGE_TRANSITION_CONFIG frequently**: Set it once based on your needs
2. **Monitor error logs**: Check for animation errors in production
3. **Test with reduced motion**: Ensure accessibility for all users
4. **Keep Header lightweight**: Avoid heavy computations in Header component
5. **Use semantic HTML**: Maintain proper heading hierarchy in page content

## Related Components

- [Header](./header.tsx) - Navigation header
- [PageTransition](../page-transition.tsx) - Animation component
- [SafePageTransition](../safe-page-transition.tsx) - Error boundary
- [NavigationProgress](../navigation-progress.tsx) - Progress indicator

## Future Enhancements

Potential improvements:
- [ ] User preference for animation speed
- [ ] Custom animations per route
- [ ] Preloading for faster transitions
- [ ] Analytics integration for error tracking
- [ ] A/B testing for different animation styles
