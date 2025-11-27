"use client"

import React from "react"
import { PatchNotesCard } from "@/components/news/patch-notes-card"
import { UpdateGroup } from "@/lib/patch-data"

const mockUpdates: UpdateGroup[] = [
  {
    date: "2025-11-22",
    displayDate: "Update Details - 2025-11-22",
    notes: [
      {
        id: "fix-1",
        description:
          "Fixed an issue where the pick-up range bonus from the [Eclosion] effect would not apply immediately.",
        highlightedTerms: ["Eclosion"],
        type: "fix",
      },
      {
        id: "fix-2",
        description:
          "Fixed an issue where the [Longbow: Embla Inflorescence] damage calculation was incorrect after charging.",
        highlightedTerms: ["Longbow: Embla Inflorescence"],
        type: "fix",
      },
      {
        id: "fix-3",
        description:
          "Fixed an issue where [Character Models] would not render correctly in certain lighting conditions.",
        highlightedTerms: ["Character Models"],
        type: "fix",
      },
    ],
  },
  {
    date: "2025-11-20",
    displayDate: "Update Details - 2025-11-20",
    notes: [
      {
        id: "fix-4",
        description: "Optimized performance for large maps with many entities.",
        highlightedTerms: [],
        type: "optimization",
      },
      {
        id: "fix-5",
        description:
          "Fixed an issue where [Co-op Commissions] would fail to load properly.",
        highlightedTerms: ["Co-op Commissions"],
        type: "fix",
      },
    ],
  },
  {
    date: "2025-11-18",
    displayDate: "Update Details - 2025-11-18",
    notes: [
      {
        id: "fix-6",
        description:
          "Fixed rendering issues with [Weapon Effects] during combat.",
        highlightedTerms: ["Weapon Effects"],
        type: "fix",
      },
      {
        id: "fix-7",
        description:
          "Fixed an issue where [Quest Markers] would disappear after fast travel.",
        highlightedTerms: ["Quest Markers"],
        type: "fix",
      },
    ],
  },
  {
    date: "2025-11-15",
    displayDate: "Update Details - 2025-11-15",
    notes: [
      {
        id: "fix-8",
        description: "Improved server stability during peak hours.",
        highlightedTerms: [],
        type: "optimization",
      },
    ],
  },
  {
    date: "2025-11-12",
    displayDate: "Update Details - 2025-11-12",
    notes: [
      {
        id: "fix-9",
        description:
          "Fixed an issue where [Inventory System] would not save changes correctly.",
        highlightedTerms: ["Inventory System"],
        type: "fix",
      },
    ],
  },
  {
    date: "2025-11-10",
    displayDate: "Update Details - 2025-11-10",
    notes: [
      {
        id: "fix-10",
        description:
          "Fixed an issue where [Audio Settings] would reset after game restart.",
        highlightedTerms: ["Audio Settings"],
        type: "fix",
      },
    ],
  },
  {
    date: "2025-11-08",
    displayDate: "Update Details - 2025-11-08",
    notes: [
      {
        id: "fix-11",
        description:
          "Fixed collision detection issues in [Dungeon Areas].",
        highlightedTerms: ["Dungeon Areas"],
        type: "fix",
      },
    ],
  },
]

export default function PatchNotesCardDemo() {
  const [locale, setLocale] = React.useState<"en" | "th">("en")
  const [maxVisible, setMaxVisible] = React.useState(5)
  const [showButton, setShowButton] = React.useState(true)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            Patch Notes Card Demo
          </h1>
          <p className="text-gray-400">
            Interactive demo of the PatchNotesCard component
          </p>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 rounded-lg p-6 space-y-4 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Language Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Language
              </label>
              <div className="flex gap-2">
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
            </div>

            {/* Max Visible Updates */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Max Visible Updates: {maxVisible}
              </label>
              <input
                type="range"
                min="1"
                max="10"
                value={maxVisible}
                onChange={(e) => setMaxVisible(Number(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Show More Button Toggle */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Show More Button
              </label>
              <button
                onClick={() => setShowButton(!showButton)}
                className={`w-full px-4 py-2 rounded transition-colors ${
                  showButton
                    ? "bg-green-500 text-white"
                    : "bg-slate-700 text-gray-300 hover:bg-slate-600"
                }`}
              >
                {showButton ? "Enabled" : "Disabled"}
              </button>
            </div>
          </div>
        </div>

        {/* Component Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            Component Preview
          </h2>
          <PatchNotesCard
            updates={mockUpdates}
            locale={locale}
            maxVisibleUpdates={maxVisible}
            showMoreButton={showButton}
          />
        </div>

        {/* Empty State Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            Empty State Preview
          </h2>
          <PatchNotesCard updates={[]} locale={locale} />
        </div>

        {/* Single Update Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">
            Single Update Preview
          </h2>
          <PatchNotesCard
            updates={[mockUpdates[0]]}
            locale={locale}
            showMoreButton={false}
          />
        </div>

        {/* Features List */}
        <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
          <h2 className="text-xl font-semibold text-white mb-4">Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Updates grouped by date with clear headers</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Highlighted bracketed terms (e.g., [Eclosion])</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Smooth hover animations on items</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Scrollable content with custom scrollbar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>"Show More" button for viewing additional updates</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Thai language support</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Proper ARIA labels and accessibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Empty state handling</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
