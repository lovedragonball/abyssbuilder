/**
 * News translations utility
 * Provides a lightweight i18n solution for the news section
 */

export type Locale = 'en' | 'th'

export interface NewsTranslations {
  knownIssues: {
    title: string
    empty: string
  }
  patchNotes: {
    title: string
    empty: string
    showMore: string
    showLess: string
    viewAll: string
  }
  section: {
    title: string
    noData: string
  }
  error: {
    title: string
    defaultMessage: string
    retry: string
  }
}

/**
 * English translations
 */
const enTranslations: NewsTranslations = {
  knownIssues: {
    title: "Known Issues (Still Unresolved)",
    empty: "No known issues at this time"
  },
  patchNotes: {
    title: "Patch Notes (Bug Fixes and Improvements)",
    empty: "No recent updates",
    showMore: "Show More",
    showLess: "Show Less",
    viewAll: "View All"
  },
  section: {
    title: "Game News and Updates",
    noData: "No updates available"
  },
  error: {
    title: "Unable to load patch notes",
    defaultMessage: "Please try again later.",
    retry: "Retry"
  }
}

/**
 * Thai translations
 */
const thTranslations: NewsTranslations = {
  knownIssues: {
    title: "ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)",
    empty: "ไม่มีปัญหาที่ทราบในขณะนี้"
  },
  patchNotes: {
    title: "บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)",
    empty: "ไม่มีการอัปเดตล่าสุด",
    showMore: "แสดงเพิ่มเติม",
    showLess: "แสดงน้อยลง",
    viewAll: "ดูทั้งหมด"
  },
  section: {
    title: "ข่าวสารและการอัปเดตเกม",
    noData: "ไม่มีข้อมูลอัปเดต"
  },
  error: {
    title: "ไม่สามารถโหลดบันทึกการแก้ไขได้",
    defaultMessage: "โปรดลองอีกครั้งในภายหลัง",
    retry: "ลองอีกครั้ง"
  }
}

/**
 * Translation map
 */
const translations: Record<Locale, NewsTranslations> = {
  en: enTranslations,
  th: thTranslations
}

/**
 * Get translations for a specific locale
 * @param locale - The locale to get translations for
 * @returns The translations object for the specified locale
 */
export function getNewsTranslations(locale: Locale = 'en'): NewsTranslations {
  return translations[locale] || translations.en
}

/**
 * Hook-like function to get translations (for consistency with React patterns)
 * @param locale - The locale to use
 * @returns The translations object
 */
export function useNewsTranslations(locale: Locale = 'en'): NewsTranslations {
  return getNewsTranslations(locale)
}
