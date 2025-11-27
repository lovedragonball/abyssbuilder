# News Components Accessibility Documentation

This document outlines the accessibility features implemented in the News & Updates components to ensure WCAG AA compliance and excellent user experience for all users, including those using assistive technologies.

## Overview

All news components have been designed with accessibility as a core requirement, implementing:
- Proper ARIA labels and roles
- Semantic HTML structure
- Keyboard navigation support
- Focus management
- Screen reader optimization
- Color contrast compliance
- Reduced motion support

## Components

### UpdateCard

The base card component that wraps all news content.

#### ARIA Attributes
- **role**: Defaults to `"article"`, can be customized to `"region"` or other appropriate roles
- **aria-label**: Accepts custom label for screen readers
- **aria-labelledby**: Automatically links to the card title's ID

#### Heading Hierarchy
- Uses `<h2>` for card titles
- Generates unique IDs for each title using React's `useId()`
- Maintains proper heading hierarchy when nested content includes additional headings

#### Keyboard Navigation
- Content area is keyboard accessible with `tabIndex={0}`
- Scrollable content can be navigated using arrow keys
- Focus indicators visible when navigating via keyboard

#### Focus Indicators
- Custom focus ring: `focus-within:ring-2 focus-within:ring-cyan-500/50`
- Ring offset for better visibility: `focus-within:ring-offset-2`
- Smooth transitions for focus states

#### Example Usage
```tsx
<UpdateCard 
  title="My Card"
  role="region"
  aria-label="Custom accessible label"
>
  <p>Content here</p>
</UpdateCard>
```

---

### KnownIssuesCard

Displays a list of known game issues.

#### ARIA Attributes
- **role="region"**: Identifies the card as a landmark region
- **aria-label**: Descriptive label for the entire card
- **role="list"**: Semantic list for issues
- **role="listitem"**: Each issue is a proper list item
- **aria-label** on items: Descriptive labels like "Known issue 1: [description]"

#### Keyboard Navigation
- Each issue item is focusable with `tabIndex={0}`
- Tab key navigates through content region, then through each issue
- Focus indicators show which item is currently focused

#### Screen Reader Support
- List announces total count: "Known issues list with 2 items"
- Each item announces its position and content
- Decorative icons hidden with `aria-hidden="true"`
- Empty state uses `role="status"` with `aria-live="polite"`

#### Internationalization
- Supports Thai language with proper font rendering
- Translations for all UI text

#### Example Usage
```tsx
<KnownIssuesCard 
  issues={knownIssues}
  locale="en"
  maxHeight="600px"
/>
```

---

### PatchNotesCard

Displays patch notes grouped by date.

#### ARIA Attributes
- **role="region"**: Main card container
- **role="region"** for date groups: Each date section is a landmark
- **aria-labelledby**: Links date groups to their heading IDs
- **role="list"**: Semantic lists for patch notes within each date group
- **role="listitem"**: Each patch note is a proper list item
- **role="heading"** with **aria-level="3"**: Date headers maintain hierarchy

#### Heading Hierarchy
```
h2: Card title ("Patch Notes")
  h3: Date header ("Update Details - 2025-11-22")
    list items: Individual patch notes
```

#### Keyboard Navigation
- Content region is keyboard accessible
- All patch note items are focusable
- Show More button is keyboard activatable
- Tab order follows logical reading order

#### Interactive Elements
- **Show More button**:
  - `aria-expanded`: Indicates current state (true/false)
  - `aria-controls`: Links to the patch notes list ID
  - Descriptive `aria-label`: "Show More. Currently showing 5 of 10 updates"
  - Focus indicator on keyboard focus

#### Screen Reader Support
- Lists announce counts: "2 updates for Update Details - 2025-11-22"
- Button provides context about current state
- Date groups properly announced with their headings

#### Example Usage
```tsx
<PatchNotesCard 
  updates={updates}
  maxVisibleUpdates={5}
  showMoreButton={true}
  locale="en"
/>
```

---

### NewsUpdatesSection

Main container component that combines Known Issues and Patch Notes cards.

#### ARIA Attributes
- **role="region"**: Identifies the entire section as a landmark
- **aria-label**: "Game News and Updates" (or Thai equivalent)
- **role="alert"** for errors: Error states use alert role with `aria-live="polite"`
- **role="status"** for empty states: Empty states announce changes politely

#### Layout
- Two-column grid on desktop
- Stacked layout on mobile (Known Issues first)
- Maintains accessibility in both layouts

