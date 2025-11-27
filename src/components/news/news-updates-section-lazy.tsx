/**
 * Lazy-loaded wrapper for NewsUpdatesSection
 * Implements code splitting and lazy loading for better performance
 */

"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import { NewsSkeleton } from "./news-skeleton"
import { NewsUpdatesSectionProps } from "./news-updates-section"

/**
 * Dynamically imported NewsUpdatesSection with loading state
 */
const NewsUpdatesSectionDynamic = dynamic<NewsUpdatesSectionProps>(
  () => import("./news-updates-section").then((mod) => mod.NewsUpdatesSection),
  {
    loading: () => <NewsSkeleton />,
    ssr: true, // Enable server-side rendering
  }
)

/**
 * Lazy-loaded News Updates Section
 * 
 * This component wraps the NewsUpdatesSection with dynamic imports
 * for code splitting and lazy loading. It displays a skeleton loader
 * while the component is being loaded.
 * 
 * Use this component instead of NewsUpdatesSection directly when you
 * want to optimize initial page load performance.
 * 
 * @example
 * ```tsx
 * import { NewsUpdatesSectionLazy } from '@/components/news/news-updates-section-lazy'
 * 
 * export default function HomePage() {
 *   return (
 *     <NewsUpdatesSectionLazy 
 *       patchData={patchData}
 *       maxVisibleUpdates={5}
 *     />
 *   )
 * }
 * ```
 */
export function NewsUpdatesSectionLazy(props: NewsUpdatesSectionProps) {
  return <NewsUpdatesSectionDynamic {...props} />
}
