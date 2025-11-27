"use client"

import { KnownIssuesCard } from "@/components/news/known-issues-card"
import { KnownIssue } from "@/lib/patch-data"

const mockIssues: KnownIssue[] = [
  {
    id: 'issue-1',
    description: 'In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause the launch point of homing arrows to be positioned incorrectly after charging.',
    highlightedTerms: ['Longbow: Embla Inflorescence'],
  },
  {
    id: 'issue-2',
    description: 'The [Eclosion] effect may not apply immediately in certain situations.',
    highlightedTerms: ['Eclosion'],
  },
  {
    id: 'issue-3',
    description: 'Players may experience lag when using [Skill: Rapid Fire] and [Weapon: Thunder Bow] simultaneously.',
    highlightedTerms: ['Skill: Rapid Fire', 'Weapon: Thunder Bow'],
  },
  {
    id: 'issue-4',
    description: 'The [Character: Aria] ultimate ability may not trigger correctly when used with [Artifact: Time Crystal].',
    highlightedTerms: ['Character: Aria', 'Artifact: Time Crystal'],
  },
  {
    id: 'issue-5',
    description: 'In certain maps, the [Teleport Point] may become inaccessible after completing specific quests.',
    highlightedTerms: ['Teleport Point'],
  },
  {
    id: 'issue-6',
    description: 'The [Co-op Mode] matchmaking system may fail to connect players in some regions.',
    highlightedTerms: ['Co-op Mode'],
  },
  {
    id: 'issue-7',
    description: 'Using [Consumable: Energy Potion] during combat may cause a brief animation freeze.',
    highlightedTerms: ['Consumable: Energy Potion'],
  },
  {
    id: 'issue-8',
    description: 'The [Quest: Ancient Ruins] may not progress correctly if completed out of order.',
    highlightedTerms: ['Quest: Ancient Ruins'],
  },
]

export default function KnownIssuesCardDemo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-white mb-2">Known Issues Card Demo</h1>
          <p className="text-gray-400">Testing the KnownIssuesCard component with various scenarios</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* English Version */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">English Version</h2>
            <KnownIssuesCard issues={mockIssues} />
          </div>

          {/* Thai Version */}
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Thai Version (ภาษาไทย)</h2>
            <KnownIssuesCard issues={mockIssues} locale="th" />
          </div>
        </div>

        {/* Empty State */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Empty State (English)</h2>
            <KnownIssuesCard issues={[]} />
          </div>

          <div>
            <h2 className="text-2xl font-semibold text-white mb-4">Empty State (Thai)</h2>
            <KnownIssuesCard issues={[]} locale="th" />
          </div>
        </div>

        {/* Custom Height */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Custom Max Height (400px)</h2>
          <div className="max-w-2xl">
            <KnownIssuesCard issues={mockIssues} maxHeight="400px" />
          </div>
        </div>

        {/* Few Issues */}
        <div>
          <h2 className="text-2xl font-semibold text-white mb-4">Few Issues (No Scrolling)</h2>
          <div className="max-w-2xl">
            <KnownIssuesCard issues={mockIssues.slice(0, 3)} />
          </div>
        </div>

        {/* Testing Instructions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Testing Instructions</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Hover over individual issue items to see the hover effect (slight translation and background change)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Verify that bracketed terms like [Longbow: Embla Inflorescence] are highlighted in cyan</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Check that the ✧ icon appears before each issue</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Scroll through the card with many issues to test the custom scrollbar</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Verify Thai language support in the title</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Check empty state messages in both languages</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Test keyboard navigation (Tab through items)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-cyan-400 mt-1">✓</span>
              <span>Verify responsive behavior on mobile (resize browser window)</span>
            </li>
          </ul>
        </div>

        {/* Accessibility Features */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-2xl font-semibold text-white mb-4">Accessibility Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>ARIA role="region" on the card container</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>ARIA label for the card region</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>ARIA role="list" for the issues container</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>ARIA role="listitem" for each issue</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Icons marked with aria-hidden="true"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span>Proper color contrast for text (WCAG AA compliant)</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
