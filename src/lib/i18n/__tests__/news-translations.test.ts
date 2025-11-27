/**
 * Tests for news translations utility
 */

import { getNewsTranslations, useNewsTranslations, type Locale } from '../news-translations'

describe('News Translations', () => {
  describe('getNewsTranslations', () => {
    it('should return English translations by default', () => {
      const translations = getNewsTranslations()
      
      expect(translations.knownIssues.title).toBe('Known Issues (Still Unresolved)')
      expect(translations.patchNotes.title).toBe('Patch Notes (Bug Fixes and Improvements)')
      expect(translations.section.title).toBe('Game News and Updates')
    })

    it('should return English translations when locale is "en"', () => {
      const translations = getNewsTranslations('en')
      
      expect(translations.knownIssues.title).toBe('Known Issues (Still Unresolved)')
      expect(translations.knownIssues.empty).toBe('No known issues at this time')
      expect(translations.patchNotes.showMore).toBe('Show More')
      expect(translations.patchNotes.showLess).toBe('Show Less')
    })

    it('should return Thai translations when locale is "th"', () => {
      const translations = getNewsTranslations('th')
      
      expect(translations.knownIssues.title).toBe('ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)')
      expect(translations.knownIssues.empty).toBe('ไม่มีปัญหาที่ทราบในขณะนี้')
      expect(translations.patchNotes.title).toBe('บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)')
      expect(translations.patchNotes.showMore).toBe('แสดงเพิ่มเติม')
      expect(translations.patchNotes.showLess).toBe('แสดงน้อยลง')
    })

    it('should have all required translation keys for English', () => {
      const translations = getNewsTranslations('en')
      
      // Known Issues
      expect(translations.knownIssues).toHaveProperty('title')
      expect(translations.knownIssues).toHaveProperty('empty')
      
      // Patch Notes
      expect(translations.patchNotes).toHaveProperty('title')
      expect(translations.patchNotes).toHaveProperty('empty')
      expect(translations.patchNotes).toHaveProperty('showMore')
      expect(translations.patchNotes).toHaveProperty('showLess')
      expect(translations.patchNotes).toHaveProperty('viewAll')
      
      // Section
      expect(translations.section).toHaveProperty('title')
      expect(translations.section).toHaveProperty('noData')
      
      // Error
      expect(translations.error).toHaveProperty('title')
      expect(translations.error).toHaveProperty('defaultMessage')
      expect(translations.error).toHaveProperty('retry')
    })

    it('should have all required translation keys for Thai', () => {
      const translations = getNewsTranslations('th')
      
      // Known Issues
      expect(translations.knownIssues).toHaveProperty('title')
      expect(translations.knownIssues).toHaveProperty('empty')
      
      // Patch Notes
      expect(translations.patchNotes).toHaveProperty('title')
      expect(translations.patchNotes).toHaveProperty('empty')
      expect(translations.patchNotes).toHaveProperty('showMore')
      expect(translations.patchNotes).toHaveProperty('showLess')
      expect(translations.patchNotes).toHaveProperty('viewAll')
      
      // Section
      expect(translations.section).toHaveProperty('title')
      expect(translations.section).toHaveProperty('noData')
      
      // Error
      expect(translations.error).toHaveProperty('title')
      expect(translations.error).toHaveProperty('defaultMessage')
      expect(translations.error).toHaveProperty('retry')
    })

    it('should return non-empty strings for all translations', () => {
      const locales: Locale[] = ['en', 'th']
      
      locales.forEach(locale => {
        const translations = getNewsTranslations(locale)
        
        // Check all translation values are non-empty strings
        expect(translations.knownIssues.title).toBeTruthy()
        expect(translations.knownIssues.empty).toBeTruthy()
        expect(translations.patchNotes.title).toBeTruthy()
        expect(translations.patchNotes.empty).toBeTruthy()
        expect(translations.patchNotes.showMore).toBeTruthy()
        expect(translations.patchNotes.showLess).toBeTruthy()
        expect(translations.patchNotes.viewAll).toBeTruthy()
        expect(translations.section.title).toBeTruthy()
        expect(translations.section.noData).toBeTruthy()
        expect(translations.error.title).toBeTruthy()
        expect(translations.error.defaultMessage).toBeTruthy()
        expect(translations.error.retry).toBeTruthy()
      })
    })
  })

  describe('useNewsTranslations', () => {
    it('should return the same result as getNewsTranslations', () => {
      const locales: Locale[] = ['en', 'th']
      
      locales.forEach(locale => {
        const fromGet = getNewsTranslations(locale)
        const fromUse = useNewsTranslations(locale)
        
        expect(fromUse).toEqual(fromGet)
      })
    })

    it('should return English translations by default', () => {
      const translations = useNewsTranslations()
      
      expect(translations.knownIssues.title).toBe('Known Issues (Still Unresolved)')
    })
  })

  describe('Translation Consistency', () => {
    it('should have matching structure between English and Thai translations', () => {
      const enTranslations = getNewsTranslations('en')
      const thTranslations = getNewsTranslations('th')
      
      // Check that both have the same keys
      expect(Object.keys(enTranslations)).toEqual(Object.keys(thTranslations))
      expect(Object.keys(enTranslations.knownIssues)).toEqual(Object.keys(thTranslations.knownIssues))
      expect(Object.keys(enTranslations.patchNotes)).toEqual(Object.keys(thTranslations.patchNotes))
      expect(Object.keys(enTranslations.section)).toEqual(Object.keys(thTranslations.section))
      expect(Object.keys(enTranslations.error)).toEqual(Object.keys(thTranslations.error))
    })

    it('should not have any undefined or null values', () => {
      const locales: Locale[] = ['en', 'th']
      
      locales.forEach(locale => {
        const translations = getNewsTranslations(locale)
        
        // Recursively check all values
        const checkValues = (obj: any) => {
          Object.values(obj).forEach(value => {
            if (typeof value === 'object') {
              checkValues(value)
            } else {
              expect(value).not.toBeUndefined()
              expect(value).not.toBeNull()
            }
          })
        }
        
        checkValues(translations)
      })
    })
  })

  describe('Thai Character Support', () => {
    it('should contain valid Thai characters in Thai translations', () => {
      const translations = getNewsTranslations('th')
      
      // Thai Unicode range: \u0E00-\u0E7F
      const thaiCharRegex = /[\u0E00-\u0E7F]/
      
      expect(thaiCharRegex.test(translations.knownIssues.title)).toBe(true)
      expect(thaiCharRegex.test(translations.knownIssues.empty)).toBe(true)
      expect(thaiCharRegex.test(translations.patchNotes.title)).toBe(true)
      expect(thaiCharRegex.test(translations.patchNotes.showMore)).toBe(true)
    })

    it('should properly encode Thai characters', () => {
      const translations = getNewsTranslations('th')
      
      // Ensure strings can be properly encoded and decoded
      const testString = translations.knownIssues.title
      const encoded = encodeURIComponent(testString)
      const decoded = decodeURIComponent(encoded)
      
      expect(decoded).toBe(testString)
    })
  })
})
