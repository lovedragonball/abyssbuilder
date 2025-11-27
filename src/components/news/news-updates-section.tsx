"use client"

/**
 * News Updates Section Component
 * 
 * Main container component that displays game patch notes and known issues
 * in a responsive card-based layout. Features include:
 * - Two-column desktop layout (Known Issues left, Patch Notes right)
 * - Single-column mobile layout with vertical stacking
 * - Smooth animations using Framer Motion
 * - Error and empty state handling
 * - Internationalization support (English and Thai)
 * - Accessibility features (ARIA labels, keyboard navigation)
 * 
 * @module NewsUpdatesSection
 * @example
 * ```tsx
 * import { NewsUpdatesSection } from '@/components/news/news-updates-section';
 * import { getPatchData } from '@/lib/patch-data-server';
 * 
 * export default async function NewsPage() {
 *   const patchData = await getPatchData();
 *   return <NewsUpdatesSection patchData={patchData} locale="en" />;
 * }
 * ```
 */

import * as React from "react"
import { motion } from "framer-motion"
import { KnownIssuesCard } from "./known-issues-card"
import { PatchNotesCard } from "./patch-notes-card"
import { TwitterCard } from "./TwitterCard"
import { RedditCard } from "./RedditCard"
import { FacebookCard } from "./FacebookCard"
import { PatchData } from "@/lib/patch-data"
import { cn } from "@/lib/utils"
import { AlertCircle } from "lucide-react"
import { useNewsTranslations, type Locale } from "@/lib/i18n/news-translations"

/**
 * Props for the NewsUpdatesSection component.
 * 
 * @interface NewsUpdatesSectionProps
 * @property {PatchData} patchData - Parsed patch data containing known issues and updates
 * @property {number} [maxVisibleUpdates=5] - Maximum number of update groups to show initially
 * @property {string} [className] - Additional CSS classes to apply to the section
 * @property {Locale} [locale='en'] - Language locale for translations ('en' or 'th')
 * @property {string} [maxHeight='600px'] - Maximum height for scrollable card content
 */
export interface NewsUpdatesSectionProps {
  /** Patch data containing known issues and updates */
  patchData: PatchData
  /** Maximum number of visible update groups in patch notes (default: 5) */
  maxVisibleUpdates?: number
  /** Additional CSS classes */
  className?: string
  /** Locale for translations (default: "en") */
  locale?: Locale
  /** Maximum height for cards (default: "600px") */
  maxHeight?: string
}

/**
 * Container animation variants with staggered children
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

/**
 * Card animation variants with fade and slide effects
 */
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut"
    }
  }
}

/**
 * Error fallback UI component
 */
function ErrorFallback({ message, locale = "en" }: { message?: string; locale?: Locale }) {
  const translations = useNewsTranslations(locale)
  const t = translations.error

  return (
    <div
      className={cn(
        "error-state flex flex-col items-center justify-center",
        "py-12 px-6 text-center"
      )}
      role="alert"
      aria-live="polite"
    >
      <AlertCircle className="error-icon w-12 h-12 text-red-400 mb-4" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-gray-200 mb-2">{t.title}</h3>
      <p className="text-sm text-gray-400">{message || t.defaultMessage}</p>
    </div>
  )
}

/**
 * News Updates Section Component
 * 
 * Main container component that displays game patch notes and known issues
 * in a two-column card layout (desktop) or stacked layout (mobile).
 * 
 * Features:
 * - Responsive two-column grid layout
 * - Animated card entry with staggered children
 * - Error boundary with fallback UI
 * - Accessibility support with ARIA labels
 * - Thai language support
 * 
 * @example
 * ```tsx
 * <NewsUpdatesSection 
 *   patchData={patchData}
 *   maxVisibleUpdates={5}
 *   locale="en"
 * />
 * ```
 */
export function NewsUpdatesSection({
  patchData,
  maxVisibleUpdates = 5,
  className,
  locale: initialLocale = "en",
  maxHeight = "600px"
}: NewsUpdatesSectionProps) {
  const [locale, setLocale] = React.useState<Locale>(initialLocale)

  // Get translations for the specified locale
  const translations = useNewsTranslations(locale)

  // Handle error state (only if error is a non-empty string)
  if (patchData.error && patchData.error.trim().length > 0) {
    return <ErrorFallback message={patchData.error} locale={locale} />
  }

  // Handle empty state
  const hasKnownIssues = patchData.knownIssues.length > 0
  const hasUpdates = patchData.updates.length > 0

  if (!hasKnownIssues && !hasUpdates) {
    return (
      <div
        className="flex items-center justify-center py-12 text-gray-400 text-sm"
        role="status"
        aria-live="polite"
      >
        {translations.section.noData}
      </div>
    )
  }

  return (
    <motion.div
      className={cn(
        "news-updates-section w-full",
        className
      )}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      role="region"
      aria-label={translations.section.title}
    >
      {/* Two-column grid layout for desktop, stacked for mobile */}
      <div
        className={cn(
          "news-updates-grid",
          "grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6"
        )}
      >
        {/* Known Issues Card - Left column on desktop, first on mobile */}
        <motion.div variants={cardVariants}>
          <KnownIssuesCard
            issues={patchData.knownIssues}
            maxHeight={maxHeight}
            locale={locale}
            onLocaleChange={setLocale}
          />
        </motion.div>

        {/* Patch Notes Card - Right column on desktop, second on mobile */}
        <motion.div variants={cardVariants}>
          <PatchNotesCard
            updates={patchData.updates}
            maxHeight={maxHeight}
            locale={locale}
            maxVisibleUpdates={maxVisibleUpdates}
            showMoreButton={true}
            onLocaleChange={setLocale}
          />
        </motion.div>
      </div>

      {/* Social Media Feeds Section */}
      <motion.div
        variants={cardVariants}
        className="mt-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Twitter Feed */}
          <TwitterCard />

          {/* Reddit Feed */}
          <RedditCard />

          {/* Facebook Page */}
          <FacebookCard />
        </div>
      </motion.div>
    </motion.div>
  )
}

