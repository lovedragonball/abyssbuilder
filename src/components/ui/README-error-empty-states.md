# Error and Empty State Components

This document describes the error and empty state components created for the UI/UX enhancement project.

## Overview

These components provide consistent, accessible, and visually appealing ways to handle error states and empty content scenarios throughout the application.

## Error State Components

### ErrorState

A full-page or section-level error display with illustration, message, and retry functionality.

**Props:**
- `title` (string, optional): Error title (default: "Something went wrong")
- `message` (string, optional): Error description
- `onRetry` (function, optional): Callback for retry button
- `retryLabel` (string, optional): Custom retry button text
- `illustration` (ReactNode, optional): Custom illustration
- `className` (string, optional): Additional CSS classes

**Usage:**
```tsx
<ErrorState
  title="Failed to load builds"
  message="We couldn't load your builds. Please try again."
  onRetry={() => refetch()}
/>
```

### InlineError

Compact error message for form fields and inline validation.

**Props:**
- `message` (string, required): Error message text
- `icon` (ReactNode, optional): Custom icon
- `className` (string, optional): Additional CSS classes
- `shake` (boolean, optional): Enable shake animation

**Usage:**
```tsx
<InlineError 
  message="This field is required" 
  shake={true}
/>
```

### FormFieldError

Wrapper component that adds shake animation to form fields on error.

**Props:**
- `children` (ReactNode, required): Form field to wrap
- `error` (string, optional): Error message
- `showError` (boolean, optional): Whether to show error
- `className` (string, optional): Additional CSS classes

**Usage:**
```tsx
<FormFieldError
  error="Username is required"
  showError={!!errors.username}
>
  <Input {...register("username")} />
</FormFieldError>
```

### ErrorBadge

Small badge for displaying error counts or status.

**Props:**
- `count` (number, optional): Error count
- `label` (string, optional): Badge label (default: "Error")
- `className` (string, optional): Additional CSS classes

**Usage:**
```tsx
<ErrorBadge count={3} label="Error" />
```

## Empty State Components

### EmptyState

Full-featured empty state with icon, title, description, and action buttons.

**Props:**
- `title` (string, optional): Empty state title
- `description` (string, optional): Description text
- `icon` (EmptyStateIcon | ReactNode, optional): Icon type or custom icon
- `action` (object, optional): Primary action button config
  - `label` (string): Button text
  - `onClick` (function): Click handler
  - `variant` (string, optional): Button variant
- `secondaryAction` (object, optional): Secondary action button config
- `illustration` (ReactNode, optional): Custom illustration
- `className` (string, optional): Additional CSS classes

**Icon Types:**
- `"default"` - Inbox icon
- `"search"` - Search icon
- `"folder"` - Folder icon
- `"package"` - Package icon
- `"users"` - Users icon
- `"favorites"` - Star icon
- `"file"` - File icon

**Usage:**
```tsx
<EmptyState
  title="No builds created yet"
  description="Start building your perfect character setup."
  icon="package"
  action={{
    label: "Create Build",
    onClick: () => router.push('/create'),
    variant: "gradient"
  }}
  secondaryAction={{
    label: "Browse Examples",
    onClick: () => router.push('/examples')
  }}
/>
```

### CompactEmptyState

Smaller empty state for cards and compact sections.

**Props:**
- `message` (string, required): Empty state message
- `icon` (EmptyStateIcon | ReactNode, optional): Icon type or custom icon
- `action` (object, optional): Action button config
- `className` (string, optional): Additional CSS classes

**Usage:**
```tsx
<CompactEmptyState
  message="No favorites yet"
  icon="favorites"
  action={{
    label: "Browse Builds",
    onClick: () => router.push('/builds')
  }}
/>
```

### EmptySearchResults

Specialized empty state for search results with suggestions.

**Props:**
- `query` (string, required): Search query that returned no results
- `onClear` (function, optional): Clear search callback
- `suggestions` (string[], optional): Suggested search terms
- `className` (string, optional): Additional CSS classes

