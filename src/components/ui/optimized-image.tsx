"use client"

import * as React from "react"
import Image, { ImageProps } from "next/image"
import { cn } from "@/lib/utils"

export interface OptimizedImageProps extends Omit<ImageProps, 'placeholder' | 'blurDataURL'> {
  fallbackSrc?: string
  showPlaceholder?: boolean
}

/**
 * OptimizedImage component with lazy loading, blur placeholder, and responsive sizes
 * 
 * Features:
 * - Automatic lazy loading for images below the fold
 * - Blur placeholder for better perceived performance
 * - Responsive image sizes based on viewport
 * - Error handling with fallback image
 * - Optimized for mobile-first design
 */
export const OptimizedImage = React.forwardRef<HTMLImageElement, OptimizedImageProps>(
  ({ 
    src, 
    alt, 
    className,
    fallbackSrc = '/placeholder-image.png',
    showPlaceholder = true,
    loading = 'lazy',
    sizes,
    ...props 
  }, ref) => {
    const [imgSrc, setImgSrc] = React.useState(src)
    const [isLoading, setIsLoading] = React.useState(true)

    // Default responsive sizes if not provided
    const defaultSizes = sizes || "(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"

    // Blur placeholder data URL (1x1 transparent pixel)
    const blurDataURL = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="

    const handleError = () => {
      if (fallbackSrc && imgSrc !== fallbackSrc) {
        setImgSrc(fallbackSrc)
      }
    }

    const handleLoad = () => {
      setIsLoading(false)
    }

    React.useEffect(() => {
      setImgSrc(src)
      setIsLoading(true)
    }, [src])

    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          ref={ref as any}
          src={imgSrc}
          alt={alt}
          className={cn(
            "transition-opacity duration-300",
            isLoading && showPlaceholder ? "opacity-0" : "opacity-100"
          )}
          loading={loading}
          sizes={defaultSizes}
          placeholder={showPlaceholder ? "blur" : "empty"}
          blurDataURL={showPlaceholder ? blurDataURL : undefined}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
        
        {/* Loading skeleton */}
        {isLoading && showPlaceholder && (
          <div className="absolute inset-0 bg-muted animate-shimmer" />
        )}
      </div>
    )
  }
)

OptimizedImage.displayName = "OptimizedImage"
