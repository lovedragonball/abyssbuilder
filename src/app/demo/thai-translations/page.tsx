"use client"

import * as React from "react"
import { NewsUpdatesSection } from "@/components/news/news-updates-section"
import { KnownIssuesCard } from "@/components/news/known-issues-card"
import { PatchNotesCard } from "@/components/news/patch-notes-card"
import { PatchData } from "@/lib/patch-data"
import { Button } from "@/components/ui/button"
import { type Locale } from "@/lib/i18n/news-translations"

/**
 * Sample patch data for testing
 */
const samplePatchData: PatchData = {
  knownIssues: [
    {
      id: "issue-1",
      description: "In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause the launch point of homing arrows to be positioned incorrectly after charging.",
      highlightedTerms: ["Longbow: Embla Inflorescence"]
    },
    {
      id: "issue-2",
      description: "The [Eclosion] effect may not apply immediately in certain situations.",
      highlightedTerms: ["Eclosion"]
    },
    {
      id: "issue-3",
      description: "Players may experience frame drops when using [Catalyst: Stellar Symphony] in crowded areas.",
      highlightedTerms: ["Catalyst: Stellar Symphony"]
    }
  ],
  updates: [
    {
      date: "2025-11-22",
      displayDate: "Update Details - 2025-11-22",
      notes: [
        {
          id: "fix-1",
          description: "Fixed an issue where the pick-up range bonus from the [Eclosion] effect would not apply immediately.",
          highlightedTerms: ["Eclosion"],
          type: "fix"
        },
        {
          id: "fix-2",
          description: "Fixed a bug where [Longbow: Embla Inflorescence] arrows would miss targets at long range.",
          highlightedTerms: ["Longbow: Embla Inflorescence"],
          type: "fix"
        }
      ]
    },
    {
      date: "2025-11-20",
      displayDate: "Update Details - 2025-11-20",
      notes: [
        {
          id: "fix-3",
          description: "Optimized performance for [Catalyst: Stellar Symphony] to reduce frame drops.",
          highlightedTerms: ["Catalyst: Stellar Symphony"],
          type: "optimization"
        },
        {
          id: "fix-4",
          description: "Fixed collision detection issues in [Galea Theater] dungeon.",
          highlightedTerms: ["Galea Theater"],
          type: "fix"
        }
      ]
    }
  ],
  lastUpdated: "2025-11-22T00:00:00Z"
}

/**
 * Thai Translations Demo Page
 * Tests the i18n implementation with Thai language support
 */
export default function ThaiTranslationsDemo() {
  const [locale, setLocale] = React.useState<Locale>("en")

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            Thai Translations Demo
          </h1>
          <p className="text-gray-400 mb-6">
            Test the i18n implementation with English and Thai language support.
            Toggle between languages to see the translations in action.
          </p>

          {/* Language Toggle */}
          <div className="flex gap-4 items-center">
            <span className="text-gray-300 font-medium">Language:</span>
            <Button
              variant={locale === "en" ? "default" : "outline"}
              onClick={() => setLocale("en")}
              className="min-w-[100px]"
            >
              English
            </Button>
            <Button
              variant={locale === "th" ? "default" : "outline"}
              onClick={() => setLocale("th")}
              className="min-w-[100px]"
            >
              ไทย (Thai)
            </Button>
          </div>
        </div>

        {/* Full Section Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Full News Updates Section
          </h2>
          <NewsUpdatesSection
            patchData={samplePatchData}
            locale={locale}
            maxVisibleUpdates={5}
          />
        </section>

        {/* Individual Card Demos */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Individual Card Components
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Known Issues Card */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Known Issues Card
              </h3>
              <KnownIssuesCard
                issues={samplePatchData.knownIssues}
                locale={locale}
                maxHeight="400px"
              />
            </div>

            {/* Patch Notes Card */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Patch Notes Card
              </h3>
              <PatchNotesCard
                updates={samplePatchData.updates}
                locale={locale}
                maxHeight="400px"
                maxVisibleUpdates={3}
              />
            </div>
          </div>
        </section>

        {/* Empty State Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Empty State
          </h2>
          <NewsUpdatesSection
            patchData={{
              knownIssues: [],
              updates: [],
              lastUpdated: new Date().toISOString()
            }}
            locale={locale}
          />
        </section>

        {/* Error State Demo */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Error State
          </h2>
          <NewsUpdatesSection
            patchData={{
              knownIssues: [],
              updates: [],
              lastUpdated: new Date().toISOString(),
              error: "Failed to load patch data"
            }}
            locale={locale}
          />
        </section>

        {/* Font Display Test */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">
            Thai Font Display Test
          </h2>
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Thai Characters
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)
              </p>
              <p className="text-gray-300 text-base leading-relaxed">
                บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)
              </p>
              <p className="text-gray-300 text-base leading-relaxed">
                ไม่มีปัญหาที่ทราบในขณะนี้
              </p>
              <p className="text-gray-300 text-base leading-relaxed">
                แสดงเพิ่มเติม / แสดงน้อยลง
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Mixed Content (Thai + English)
              </h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Fixed an issue with [Longbow: Embla Inflorescence] - แก้ไขปัญหาเกี่ยวกับ [Longbow: Embla Inflorescence]
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-cyan-400 mb-2">
                Font Sizes
              </h3>
              <p className="text-gray-300 text-xs leading-relaxed mb-2">
                ขนาดตัวอักษรเล็ก (text-xs) - Small font size
              </p>
              <p className="text-gray-300 text-sm leading-relaxed mb-2">
                ขนาดตัวอักษรปกติ (text-sm) - Normal font size
              </p>
              <p className="text-gray-300 text-base leading-relaxed mb-2">
                ขนาดตัวอักษรใหญ่ (text-base) - Large font size
              </p>
              <p className="text-gray-300 text-lg leading-relaxed">
                ขนาดตัวอักษรใหญ่มาก (text-lg) - Extra large font size
              </p>
            </div>
          </div>
        </section>

        {/* Implementation Notes */}
        <section className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            Implementation Notes
          </h2>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-cyan-400">Translation Files:</strong> Located in{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">public/locales/[locale]/news.json</code>
            </p>
            <p>
              <strong className="text-cyan-400">Translation Utility:</strong> Located in{" "}
              <code className="bg-gray-700 px-2 py-1 rounded">src/lib/i18n/news-translations.ts</code>
            </p>
            <p>
              <strong className="text-cyan-400">Supported Locales:</strong> English (en), Thai (th)
            </p>
            <p>
              <strong className="text-cyan-400">Font Support:</strong> Thai characters are rendered using the system font stack
            </p>
            <p>
              <strong className="text-cyan-400">Usage:</strong> Pass the <code className="bg-gray-700 px-2 py-1 rounded">locale</code> prop to any news component
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
