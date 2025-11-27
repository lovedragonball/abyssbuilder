'use client';

import React, { useState } from 'react';
import { NewsUpdatesSection } from '@/components/news/news-updates-section';
import type { PatchData, KnownIssue, UpdateGroup } from '@/lib/patch-data';

/**
 * Final Testing Demo Page for News Updates Section
 * Allows manual testing of various scenarios and configurations
 */

export default function NewsFinalTestingPage() {
  const [itemCount, setItemCount] = useState(5);
  const [showEmpty, setShowEmpty] = useState(false);
  const [showLongText, setShowLongText] = useState(false);
  const [viewportWidth, setViewportWidth] = useState('100%');

  // Generate test data
  const generateKnownIssues = (count: number): KnownIssue[] => {
    if (showEmpty) return [];
    
    const baseText = showLongText
      ? 'This is a very long description that demonstrates how the component handles extensive text content. It includes multiple sentences and should wrap properly across multiple lines without breaking the layout or causing any overflow issues. '
      : 'Test issue with ';

    return Array.from({ length: count }, (_, i) => ({
      id: `issue-${i}`,
      description: `${baseText}[Bracketed Term ${i + 1}] and additional context about the issue.`,
      highlightedTerms: [`Bracketed Term ${i + 1}`],
    }));
  };

  const generateUpdateGroups = (count: number): UpdateGroup[] => {
    if (showEmpty) return [];

    return Array.from({ length: count }, (_, i) => ({
      date: `2025-11-${22 - i}`,
      displayDate: `Update Details - 2025-11-${22 - i}`,
      notes: [
        {
          id: `fix-${i}-1`,
          description: showLongText
            ? `Fixed a complex issue that required extensive investigation and multiple iterations to resolve properly. The fix addresses [Component ${i + 1}] and ensures stability across all platforms and configurations.`
            : `Fixed issue with [Component ${i + 1}]`,
          highlightedTerms: [`Component ${i + 1}`],
          type: 'fix' as const,
        },
        {
          id: `fix-${i}-2`,
          description: `Optimized performance for feature ${i + 1}`,
          highlightedTerms: [],
          type: 'optimization' as const,
        },
      ],
    }));
  };

  const patchData: PatchData = {
    knownIssues: generateKnownIssues(itemCount),
    updates: generateUpdateGroups(itemCount),
    lastUpdated: new Date().toISOString(),
  };

  const presetViewports = [
    { name: 'Mobile Small', width: '320px' },
    { name: 'Mobile', width: '375px' },
    { name: 'Mobile Large', width: '414px' },
    { name: 'Tablet', width: '768px' },
    { name: 'Desktop', width: '1024px' },
    { name: 'Desktop HD', width: '1920px' },
    { name: 'Full Width', width: '100%' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            News Updates Section - Final Testing
          </h1>
          <p className="text-gray-400">
            Test various scenarios, screen sizes, and content variations
          </p>
        </div>

        {/* Controls */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Test Controls</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Item Count */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Item Count: {itemCount}
              </label>
              <input
                type="range"
                min="0"
                max="30"
                value={itemCount}
                onChange={(e) => setItemCount(Number(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>0</span>
                <span>15</span>
                <span>30</span>
              </div>
            </div>

            {/* Viewport Width */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Viewport Width
              </label>
              <select
                value={viewportWidth}
                onChange={(e) => setViewportWidth(e.target.value)}
                className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {presetViewports.map((preset) => (
                  <option key={preset.name} value={preset.width}>
                    {preset.name} ({preset.width})
                  </option>
                ))}
              </select>
            </div>

            {/* Toggles */}
            <div className="space-y-3">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showEmpty}
                  onChange={(e) => setShowEmpty(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-300">Show Empty State</span>
              </label>
              
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showLongText}
                  onChange={(e) => setShowLongText(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-gray-300">Use Long Text</span>
              </label>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="mt-6 pt-6 border-t border-gray-700">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Quick Presets:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  setItemCount(2);
                  setShowEmpty(false);
                  setShowLongText(false);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Few Items
              </button>
              <button
                onClick={() => {
                  setItemCount(10);
                  setShowEmpty(false);
                  setShowLongText(false);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Medium Items
              </button>
              <button
                onClick={() => {
                  setItemCount(25);
                  setShowEmpty(false);
                  setShowLongText(false);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Many Items
              </button>
              <button
                onClick={() => {
                  setItemCount(0);
                  setShowEmpty(true);
                  setShowLongText(false);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Empty State
              </button>
              <button
                onClick={() => {
                  setItemCount(5);
                  setShowEmpty(false);
                  setShowLongText(true);
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors"
              >
                Long Text
              </button>
            </div>
          </div>
        </div>

        {/* Test Checklist */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Testing Checklist</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Visual Tests:</h3>
              <ul className="space-y-1 text-gray-400">
                <li>✓ Cards display correctly</li>
                <li>✓ Hover effects work smoothly</li>
                <li>✓ Scrolling is smooth</li>
                <li>✓ Text wraps properly</li>
                <li>✓ No overflow issues</li>
                <li>✓ Colors are consistent</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-300 mb-2">Responsive Tests:</h3>
              <ul className="space-y-1 text-gray-400">
                <li>✓ Mobile layout stacks vertically</li>
                <li>✓ Desktop shows two columns</li>
                <li>✓ Tablet transitions smoothly</li>
                <li>✓ Ultra-wide maintains max-width</li>
                <li>✓ Touch scrolling works</li>
                <li>✓ No horizontal overflow</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Preview Container */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">Preview</h2>
            <div className="text-sm text-gray-400">
              Current Width: {viewportWidth}
            </div>
          </div>
          
          <div
            style={{ width: viewportWidth, margin: '0 auto' }}
            className="transition-all duration-300"
          >
            <NewsUpdatesSection patchData={patchData} />
          </div>
        </div>

        {/* Performance Info */}
        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Performance Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-gray-400">Known Issues</div>
              <div className="text-2xl font-bold text-white">
                {patchData.knownIssues.length}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Update Groups</div>
              <div className="text-2xl font-bold text-white">
                {patchData.updates.length}
              </div>
            </div>
            <div>
              <div className="text-gray-400">Total Notes</div>
              <div className="text-2xl font-bold text-white">
                {patchData.updates.reduce((sum, group) => sum + group.notes.length, 0)}
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700/50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-300 mb-3">
            Testing Instructions
          </h3>
          <ol className="space-y-2 text-gray-300 text-sm list-decimal list-inside">
            <li>Test different item counts (0, 2, 10, 25+)</li>
            <li>Try all viewport widths from mobile to ultra-wide</li>
            <li>Enable long text to test text wrapping</li>
            <li>Test empty state with 0 items</li>
            <li>Hover over cards and items to test animations</li>
            <li>Scroll within cards to test scrolling behavior</li>
            <li>Resize browser window to test responsiveness</li>
            <li>Test on different browsers (Chrome, Firefox, Safari, Edge)</li>
            <li>Test on actual mobile devices if possible</li>
            <li>Check console for any errors or warnings</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
