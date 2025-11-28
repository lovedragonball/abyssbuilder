"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { UpdateCard } from "@/components/ui/update-card"
import { KnownIssue } from "@/lib/patch-data"
import { cn } from "@/lib/utils"
import { useNewsTranslations, type Locale } from "@/lib/i18n/news-translations"

export interface KnownIssuesCardProps {
  issues: KnownIssue[]
  maxHeight?: string
  className?: string
  locale?: Locale
  onLocaleChange?: (locale: Locale) => void
}

/**
 * Highlights bracketed terms in text by wrapping them in styled spans
 * @param text - The text to process
 * @param terms - Array of terms to highlight
 * @returns React nodes with highlighted terms
 */
function highlightTerms(text: string, terms: string[]): React.ReactNode {
  if (!terms || terms.length === 0) {
    return text
  }

  // Create a regex pattern that matches any of the bracketed terms
  const pattern = /\[([^\]]+)\]/g
  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Add the highlighted term
    parts.push(
      <span
        key={`term-${match.index}`}
        className="highlighted-term inline-block px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-medium"
      >
        {match[0]}
      </span>
    )

    lastIndex = pattern.lastIndex
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? parts : text
}

/**
 * Item animation variants for smooth hover effects
 */
const itemVariants = {
  rest: { 
    x: 0, 
    backgroundColor: "rgba(255, 255, 255, 0.03)",
    transition: { duration: 0.2, ease: "easeInOut" }
  },
  hover: { 
    x: 4, 
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    transition: { duration: 0.2, ease: "easeInOut" }
  }
}

/**
 * Individual issue item component with hover effects
 */
const IssueItem = React.memo(({ issue, index, locale }: { issue: KnownIssue; index: number; locale: Locale }) => {
  const englishText = issue.description
  const thaiText = issue.translations?.th?.trim() || ""
  const showThai = locale === "th" && thaiText.length > 0
  const displayLang: Locale = showThai ? "th" : "en"
  const displayText = showThai ? thaiText : englishText
  const accessibleText = displayText || englishText

  return (
    <motion.div
      className={cn(
        "update-item flex gap-3 p-3 mb-2 rounded-lg",
        "cursor-default",
        "focus-within:ring-2 focus-within:ring-cyan-500/50 focus-within:outline-none"
      )}
      variants={itemVariants}
      initial="rest"
      whileHover="hover"
      style={{ willChange: "transform, background-color" }}
      role="listitem"
      tabIndex={0}
      aria-label={`Known issue ${index + 1}: ${accessibleText}`}
    >
      <span
        className="item-icon text-yellow-400 text-base flex-shrink-0 mt-0.5"
        aria-hidden="true"
      >
        ✧
      </span>
      <p
        className="item-description text-gray-100 text-sm leading-relaxed"
        lang={displayLang}
      >
        {highlightTerms(displayText, issue.highlightedTerms)}
      </p>
    </motion.div>
  )
})
IssueItem.displayName = "IssueItem"

/**
 * Container animation variants for staggered children
 */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1
    }
  }
}

/**
 * Item entry animation variants
 */
const itemEntryVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

/**
 * Known Issues Card Component
 * Displays a list of known game issues that are still unresolved
 * 
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const KnownIssuesCard = React.memo(function KnownIssuesCard({
  issues,
  maxHeight = "600px",
  className,
  locale = "en",
  onLocaleChange
}: KnownIssuesCardProps) {
  // Get translations for the specified locale
  const translations = useNewsTranslations(locale)
  const t = translations.knownIssues

  const languageSwitcher = onLocaleChange && (
    <div className="flex items-center gap-1 bg-gray-900/50 rounded-lg p-0.5">
      <button
        onClick={() => onLocaleChange('en')}
        className={cn(
          "px-2.5 py-1 rounded text-xs font-medium transition-colors",
          locale === 'en'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:text-gray-200'
        )}
      >
        EN
      </button>
      <button
        onClick={() => onLocaleChange('th')}
        className={cn(
          "px-2.5 py-1 rounded text-xs font-medium transition-colors",
          locale === 'th'
            ? 'bg-gray-700 text-white'
            : 'text-gray-400 hover:text-gray-200'
        )}
      >
        TH
      </button>
    </div>
  )

  return (
    <UpdateCard
      title={t.title}
      maxHeight={maxHeight}
      className={className}
      headerActions={languageSwitcher}
      role="region"
      aria-label={t.title}
    >
      {issues.length === 0 ? (
        <motion.div 
          className="flex items-center justify-center py-8 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          role="status"
          aria-live="polite"
        >
          {t.empty}
        </motion.div>
      ) : (
        <motion.div 
          role="list" 
          aria-label={`Known issues list with ${issues.length} ${issues.length === 1 ? 'item' : 'items'}`}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {issues.map((issue, index) => (
            <motion.div key={issue.id} variants={itemEntryVariants}>
              <IssueItem issue={issue} index={index} locale={locale} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </UpdateCard>
  )
})
