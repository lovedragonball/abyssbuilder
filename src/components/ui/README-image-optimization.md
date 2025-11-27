# Image Optimization Components

This directory contains optimized image components for responsive, performant image loading across the application.

## Components

### OptimizedImage

A wrapper around Next.js Image component with built-in optimizations.

**Features:**
- Automatic lazy loading for images below the fold
- Blur placeholder for better perceived performance
- Responsive image sizes based on viewport
- Error handling with fallback image
- Mobile-first responsive sizing

**Usage:**
```tsx
import { OptimizedImage } from '@/components/ui/optimized-image'

<OptimizedImage
  src="/path/to/image.jpg"
  alt="Description"
  width={800}
  height={600}
  fallbackSrc="/fallback.jpg"
  showPlaceholder={true}
/>
```

**Props:**
- All Next.js Image props
- `fallbackSrc?: string` - Image to show if main image fails to load
- `showPlaceholder?: boolean` - Whether to show blur placeholder (default: true)

### LazyImage

An image component that only loads when visible in the viewport using Intersection Observer.

**Features:**
- Lazy loads images using Intersection Observer
- Shows skeleton loader while loading
- Configurable visibility threshold
- Error handling with fallback
- Optimized for performance

**Usage:**
```tsx
import { LazyImage } from '@/components/ui/lazy-image'

<LazyImage
  src="/path/to/image.jpg"
  alt="Description"
  fill
  threshold={0.1}
  rootMargin="100px"
  showSkeleton={true}
/>
```

**Props:**
- All Next.js Image props (except `loading`)
- `fallbackSrc?: string` - Fallback image URL
- `threshold?: number` - Intersection observer threshold (default: 0.1)
- `rootMargin?: string` - Root margin for intersection observer (default: '100px')
- `showSkeleton?: boolean` - Show skeleton while loading (default: true)

## Hooks

### useLazyLoad

A hook for lazy loading any content using Intersection Observer.

**Usage:**
```tsx
import { useLazyLoad } from '@/hooks/use-lazy-load'

function MyComponent() {
  const { ref, isVisible } = useLazyLoad({ threshold: 0.1 })
  
  return (
    <div ref={ref}>
      {isVisible && <ExpensiveComponent />}
    </div>
  )
}
```

**Options:**
- `threshold?: number` - Visibility threshold (default: 0.1)
- `rootMargin?: string` - Root margin (default: '50px')
- `triggerOnce?: boolean` - Only trigger once (default: true)

### useImagePreload

A hook for preloading images.

**Usage:**
```tsx
import { useImagePreload } from '@/hooks/use-lazy-load'

function MyComponent() {
  const { isLoaded, hasError } = useImagePreload('/path/to/image.jpg')
  
  return (
    <div>
      {isLoaded && <img src="/path/to/image.jpg" alt="Preloaded" />}
      {hasError && <p>Failed to load</p>}
    </div>
  )
}
```

## Best Practices

### Responsive Sizes

Always provide appropriate `sizes` prop for responsive images:

```tsx
// For full-width images on mobile, half-width on tablet, quarter on desktop
sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"

// For hero images
sizes="100vw"

// For thumbnails
sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
```

### Loading Strategy

- **Above the fold**: Use `loading="eager"` or standard Image component
- **Below the fold**: Use `loading="lazy"` or LazyImage component
- **Critical images**: Preload using `useImagePreload` hook

### Image Formats

Next.js automatically serves WebP/AVIF when supported. Ensure source images are:
- High quality (will be optimized automatically)
- Properly sized (at least 2x the display size for retina)
- In common formats (JPEG, PNG, WebP)

### Performance Tips

1. **Use appropriate sizes**: Prevents loading unnecessarily large images
2. **Lazy load below fold**: Reduces initial page load
3. **Provide blur placeholders**: Improves perceived performance
4. **Use fallback images**: Handles errors gracefully
5. **Optimize source images**: Compress before uploading

## Examples

### BuildCard with Optimized Images

```tsx
<div className="relative aspect-video overflow-hidden">
  <Image
    src={itemImage}
    alt={itemName}
    fill
    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
    className="object-cover transition-transform duration-500 group-hover:scale-110"
    loading="lazy"
    placeholder="blur"
    blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
  />
</div>
```

### Hero Section Background

```tsx
<OptimizedImage
  src="/hero-background.jpg"
  alt="Hero background"
  fill
  sizes="100vw"
  className="object-cover"
  priority // Load immediately for above-fold content
/>
```

### Gallery with Lazy Loading

```tsx
{images.map((image, index) => (
  <LazyImage
    key={image.id}
    src={image.url}
    alt={image.alt}
    width={400}
    height={300}
    threshold={0.1}
    rootMargin="200px"
  />
))}
```

## Browser Support

- **Intersection Observer**: All modern browsers (fallback: loads immediately)
- **Next.js Image**: All browsers supported by Next.js
- **WebP/AVIF**: Automatic fallback to JPEG/PNG

## Accessibility

All image components require an `alt` prop for accessibility. Provide descriptive alt text:

```tsx
// Good
<OptimizedImage src="/character.jpg" alt="Warrior character with sword and shield" />

// Bad
<OptimizedImage src="/character.jpg" alt="Image" />

// Decorative images
<OptimizedImage src="/decoration.jpg" alt="" />
```

## Testing

Test image loading on:
- Slow 3G connection (Chrome DevTools)
- Different viewport sizes (320px, 768px, 1920px)
- With JavaScript disabled (graceful degradation)
- With images blocked (fallback handling)
