"use client"

import * as React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

export interface SkeletonLoaderProps {
  variant: 'card' | 'list' | 'text' | 'avatar'
  count?: number
  className?: string
  isLoading?: boolean
  children?: React.ReactNode
}

const SkeletonLoader = React.forwardRef<HTMLDivElement, SkeletonLoaderProps>(
  ({ variant, count = 1, className, isLoading = true, children }, ref) => {
    const renderSkeleton = () => {
      switch (variant) {
        case 'card':
          return (
            <div className={cn("rounded-lg border border-border bg-card overflow-hidden", className)}>
              <div className="relative h-48 w-full bg-muted animate-shimmer" />
              <div className="p-6 space-y-3">
                <div className="h-6 w-3/4 bg-muted rounded animate-shimmer" />
                <div className="h-4 w-full bg-muted rounded animate-shimmer" />
                <div className="h-4 w-5/6 bg-muted rounded animate-shimmer" />
                <div className="flex gap-2 mt-4">
                  <div className="h-8 w-20 bg-muted rounded animate-shimmer" />
                  <div className="h-8 w-20 bg-muted rounded animate-shimmer" />
                </div>
              </div>
            </div>
          )
        
        case 'list':
          return (
            <div className={cn("flex items-center gap-4 p-4 rounded-lg border border-border", className)}>
              <div className="h-12 w-12 rounded-full bg-muted animate-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 bg-muted rounded animate-shimmer" />
                <div className="h-3 w-1/2 bg-muted rounded animate-shimmer" />
              </div>
            </div>
          )
        
        case 'text':
          return (
            <div className={cn("space-y-2", className)}>
              <div className="h-4 w-full bg-muted rounded animate-shimmer" />
              <div className="h-4 w-5/6 bg-muted rounded animate-shimmer" />
              <div className="h-4 w-4/6 bg-muted rounded animate-shimmer" />
            </div>
          )
        
        case 'avatar':
          return (
            <div className={cn("flex items-center gap-3", className)}>
              <div className="h-10 w-10 rounded-full bg-muted animate-shimmer flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-24 bg-muted rounded animate-shimmer" />
                <div className="h-2 w-16 bg-muted rounded animate-shimmer" />
              </div>
            </div>
          )
        
        default:
          return null
      }
    }

    const skeletons = Array.from({ length: count }, (_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, delay: i * 0.05 }}
      >
        {renderSkeleton()}
      </motion.div>
    ))

    return (
      <div ref={ref}>
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              {skeletons}
            </motion.div>
          ) : (
            <motion.div
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }
)

SkeletonLoader.displayName = "SkeletonLoader"

export { SkeletonLoader }
