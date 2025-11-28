"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { UpdateCard } from "@/components/ui/update-card"
import { UpdateGroup, PatchNote } from "@/lib/patch-data"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useNewsTranslations, type Locale } from "@/lib/i18n/news-translations"

export interface PatchNotesCardProps {
  updates: UpdateGroup[]
  maxHeight?: string
  className?: string
  locale?: Locale
  maxVisibleUpdates?: number
  showMoreButton?: boolean
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
 * Individual patch note item component with hover effects
 */
const PatchNoteItem = React.memo(({ note, index, locale }: { note: PatchNote; index: number; locale: Locale }) => {
  const englishText = note.description
  const thaiText = note.translations?.th?.trim() || ""
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
      aria-label={`Patch note ${index + 1}: ${accessibleText}`}
    >
      <span
        className="item-icon text-yellow-400 text-base flex-shrink-0 mt-0.5"
        aria-hidden="true"
      >
        ✦
      </span>
      <p
        className="item-description text-gray-100 text-sm leading-relaxed"
        lang={displayLang}
      >
        {highlightTerms(displayText, note.highlightedTerms)}
      </p>
    </motion.div>
  )
})
PatchNoteItem.displayName = "PatchNoteItem"

/**
 * Date header component for grouping updates
 */
const DateHeader = React.memo(({ displayDate, id }: { displayDate: string; id: string }) => {
  return (
    <h3
      id={id}
      className={cn(
        "date-header text-base font-semibold text-yellow-400",
        "mt-4 mb-3 pb-2 border-b border-yellow-400/20",
        "first:mt-0"
      )}
      role="heading"
      aria-level={3}
    >
      {displayDate}
    </h3>
  )
})
DateHeader.displayName = "DateHeader"

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
 * Group entry animation variants
 */
const groupVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

/**
 * Patch Notes Card Component
 * Displays a list of patch notes grouped by date
 * 
 * Optimized with React.memo to prevent unnecessary re-renders
 */
export const PatchNotesCard = React.memo(function PatchNotesCard({
  updates,
  maxHeight = "600px",
  className,
  locale = "en",
  maxVisibleUpdates = 5,
  showMoreButton = true,
  onLocaleChange
}: PatchNotesCardProps) {
  const [showAll, setShowAll] = React.useState(false)

  // Get translations for the specified locale
  const translations = useNewsTranslations(locale)
  const t = translations.patchNotes

  // Determine which updates to display
  const displayedUpdates = showAll ? updates : updates.slice(0, maxVisibleUpdates)
  const hasMoreUpdates = updates.length > maxVisibleUpdates

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
      {updates.length === 0 ? (
        <motion.div 
          className="flex items-center justify-center py-8 text-gray-400 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {t.empty}
        </motion.div>
      ) : (
        <>
          <motion.div 
            id="patch-notes-list"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {displayedUpdates.map((updateGroup) => {
              const groupId = `update-group-${updateGroup.date}`
              return (
                <motion.div 
                  key={updateGroup.date} 
                  className="update-group"
                  variants={groupVariants}
                  role="region"
                  aria-labelledby={groupId}
                >
                  <DateHeader displayDate={updateGroup.displayDate} id={groupId} />
                  <motion.div 
                    role="list" 
                    aria-label={`${updateGroup.notes.length} ${updateGroup.notes.length === 1 ? 'update' : 'updates'} for ${updateGroup.displayDate}`}
                    variants={containerVariants}
                  >
                    {updateGroup.notes.map((note, index) => (
                      <motion.div key={note.id} variants={itemEntryVariants}>
                        <PatchNoteItem note={note} index={index} locale={locale} />
                      </motion.div>
                    ))}
                  </motion.div>
                </motion.div>
              )
            })}
          </motion.div>

          {showMoreButton && hasMoreUpdates && (
            <motion.div 
              className="mt-4 pt-4 border-t border-white/10 flex justify-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAll(!showAll)}
                className={cn(
                  "text-cyan-400 hover:text-cyan-300",
                  "hover:bg-cyan-500/10 transition-colors",
                  "focus:ring-2 focus:ring-cyan-500/50 focus:outline-none"
                )}
                aria-expanded={showAll}
                aria-controls="patch-notes-list"
                aria-label={showAll ? `${t.showLess}. Currently showing all ${updates.length} updates` : `${t.showMore}. Currently showing ${maxVisibleUpdates} of ${updates.length} updates`}
              >
                {showAll ? t.showLess : t.showMore}
              </Button>
            </motion.div>
          )}
        </>
      )}
    </UpdateCard>
  )
})
