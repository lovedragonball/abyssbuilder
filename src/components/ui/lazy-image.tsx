"use client"

import * as React from "react"
import Image, { ImageProps } from "next/image"
import { useLazyLoad } from "@/hooks/use-lazy-load"
import { cn } from "@/lib/utils"

export interface LazyImageProps extends Omit<ImageProps, 'loading'> {
  fallbackSrc?: string
  threshold?: number
  rootMargin?: string
  showSkeleton?: boolean
}

/**
 * LazyImage component that only loads when visible in viewport
 * 
 * Features:
 * - Lazy loads images using Intersection Observer
 * - Shows skeleton loader while loading
 * - Responsive image sizes
 * - Error handling with fallback
 * - Optimized for performance
 */
export const LazyImage = React.forwardRef<HTMLDivElement, LazyImageProps>(
  ({
    src,
    alt,
    className,
    fallbackSrc,
    threshold = 0.1,
    rootMargin = '100px',
    showSkeleton = true,
    sizes,
    ...props
  }, forwardedRef) => {
    const { ref: lazyRef, isVisible } = useLazyLoad({
      threshold,
      rootMargin,
      triggerOnce: true
    })
    const [imgSrc, setImgSrc] = React.useState<string | null>(null)
    const [isLoading, setIsLoading] = React.useState(true)
    const [hasError, setHasError] = React.useState(false)

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLDivElement) => {
        (lazyRef as React.MutableRefObject<HTMLDivElement | null>).current = node
        if (typeof forwardedRef === 'function') {
          forwardedRef(node)
        } else if (forwardedRef) {
          forwardedRef.current = node
        }
      },
      [lazyRef, forwardedRef]
    )

    // Load image when visible
    React.useEffect(() => {
      if (isVisible && !imgSrc) {
        setImgSrc(src as string)
      }
    }, [isVisible, src, imgSrc])

    const handleError = () => {
      setHasError(true)
      if (fallbackSrc && imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc)
      }
    }

    const handleLoad = () => {
      setIsLoading(false)
    }

    // Default responsive sizes
    const defaultSizes = sizes || "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"

    return (
      <div ref={combinedRef} className={cn("relative overflow-hidden", className)}>
        {imgSrc ? (
          <>
            <Image
              src={imgSrc}
              alt={alt}
              className={cn(
                "transition-opacity duration-300",
                isLoading ? "opacity-0" : "opacity-100"
              )}
              sizes={defaultSizes}
              onError={handleError}
              onLoad={handleLoad}
              {...props}
            />

            {/* Loading skeleton */}
            {isLoading && showSkeleton && (
              <div className="absolute inset-0 bg-muted animate-shimmer" />
            )}
          </>
        ) : (
          /* Placeholder before image loads */
          showSkeleton && (
            <div className="absolute inset-0 bg-muted animate-shimmer" />
          )
        )}

        {/* Error state */}
        {hasError && !fallbackSrc && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <span className="text-xs text-muted-foreground">Failed to load image</span>
          </div>
        )}
      </div>
    )
  }
)

LazyImage.displayName = "LazyImage"
