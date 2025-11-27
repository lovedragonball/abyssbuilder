"use client"

import * as React from "react"
import { NewsUpdatesSection } from "@/components/news/news-updates-section"
import { PatchData } from "@/lib/patch-data"

/**
 * Demo page for NewsUpdatesSection component
 * Tests layout, responsiveness, and error states
 */
export default function NewsUpdatesSectionDemo() {
  const [locale, setLocale] = React.useState<"en" | "th">("en")
  const [showError, setShowError] = React.useState(false)
  const [showEmpty, setShowEmpty] = React.useState(false)

  // Mock patch data
  const mockPatchData: PatchData = {
    knownIssues: [
      {
        id: "issue-1",
        description:
          "In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause the launch point of homing arrows to be positioned incorrectly after charging.",
        highlightedTerms: ["Longbow: Embla Inflorescence"]
      },
      {
        id: "issue-2",
        description:
          "When using [Greatsword: Sword of Eternal Flame] in certain conditions, the fire effect may not display correctly.",
        highlightedTerms: ["Greatsword: Sword of Eternal Flame"]
      },
      {
        id: "issue-3",
        description:
          "The [Eclosion] buff icon may occasionally disappear from the status bar even when the effect is still active.",
        highlightedTerms: ["Eclosion"]
      }
    ],
    updates: [
      {
        date: "2025-11-22",
        displayDate: "Update Details - 2025-11-22",
        notes: [
          {
            id: "fix-1",
            description:
              "Fixed an issue where the pick-up range bonus from the [Eclosion] effect would not apply immediately.",
            highlightedTerms: ["Eclosion"],
            type: "fix"
          },
          {
            id: "fix-2",
            description:
              "Fixed a bug where [Dagger: Shadow Strike] would deal incorrect damage in PvP mode.",
            highlightedTerms: ["Dagger: Shadow Strike"],
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
            description:
              "Optimized performance when multiple [Fire Enchantment] effects are active simultaneously.",
            highlightedTerms: ["Fire Enchantment"],
            type: "optimization"
          },
          {
            id: "fix-4",
            description:
              "Fixed an issue where [Healing Potion] cooldown would not reset properly after death.",
            highlightedTerms: ["Healing Potion"],
            type: "fix"
          }
        ]
      },
      {
        date: "2025-11-18",
        displayDate: "Update Details - 2025-11-18",
        notes: [
          {
            id: "fix-5",
            description:
              "Fixed a crash that could occur when entering [Dungeon: Dark Caverns] with a full party.",
            highlightedTerms: ["Dungeon: Dark Caverns"],
            type: "fix"
          }
        ]
      },
      {
        date: "2025-11-15",
        displayDate: "Update Details - 2025-11-15",
        notes: [
          {
            id: "fix-6",
            description:
              "Fixed an issue where [Quest: The Lost Artifact] could not be completed if certain steps were done out of order.",
            highlightedTerms: ["Quest: The Lost Artifact"],
            type: "fix"
          }
        ]
      },
      {
        date: "2025-11-12",
        displayDate: "Update Details - 2025-11-12",
        notes: [
          {
            id: "fix-7",
            description:
              "Improved server stability during peak hours.",
            highlightedTerms: [],
            type: "optimization"
          }
        ]
      },
      {
        date: "2025-11-10",
        displayDate: "Update Details - 2025-11-10",
        notes: [
          {
            id: "fix-8",
            description:
              "Fixed an issue where [Mount: Swift Eagle] would disappear when crossing certain terrain boundaries.",
            highlightedTerms: ["Mount: Swift Eagle"],
            type: "fix"
          }
        ]
      }
    ],
    lastUpdated: "2025-11-22T00:00:00Z"
  }

  const errorPatchData: PatchData = {
    ...mockPatchData,
    error: "Failed to parse patch data from server"
  }

  const emptyPatchData: PatchData = {
    knownIssues: [],
    updates: [],
    lastUpdated: "2025-11-22T00:00:00Z"
  }

  const currentData = showError
    ? errorPatchData
    : showEmpty
    ? emptyPatchData
    : mockPatchData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            News Updates Section Demo
          </h1>
          <p className="text-gray-400">
            Test the responsive layout, animations, and error states
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 rounded-lg p-6 mb-8 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
          
          <div className="flex flex-wrap gap-4">
            {/* Locale Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">Language:</label>
              <button
                onClick={() => setLocale("en")}
                className={`px-4 py-2 rounded transition-colors ${
                  locale === "en"
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLocale("th")}
                className={`px-4 py-2 rounded transition-colors ${
                  locale === "th"
                    ? "bg-cyan-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                ไทย
              </button>
            </div>

            {/* State Toggle */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-300">State:</label>
              <button
                onClick={() => {
                  setShowError(false)
                  setShowEmpty(false)
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  !showError && !showEmpty
                    ? "bg-green-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Normal
              </button>
              <button
                onClick={() => {
                  setShowError(true)
                  setShowEmpty(false)
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  showError
                    ? "bg-red-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Error
              </button>
              <button
                onClick={() => {
                  setShowError(false)
                  setShowEmpty(true)
                }}
                className={`px-4 py-2 rounded transition-colors ${
                  showEmpty
                    ? "bg-yellow-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                Empty
              </button>
            </div>
          </div>
        </div>

        {/* Component Demo */}
        <div className="bg-slate-800/30 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-6">Component Preview</h2>
          
          <NewsUpdatesSection
            patchData={currentData}
            locale={locale}
            maxVisibleUpdates={5}
            maxHeight="600px"
          />
        </div>

        {/* Responsive Testing Guide */}
        <div className="mt-8 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Responsive Testing Guide
          </h2>
          <div className="space-y-2 text-sm text-gray-300">
            <p>
              <strong className="text-cyan-400">Desktop (≥768px):</strong> Two-column
              grid layout with Known Issues on the left and Patch Notes on the right
            </p>
            <p>
              <strong className="text-cyan-400">Mobile (&lt;768px):</strong> Stacked
              layout with Known Issues appearing first
            </p>
            <p>
              <strong className="text-cyan-400">Animations:</strong> Cards should fade
              and slide in with staggered timing
            </p>
            <p>
              <strong className="text-cyan-400">Hover Effects:</strong> Cards should
              elevate on hover (desktop only)
            </p>
          </div>
        </div>

        {/* Accessibility Notes */}
        <div className="mt-8 bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">
            Accessibility Features
          </h2>
          <ul className="space-y-2 text-sm text-gray-300 list-disc list-inside">
            <li>Proper ARIA region role with descriptive label</li>
            <li>Error states use alert role with aria-live</li>
            <li>Empty states use status role</li>
            <li>Keyboard navigation support</li>
            <li>Screen reader friendly content structure</li>
            <li>High contrast text for readability</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
