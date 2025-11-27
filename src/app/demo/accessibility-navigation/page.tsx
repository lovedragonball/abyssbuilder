"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

/**
 * Accessibility Navigation Test Page
 * 
 * This page tests the accessibility features of PageTransition:
 * - prefers-reduced-motion support
 * - Focus management after page transitions
 * - ARIA live region announcements
 * - Keyboard navigation during animations
 */
export default function AccessibilityNavigationTest() {
  const pathname = usePathname()
  const [focusedElement, setFocusedElement] = React.useState<string>("")
  const [motionPreference, setMotionPreference] = React.useState<string>("")

  React.useEffect(() => {
    // Check motion preference
    if (typeof window !== 'undefined') {
      const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      setMotionPreference(prefersReduced ? 'Reduced' : 'No preference')
    }

    // Track focus changes
    const handleFocus = () => {
      const activeEl = document.activeElement
      if (activeEl) {
        setFocusedElement(
          `${activeEl.tagName}${activeEl.id ? `#${activeEl.id}` : ''}${
            activeEl.className ? `.${activeEl.className.split(' ')[0]}` : ''
          }`
        )
      }
    }

    document.addEventListener('focusin', handleFocus)
    handleFocus() // Initial check

    return () => document.removeEventListener('focusin', handleFocus)
  }, [])

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">
        Accessibility Navigation Test
      </h1>

      <div className="space-y-6">
        {/* Status Panel */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          <dl className="space-y-2">
            <div>
              <dt className="font-medium text-muted-foreground">Current Path:</dt>
              <dd className="font-mono text-sm">{pathname}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Motion Preference:</dt>
              <dd className="font-mono text-sm">{motionPreference}</dd>
            </div>
            <div>
              <dt className="font-medium text-muted-foreground">Focused Element:</dt>
              <dd className="font-mono text-sm">{focusedElement || 'None'}</dd>
            </div>
          </dl>
        </div>

        {/* Test Instructions */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>
              <strong>Keyboard Navigation:</strong> Use Tab key to navigate between links.
              Press Enter to follow a link. Focus should move to main content after transition.
            </li>
            <li>
              <strong>Screen Reader:</strong> Enable a screen reader (NVDA, JAWS, VoiceOver).
              Navigate between pages and listen for page change announcements.
            </li>
            <li>
              <strong>Reduced Motion:</strong> Enable "Reduce motion" in your OS settings.
              Animations should be minimal or disabled.
            </li>
            <li>
              <strong>Focus Management:</strong> After clicking a link, focus should automatically
              move to the main content area (not stay on the link).
            </li>
          </ol>
        </div>

        {/* Navigation Links */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Test Navigation</h2>
          <nav className="space-y-3">
            <Link
              href="/demo/accessibility-navigation"
              className="block px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Current Page (Accessibility Test)
            </Link>
            <Link
              href="/my-builds"
              className="block px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              My Builds
            </Link>
            <Link
              href="/tier-list"
              className="block px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Tier List
            </Link>
            <Link
              href="/map"
              className="block px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Interactive Map
            </Link>
            <Link
              href="/attribute-optimizer"
              className="block px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              Attribute Optimizer
            </Link>
          </nav>
        </div>

        {/* Accessibility Features */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Implemented Features</h2>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>
                <strong>prefers-reduced-motion:</strong> Automatically detects and respects
                user's motion preferences. Animations are minimal or disabled when reduced
                motion is preferred.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>
                <strong>Focus Management:</strong> After page transition, focus automatically
                moves to the main content area, allowing keyboard users to continue navigation
                without tabbing through the entire header.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>
                <strong>ARIA Live Region:</strong> Screen readers announce page changes
                using a polite live region (e.g., "Navigated to My Builds page").
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>
                <strong>Keyboard Navigation:</strong> All interactive elements are keyboard
                accessible with visible focus indicators. Navigation works during animations.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-1">✓</span>
              <span>
                <strong>No Focus Traps:</strong> Users can navigate freely during page
                transitions without getting trapped in animation states.
              </span>
            </li>
          </ul>
        </div>

        {/* Testing Checklist */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Testing Checklist</h2>
          <div className="space-y-2 text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Keyboard navigation works (Tab, Enter, Shift+Tab)</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Focus moves to main content after page transition</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Screen reader announces page changes</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Reduced motion preference is respected</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>No focus traps during animations</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Visible focus indicators on all interactive elements</span>
            </label>
            <label className="flex items-center gap-2">
              <input type="checkbox" className="rounded" />
              <span>Can navigate rapidly without issues</span>
            </label>
          </div>
        </div>

        {/* Browser DevTools Tips */}
        <div className="bg-card p-6 rounded-lg border">
          <h2 className="text-xl font-semibold mb-4">Browser DevTools Tips</h2>
          <ul className="space-y-2 text-sm">
            <li>
              <strong>Chrome:</strong> DevTools → Rendering → Emulate CSS media feature
              prefers-reduced-motion
            </li>
            <li>
              <strong>Firefox:</strong> about:config → ui.prefersReducedMotion → 1
            </li>
            <li>
              <strong>Safari:</strong> Develop → Experimental Features → Accessibility
            </li>
            <li>
              <strong>Console Logs:</strong> Open browser console to see PageTransition
              debug logs including focus management and announcements
            </li>
          </ul>
        </div>
      </div>
    </main>
  )
}
