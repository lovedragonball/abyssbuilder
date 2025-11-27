# PageTransition Accessibility Features

This document describes the accessibility features implemented in the `PageTransition` component to ensure an inclusive user experience for all users, including those using assistive technologies.

## Overview

The `PageTransition` component includes comprehensive accessibility features that comply with WCAG 2.1 Level AA guidelines:

- ✅ Respects `prefers-reduced-motion` user preference
- ✅ Automatic focus management after page transitions
- ✅ ARIA live region announcements for screen readers
- ✅ Keyboard navigation support during animations
- ✅ No focus traps or accessibility barriers

## Features

### 1. Reduced Motion Support

The component automatically detects and respects the user's motion preferences through the `prefers-reduced-motion` CSS media query.

**How it works:**
- Detects `prefers-reduced-motion: reduce` setting from the operating system
- Automatically switches to minimal animations when reduced motion is preferred
- Uses simpler fade transitions instead of complex movements
- Listens for changes to motion preferences in real-time

**User Experience:**
- Users who prefer reduced motion see minimal, non-distracting transitions
- Content still transitions smoothly but without complex animations
- Reduces risk of motion sickness or vestibular disorders

**Configuration:**
```tsx
// Animation is automatically reduced when user prefers reduced motion
<PageTransition>
  {children}
</PageTransition>

// Or explicitly disable animations
<PageTransition config={{ enableAnimation: false }}>
  {children}
</PageTransition>
```

**Testing:**
- **Windows:** Settings → Accessibility → Visual effects → Animation effects (Off)
- **macOS:** System Preferences → Accessibility → Display → Reduce motion
- **Linux:** Varies by desktop environment
- **Browser DevTools:** Chrome/Edge → Rendering → Emulate CSS media feature prefers-reduced-motion

### 2. Focus Management

After a page transition, focus is automatically moved to the main content area, allowing keyboard users to continue navigation efficiently.

**How it works:**
- After animation completes, searches for main content area (`<main>`, `[role="main"]`, `#main-content`)
- Makes the content focusable by adding `tabindex="-1"` if needed
- Moves focus to the content using `element.focus({ preventScroll: true })`
- Prevents page scroll jump when focus moves

**User Experience:**
- Keyboard users don't need to tab through the entire header/navigation after each page change
- Screen reader users are positioned at the start of the new page content
- Reduces navigation time and improves efficiency

**Configuration:**
```tsx
// Focus management is enabled by default
<PageTransition>
  {children}
</PageTransition>

// Disable if you want to manage focus manually
<PageTransition config={{ manageFocus: false }}>
  {children}
</PageTransition>
```

**Best Practices:**
- Ensure your page has a `<main>` element or `role="main"` attribute
- The main content should be the primary content area of the page
- Avoid multiple `<main>` elements on a single page

### 3. ARIA Live Region Announcements

Screen readers are notified of page changes through an ARIA live region that announces the new page title.

**How it works:**
- A hidden live region with `role="status"` and `aria-live="polite"` is rendered
- When pathname changes, generates a readable page title from the URL
- Announces "Navigated to [Page Title] page" to screen readers
- Announcement is cleared after 1 second to avoid clutter

**User Experience:**
- Screen reader users are informed when navigation occurs
- Provides context about the current page
- Uses "polite" announcement to avoid interrupting current reading
- Announcements are brief and informative

**Configuration:**
```tsx
// Announcements are enabled by default
<PageTransition>
  {children}
</PageTransition>

// Disable if you have custom announcement logic
<PageTransition config={{ announcePageChange: false }}>
  {children}
</PageTransition>
```

**Page Title Generation:**
The component automatically converts URL paths to readable titles:
- `/my-builds` → "My Builds"
- `/tier-list` → "Tier List"
- `/attribute-optimizer` → "Attribute Optimizer"
- `/` → "Home"

### 4. Keyboard Navigation

All interactive elements remain accessible during page transitions, with no focus traps or barriers.

**How it works:**
- Container uses `tabindex="-1"` to be programmatically focusable
- No `aria-hidden` or `inert` attributes that would block keyboard access
- Interactive elements remain in the tab order during animations
- Focus indicators remain visible throughout transitions

**User Experience:**
- Users can continue navigating with keyboard during animations
- Tab, Shift+Tab, Enter, and other keyboard shortcuts work normally
- No "dead zones" where keyboard input is ignored
- Smooth, uninterrupted keyboard navigation experience

**Testing:**
1. Use Tab key to navigate through interactive elements
2. Press Enter to activate links/buttons
3. Verify focus indicators are visible
4. Test during page transitions
5. Ensure no focus traps occur

## Configuration Options

```typescript
interface PageTransitionConfig {
  /** Enable or disable animations (default: true) */
  enableAnimation?: boolean
  
  /** Fallback delay in milliseconds before forcing render (default: 1000) */
  fallbackDelay?: number
  
  /** Animation duration in seconds (default: 0.4) */
  duration?: number
  
  /** Custom animation variants (optional) */
  variants?: Variants
  
  /** Enable focus management after transition (default: true) */
  manageFocus?: boolean
  
  /** Enable screen reader announcements (default: true) */
  announcePageChange?: boolean
}
```

