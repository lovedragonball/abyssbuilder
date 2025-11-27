/**
 * Loading skeleton component for News Updates Section
 * Displays placeholder content while data is loading
 */

import * as React from "react"
import { cn } from "@/lib/utils"

export interface NewsSkeletonProps {
  className?: string
}

/**
 * Skeleton card component
 */
function SkeletonCard() {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/10",
        "bg-gradient-to-br from-slate-900/90 to-slate-800/90",
        "shadow-lg overflow-hidden",
        "animate-pulse"
      )}
      role="status"
      aria-label="Loading content"
    >
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-white/5">
        <div className="h-6 w-3/4 bg-white/10 rounded" />
      </div>

      {/* Card Content */}
      <div className="p-6 space-y-4">
        {/* Skeleton items */}
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex gap-3">
            {/* Icon placeholder */}
            <div className="w-4 h-4 bg-white/10 rounded flex-shrink-0 mt-1" />
            {/* Text placeholder */}
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-white/10 rounded w-full" />
              <div className="h-4 bg-white/10 rounded w-5/6" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * News Updates Section Loading Skeleton
 * 
 * Displays a placeholder layout matching the actual NewsUpdatesSection
 * while data is being loaded or parsed.
 * 
 * @example
 * ```tsx
 * <Suspense fallback={<NewsSkeleton />}>
 *   <NewsUpdatesSection patchData={patchData} />
 * </Suspense>
 * ```
 */
export function NewsSkeleton({ className }: NewsSkeletonProps) {
  return (
    <div
      className={cn("news-skeleton w-full", className)}
      role="status"
      aria-live="polite"
      aria-label="Loading news and updates"
    >
      {/* Two-column grid layout matching actual component */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left card skeleton */}
        <SkeletonCard />
        
        {/* Right card skeleton */}
        <SkeletonCard />
      </div>

      {/* Screen reader text */}
      <span className="sr-only">Loading patch notes and known issues...</span>
    </div>
  )
}