#### Error Handling
- Error states properly announced to screen readers
- Fallback UI with clear messaging
- Alert icon hidden from screen readers with `aria-hidden="true"`

#### Example Usage
```tsx
<NewsUpdatesSection 
  patchData={patchData}
  maxVisibleUpdates={5}
  locale="en"
/>
```

---

## Keyboard Navigation

### Tab Order
1. Known Issues card content region
2. Individual known issue items (in order)
3. Patch Notes card content region
4. Individual patch note items (in order)
5. Show More button (if present)

### Keyboard Shortcuts
- **Tab**: Move forward through focusable elements
- **Shift + Tab**: Move backward through focusable elements
- **Arrow Keys**: Scroll within card content areas
- **Enter/Space**: Activate Show More button

---

## Focus Management

### Focus Indicators
All interactive elements have visible focus indicators:
- **Cards**: Ring outline when any child element is focused
- **List items**: Ring outline on focus
- **Buttons**: Ring outline with color change

### Focus Styles
```css
.focus-within:ring-2 {
  outline: 2px solid rgba(79, 195, 247, 0.5);
  outline-offset: 2px;
}
```

---

## Color Contrast

All text meets WCAG AA standards (4.5:1 for normal text, 3:1 for large text):

| Element | Color | Background | Ratio |
|---------|-------|------------|-------|
| Body text | `#e0e0e0` (gray-300) | `#1a1a2e` | 12.6:1 ✓ |
| Highlighted terms | `#4fc3f7` (cyan-400) | `rgba(79, 195, 247, 0.1)` | 7.8:1 ✓ |
| Date headers | `#ffd700` (yellow-400) | `#1a1a2e` | 14.2:1 ✓ |
| Icons | `#ffd700` (yellow-400) | `#1a1a2e` | 14.2:1 ✓ |

### High Contrast Mode
Components adapt to high contrast mode:
```css
@media (prefers-contrast: high) {
  .update-card {
    border-width: 2px;
  }
  
  .highlighted-term {
    border: 1px solid currentColor;
  }
}
```

---

## Reduced Motion

Components respect user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  .update-card,
  .update-item,
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Screen Reader Testing

### Tested With
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)
- TalkBack (Android)

### Announcement Examples

#### Known Issues Card
```
"Region, Known Issues (Still Unresolved)"
"List, Known issues list with 2 items"
"List item, Known issue 1: Issue with Longbow: Embla Inflorescence in Co-op mode"
```

#### Patch Notes Card
```
"Region, Patch Notes (Bug Fixes and Improvements)"
"Region, Update Details - 2025-11-22"
"List, 2 updates for Update Details - 2025-11-22"
"List item, Patch note 1: Fixed issue with Eclosion effect"
```

#### Show More Button
```
"Button, Show More. Currently showing 5 of 10 updates, collapsed"
[After activation]
"Button, Show Less. Currently showing all 10 updates, expanded"
```

---

## Custom Scrollbar Accessibility

### Styling
```css
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
}

/* Firefox */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.2) rgba(255, 255, 255, 0.05);
}
```

### Keyboard Scrolling
- Content areas are focusable with `tabIndex={0}`
- Arrow keys work for scrolling
- Page Up/Page Down supported
- Home/End keys work

---

## Testing

### Automated Testing
All components include comprehensive accessibility tests using jest-axe:

```bash
npm test -- --testPathPattern="accessibility"
```

### Manual Testing Checklist
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA
- [ ] Works with high contrast mode
- [ ] Respects reduced motion preferences
- [ ] Proper heading hierarchy
- [ ] ARIA labels accurate and descriptive

---

## Best Practices

### When Adding New Content
1. Use semantic HTML elements
2. Add appropriate ARIA labels
3. Ensure keyboard accessibility
4. Test with screen readers
5. Verify color contrast
6. Add focus indicators
7. Write accessibility tests

### Common Patterns
```tsx
// List with proper semantics
<div role="list" aria-label="Descriptive label with count">
  <div role="listitem" tabIndex={0} aria-label="Item description">
    Content
  </div>
</div>

// Interactive button
<button
  aria-expanded={isExpanded}
  aria-controls="content-id"
  aria-label="Descriptive action with context"
>
  Button Text
</button>

// Decorative icon
<span aria-hidden="true">✧</span>
```

---

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [jest-axe Documentation](https://github.com/nickcolley/jest-axe)

---

## Support

For accessibility issues or questions:
1. Check this documentation
2. Review the test files for examples
3. Test with actual assistive technologies
4. Consult WCAG guidelines for specific requirements
