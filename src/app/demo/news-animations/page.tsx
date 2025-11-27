"use client"

import React from 'react'
import { NewsUpdatesSection } from '@/components/news/news-updates-section'
import { KnownIssuesCard } from '@/components/news/known-issues-card'
import { PatchNotesCard } from '@/components/news/patch-notes-card'
import { UpdateCard } from '@/components/ui/update-card'
import { PatchData, KnownIssue, UpdateGroup } from '@/lib/patch-data'

/**
 * Animation Demo Page
 * 
 * This page demonstrates all the animations implemented for the News Updates Section:
 * 1. Card entry animations with fade and slide effects
 * 2. Item hover animations with translateX and background color transitions
 * 3. Smooth scrolling behavior for card content areas
 * 4. Elevation animation on card hover
 * 5. Staggered animations for list items
 * 6. Performance optimizations using CSS transforms
 */
export default function NewsAnimationsDemo() {
  const mockPatchData: PatchData = {
    knownIssues: [
      {
        id: 'issue-1',
        description: 'In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause the launch point of homing arrows to be positioned incorrectly after charging.',
        highlightedTerms: ['Longbow: Embla Inflorescence']
      },
      {
        id: 'issue-2',
        description: 'The [Eclosion] effect bonus may not apply immediately in certain situations.',
        highlightedTerms: ['Eclosion']
      },
      {
        id: 'issue-3',
        description: 'Players may experience frame drops when using [Resonance Skills] in crowded areas.',
        highlightedTerms: ['Resonance Skills']
      },
      {
        id: 'issue-4',
        description: 'The [Grappling Hook] may fail to attach to certain surfaces in the [Icelake] region.',
        highlightedTerms: ['Grappling Hook', 'Icelake']
      },
      {
        id: 'issue-5',
        description: 'Audio may cut out when switching between [Weapon Sets] during combat.',
        highlightedTerms: ['Weapon Sets']
      }
    ],
    updates: [
      {
        date: '2025-11-22',
        displayDate: 'Update Details - 2025-11-22',
        notes: [
          {
            id: 'note-1',
            description: 'Fixed an issue where the pick-up range bonus from the [Eclosion] effect would not apply immediately.',
            highlightedTerms: ['Eclosion'],
            type: 'fix'
          },
          {
            id: 'note-2',
            description: 'Optimized performance for [Resonance Skills] in crowded areas.',
            highlightedTerms: ['Resonance Skills'],
            type: 'optimization'
          },
          {
            id: 'note-3',
            description: 'Fixed collision detection for [Grappling Hook] in various regions.',
            highlightedTerms: ['Grappling Hook'],
            type: 'fix'
          }
        ]
      },
      {
        date: '2025-11-20',
        displayDate: 'Update Details - 2025-11-20',
        notes: [
          {
            id: 'note-4',
            description: 'Fixed audio issues when switching [Weapon Sets].',
            highlightedTerms: ['Weapon Sets'],
            type: 'fix'
          },
          {
            id: 'note-5',
            description: 'Improved UI responsiveness in the [Inventory] menu.',
            highlightedTerms: ['Inventory'],
            type: 'optimization'
          }
        ]
      },
      {
        date: '2025-11-18',
        displayDate: 'Update Details - 2025-11-18',
        notes: [
          {
            id: 'note-6',
            description: 'Fixed a bug where [Quest Markers] would disappear after fast travel.',
            highlightedTerms: ['Quest Markers'],
            type: 'fix'
          }
        ]
      }
    ],
    lastUpdated: '2025-11-22T00:00:00Z'
  }

  const [showSection, setShowSection] = React.useState(true)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-white">
            News Updates Section - Animation Demo
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            This page demonstrates all animations implemented for the News Updates Section.
            Watch for card entry animations, hover effects, smooth scrolling, and elevation changes.
          </p>
          
          {/* Controls */}
          <div className="flex justify-center gap-4 pt-4">
            <button
              onClick={() => setShowSection(!showSection)}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              {showSection ? 'Hide Section' : 'Show Section'} (Test Entry Animation)
            </button>
          </div>
        </div>

        {/* Animation Features List */}
        <div className="bg-card border border-white/10 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Animation Features</h2>
          <ul className="space-y-2 text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Card Entry Animations:</strong> Cards fade in and slide up with staggered timing (0.1s delay between cards)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Item Hover Effects:</strong> Hover over any issue or patch note to see translateX (4px) and background color transitions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Card Elevation:</strong> Hover over cards to see elevation animation (translateY: -4px)</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Smooth Scrolling:</strong> Scroll within cards to experience smooth scroll behavior</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Staggered List Items:</strong> Items animate in with 0.05s stagger delay</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-400 mt-1">✓</span>
              <span><strong>Performance Optimized:</strong> Uses CSS transforms and willChange for GPU acceleration</span>
            </li>
          </ul>
        </div>

        {/* Main Demo Section */}
        {showSection && (
          <div className="space-y-8">
            <h2 className="text-2xl font-semibold text-white">Full Section</h2>
            <NewsUpdatesSection patchData={mockPatchData} />
          </div>
        )}

        {/* Individual Component Demos */}
        <div className="space-y-8">
          <h2 className="text-2xl font-semibold text-white">Individual Components</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Known Issues Card</h3>
              <KnownIssuesCard issues={mockPatchData.knownIssues} maxHeight="400px" />
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">Patch Notes Card</h3>
              <PatchNotesCard 
                updates={mockPatchData.updates} 
                maxHeight="400px"
                maxVisibleUpdates={2}
                showMoreButton={true}
              />
            </div>
          </div>
        </div>

        {/* Base Card Demo */}
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-white">Base Update Card</h2>
          <UpdateCard title="Hover Me!" maxHeight="200px">
            <p className="text-gray-300">
              This is the base UpdateCard component. Hover over it to see the elevation animation.
              The card will lift up by 4px with smooth easing.
            </p>
            <p className="text-gray-300 mt-4">
              Scroll down to test smooth scrolling behavior...
            </p>
            <div className="h-64 flex items-end">
              <p className="text-gray-400 text-sm">
                You've reached the bottom! Notice the smooth scroll behavior.
              </p>
            </div>
          </UpdateCard>
        </div>

        {/* Performance Notes */}
        <div className="bg-card border border-white/10 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Performance Optimizations</h2>
          <div className="space-y-3 text-gray-300">
            <p>
              <strong className="text-white">GPU Acceleration:</strong> All animations use CSS transforms (translateX, translateY) 
              and opacity, which are GPU-accelerated properties.
            </p>
            <p>
              <strong className="text-white">willChange Property:</strong> Cards use <code className="bg-black/30 px-2 py-1 rounded">willChange: "transform, opacity"</code> 
              to hint the browser about upcoming animations.
            </p>
            <p>
              <strong className="text-white">React.memo:</strong> Item components (IssueItem, PatchNoteItem) are memoized 
              to prevent unnecessary re-renders.
            </p>
            <p>
              <strong className="text-white">Smooth Scrolling:</strong> Uses <code className="bg-black/30 px-2 py-1 rounded">scroll-behavior: smooth</code> 
              for native smooth scrolling without JavaScript.
            </p>
            <p>
              <strong className="text-white">Reduced Motion:</strong> Respects user's <code className="bg-black/30 px-2 py-1 rounded">prefers-reduced-motion</code> 
              setting for accessibility.
            </p>
          </div>
        </div>

        {/* Animation Timing Reference */}
        <div className="bg-card border border-white/10 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-white mb-4">Animation Timing Reference</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold text-white mb-2">Entry Animations</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Card fade/slide: 0.5s easeOut</li>
                <li>• Container stagger: 0.1s delay</li>
                <li>• Item stagger: 0.05s delay</li>
                <li>• Item entry: 0.3s easeOut</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Hover Animations</h3>
              <ul className="space-y-1 text-gray-300">
                <li>• Item hover: 0.2s easeInOut</li>
                <li>• Card elevation: 0.2s easeOut</li>
                <li>• TranslateX: 4px</li>
                <li>• TranslateY: -4px (cards)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
