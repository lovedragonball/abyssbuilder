"use client"

import React from 'react';
import { UpdateCard, UpdateCardHeader, UpdateCardTitle, UpdateCardContent } from '@/components/ui/update-card';

export default function UpdateCardDemo() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-white">Update Card Component Demo</h1>
        
        <div className="space-y-8">
          {/* Basic Card with Title */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Basic Card with Title</h2>
            <UpdateCard title="Known Issues (Still Unresolved)">
              <div className="space-y-3">
                <div className="flex gap-3 items-start p-3 rounded-lg bg-white/3 hover:bg-white/8 transition-all hover:translate-x-1">
                  <span className="text-yellow-400 text-lg">✧</span>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    In Co-op Commissions, using the <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Longbow: Embla Inflorescence</span> may cause the launch point of homing arrows to be positioned incorrectly after charging.
                  </p>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-white/3 hover:bg-white/8 transition-all hover:translate-x-1">
                  <span className="text-yellow-400 text-lg">✧</span>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    Some players may experience frame drops when entering <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Galea Theater</span> for the first time.
                  </p>
                </div>
                <div className="flex gap-3 items-start p-3 rounded-lg bg-white/3 hover:bg-white/8 transition-all hover:translate-x-1">
                  <span className="text-yellow-400 text-lg">✧</span>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    The <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Eclosion</span> effect may not trigger correctly in certain edge cases.
                  </p>
                </div>
              </div>
            </UpdateCard>
          </section>

          {/* Card with Custom Max Height and Scrolling */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Card with Scrollable Content</h2>
            <UpdateCard title="Patch Notes (Bug Fixes and Improvements)" maxHeight="300px">
              <div className="space-y-4">
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-2 pb-2 border-b border-yellow-400/20">
                    Update Details - 2025-11-22
                  </h3>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white/3 hover:bg-white/8 transition-all hover:translate-x-1">
                        <span className="text-yellow-400">✦</span>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Fixed an issue where the pick-up range bonus from the <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Eclosion</span> effect would not apply immediately.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-yellow-400 font-semibold mb-2 pb-2 border-b border-yellow-400/20">
                    Update Details - 2025-11-20
                  </h3>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white/3 hover:bg-white/8 transition-all hover:translate-x-1">
                        <span className="text-yellow-400">✦</span>
                        <p className="text-gray-300 text-sm leading-relaxed">
                          Optimized performance in <span className="text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded">Icelake Sewer</span> to reduce lag during intense combat.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </UpdateCard>
          </section>

          {/* Card without Scrollbar */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Card without Custom Scrollbar</h2>
            <UpdateCard title="Simple Updates" showScrollbar={false} maxHeight="200px">
              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white/3 hover:bg-white/8 transition-all hover:translate-x-1">
                    <span className="text-yellow-400">✦</span>
                    <p className="text-gray-300 text-sm">Update item {i}</p>
                  </div>
                ))}
              </div>
            </UpdateCard>
          </section>

          {/* Composed Card */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Composed Card Components</h2>
            <UpdateCard>
              <UpdateCardHeader>
                <UpdateCardTitle>Custom Composed Card</UpdateCardTitle>
                <p className="text-gray-400 text-sm mt-2">This card uses individual components for more control</p>
              </UpdateCardHeader>
              <UpdateCardContent maxHeight="250px">
                <div className="space-y-3">
                  <p className="text-gray-300">This demonstrates using the individual card components:</p>
                  <ul className="list-disc list-inside space-y-2 text-gray-300">
                    <li>UpdateCard (wrapper)</li>
                    <li>UpdateCardHeader</li>
                    <li>UpdateCardTitle</li>
                    <li>UpdateCardContent</li>
                  </ul>
                  <p className="text-gray-300 mt-4">
                    Each component can be styled independently for maximum flexibility.
                  </p>
                </div>
              </UpdateCardContent>
            </UpdateCard>
          </section>

          {/* Two Column Layout */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Two Column Layout (Desktop)</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UpdateCard title="Known Issues">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white/3 hover:bg-white/8 transition-all hover:translate-x-1">
                      <span className="text-yellow-400">✧</span>
                      <p className="text-gray-300 text-sm">Issue {i}</p>
                    </div>
                  ))}
                </div>
              </UpdateCard>
              
              <UpdateCard title="Patch Notes">
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-white/3 hover:bg-white/8 transition-all hover:translate-x-1">
                      <span className="text-yellow-400">✦</span>
                      <p className="text-gray-300 text-sm">Fix {i}</p>
                    </div>
                  ))}
                </div>
              </UpdateCard>
            </div>
          </section>

          {/* Hover Effects Demo */}
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-white">Hover Effects</h2>
            <div className="bg-gray-800/50 p-6 rounded-lg">
              <p className="text-gray-300 mb-4">Hover over the cards to see:</p>
              <ul className="list-disc list-inside space-y-2 text-gray-300 mb-6">
                <li>Elevation animation (card lifts up)</li>
                <li>Shadow enhancement</li>
                <li>Border color change</li>
                <li>Smooth transitions</li>
              </ul>
              <UpdateCard title="Hover Me!">
                <p className="text-gray-300">
                  Move your mouse over this card to see the hover effects in action.
                </p>
              </UpdateCard>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