## Usage Examples

### Basic Usage (All Features Enabled)
```tsx
import { PageTransition } from '@/components/page-transition'

export default function Layout({ children }) {
  return (
    <PageTransition>
      {children}
    </PageTransition>
  )
}
```

### Custom Configuration
```tsx
<PageTransition
  config={{
    enableAnimation: true,
    manageFocus: true,
    announcePageChange: true,
    fallbackDelay: 1500,
    duration: 0.3,
  }}
>
  {children}
</PageTransition>
```

### Disable Animations Only
```tsx
<PageTransition config={{ enableAnimation: false }}>
  {children}
</PageTransition>
```

### Custom Focus Management
```tsx
<PageTransition config={{ manageFocus: false }}>
  {children}
</PageTransition>

// Then manage focus manually:
useEffect(() => {
  const heading = document.querySelector('h1')
  heading?.focus()
}, [pathname])
```

## Testing Accessibility

### Manual Testing Checklist

- [ ] **Keyboard Navigation**
  - [ ] Tab through all interactive elements
  - [ ] Focus indicators are visible
  - [ ] No focus traps during transitions
  - [ ] Enter key activates links/buttons

- [ ] **Screen Reader Testing**
  - [ ] Page changes are announced
  - [ ] Announcements are clear and concise
  - [ ] Focus moves to main content
  - [ ] No duplicate announcements

- [ ] **Reduced Motion**
  - [ ] Enable reduced motion in OS settings
  - [ ] Verify animations are minimal
  - [ ] Content still transitions smoothly
  - [ ] No jarring movements

- [ ] **Focus Management**
  - [ ] Focus moves to main content after transition
  - [ ] Focus doesn't get lost
  - [ ] Focus doesn't jump unexpectedly
  - [ ] Can continue keyboard navigation

### Automated Testing

Run the accessibility test suite:
```bash
npm test -- page-transition-accessibility.test.tsx
```

### Browser Testing

Test in multiple browsers and assistive technologies:
- **Chrome** + NVDA (Windows)
- **Firefox** + NVDA (Windows)
- **Safari** + VoiceOver (macOS)
- **Edge** + Narrator (Windows)

### DevTools Testing

Use browser DevTools to test:
1. Open DevTools → Rendering
2. Enable "Emulate CSS media feature prefers-reduced-motion"
3. Navigate between pages
4. Verify reduced animations

## Screen Reader Instructions

### NVDA (Windows)
1. Install NVDA from nvaccess.org
2. Press `Insert + Down Arrow` to enter browse mode
3. Navigate with arrow keys
4. Listen for page change announcements

### JAWS (Windows)
1. Start JAWS
2. Navigate with arrow keys or Tab
3. Listen for "Navigated to..." announcements
4. Verify focus moves to main content

### VoiceOver (macOS)
1. Press `Cmd + F5` to enable VoiceOver
2. Use `VO + Right Arrow` to navigate
3. Listen for page change announcements
4. Verify focus management

### Narrator (Windows)
1. Press `Win + Ctrl + Enter` to start Narrator
2. Use Tab or arrow keys to navigate
3. Listen for announcements
4. Test focus management

## Common Issues and Solutions

### Issue: Focus not moving to main content
**Solution:** Ensure your page has a `<main>` element or element with `role="main"`:
```tsx
<main>
  {/* Your page content */}
</main>
```

### Issue: Screen reader not announcing page changes
**Solution:** Check that `announcePageChange` is enabled and the live region is rendered:
```tsx
<PageTransition config={{ announcePageChange: true }}>
  {children}
</PageTransition>
```

### Issue: Animations still playing with reduced motion
**Solution:** Clear browser cache and verify OS settings are correct. Check console logs for motion preference detection.

### Issue: Focus trap during animation
**Solution:** Ensure no elements have `aria-hidden="true"` or `inert` attribute during transitions.

## WCAG 2.1 Compliance

This implementation meets the following WCAG 2.1 Level AA success criteria:

- **2.1.1 Keyboard (Level A):** All functionality is available via keyboard
- **2.1.2 No Keyboard Trap (Level A):** No focus traps during transitions
- **2.2.2 Pause, Stop, Hide (Level A):** Respects reduced motion preferences
- **2.4.3 Focus Order (Level A):** Logical focus order maintained
- **2.4.7 Focus Visible (Level AA):** Focus indicators remain visible
- **3.2.3 Consistent Navigation (Level AA):** Navigation remains consistent
- **4.1.3 Status Messages (Level AA):** Page changes announced via live region

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [MDN: prefers-reduced-motion](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion)
- [MDN: ARIA Live Regions](https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions)
- [WebAIM: Keyboard Accessibility](https://webaim.org/techniques/keyboard/)
- [WebAIM: Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)

## Support

For accessibility issues or questions:
1. Check the console logs for debugging information
2. Review this documentation
3. Test with the demo page at `/demo/accessibility-navigation`
4. File an issue with details about the accessibility barrier