**Usage:**
```tsx
<EmptySearchResults
  query={searchQuery}
  onClear={() => setSearchQuery('')}
  suggestions={["weapons", "armor", "accessories"]}
/>
```

### EmptyList

Specialized empty state for empty lists with type-specific messaging.

**Props:**
- `type` (string, required): Type of items (e.g., "builds", "teams")
- `onCreateNew` (function, optional): Create new item callback
- `className` (string, optional): Additional CSS classes

**Usage:**
```tsx
<EmptyList
  type="teams"
  onCreateNew={() => router.push('/teams/create')}
/>
```

## Animation Features

### Shake Animation
- Applied to form fields on validation errors
- 500ms duration with easeInOut timing
- Automatically triggers when error state changes
- Draws attention to invalid fields

### Fade-in Animation
- All components fade in smoothly on mount
- Staggered animations for multiple elements
- Creates polished, professional feel

### Scale Animation
- Icons and illustrations scale up on mount
- Spring animation for natural feel
- Adds depth and visual interest

## Styling

All components use:
- Consistent color scheme from design system
- Proper spacing and typography hierarchy
- Responsive layouts (mobile-first)
- Dark mode support
- Accessible color contrast ratios

## Accessibility

- Semantic HTML structure
- Proper ARIA labels where needed
- Keyboard navigation support
- Screen reader friendly
- High contrast text and icons
- Focus indicators on interactive elements

## Integration Examples

### With React Query
```tsx
const { data, isLoading, isError, refetch } = useQuery({
  queryKey: ['builds'],
  queryFn: fetchBuilds
})

if (isError) {
  return (
    <ErrorState
      title="Failed to load builds"
      message="We couldn't load your builds. Please try again."
      onRetry={() => refetch()}
    />
  )
}

if (!isLoading && data?.length === 0) {
  return (
    <EmptyState
      title="No builds yet"
      description="Create your first build to get started."
      icon="package"
      action={{
        label: "Create Build",
        onClick: () => router.push('/create')
      }}
    />
  )
}
```

### With Form Validation
```tsx
const { register, handleSubmit, formState: { errors } } = useForm()

return (
  <form onSubmit={handleSubmit(onSubmit)}>
    <FormFieldError
      error={errors.username?.message}
      showError={!!errors.username}
    >
      <Input
        {...register("username", { required: "Username is required" })}
        className={errors.username ? "border-destructive" : ""}
      />
    </FormFieldError>
  </form>
)
```

### With Search
```tsx
const [query, setQuery] = useState('')
const results = useSearch(query)

if (query && results.length === 0) {
  return (
    <EmptySearchResults
      query={query}
      onClear={() => setQuery('')}
      suggestions={["weapons", "armor", "builds"]}
    />
  )
}
```

## Best Practices

1. **Use appropriate component for context**
   - Full `ErrorState` for page-level errors
   - `InlineError` for form validation
   - `CompactEmptyState` for cards and small sections

2. **Provide actionable feedback**
   - Always include retry button for errors
   - Offer clear next steps in empty states
   - Use descriptive error messages

3. **Maintain consistency**
   - Use standard icons from the icon map
   - Follow established color patterns
   - Keep messaging tone consistent

4. **Consider user experience**
   - Show loading states before empty states
   - Provide helpful suggestions
   - Make actions obvious and accessible

5. **Test edge cases**
   - Very long error messages
   - Multiple simultaneous errors
   - Rapid state changes
   - Mobile viewport sizes

## Requirements Satisfied

This implementation satisfies requirement 3.5 from the requirements document:
- WHEN a user views images and icons THEN the system SHALL display them with proper loading states and fallbacks
- Provides comprehensive error handling UI
- Offers multiple empty state variants for different scenarios
- Includes proper animations and visual feedback
- Maintains accessibility standards
