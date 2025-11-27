/**
 * Integration tests for Thai language support in news components
 */

import React from 'react'
import { render, screen } from '@testing-library/react'
import { KnownIssuesCard } from '../known-issues-card'
import { PatchNotesCard } from '../patch-notes-card'
import { NewsUpdatesSection } from '../news-updates-section'
import { KnownIssue, UpdateGroup, PatchData } from '@/lib/patch-data'

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}))

describe('Thai Translations Integration', () => {
  const sampleIssues: KnownIssue[] = [
    {
      id: 'issue-1',
      description: 'Test issue with [Longbow]',
      highlightedTerms: ['Longbow']
    }
  ]

  const sampleUpdates: UpdateGroup[] = [
    {
      date: '2025-11-22',
      displayDate: 'Update Details - 2025-11-22',
      notes: [
        {
          id: 'fix-1',
          description: 'Fixed [Longbow] issue',
          highlightedTerms: ['Longbow'],
          type: 'fix'
        }
      ]
    }
  ]

  const samplePatchData: PatchData = {
    knownIssues: sampleIssues,
    updates: sampleUpdates,
    lastUpdated: '2025-11-22T00:00:00Z'
  }

  describe('KnownIssuesCard', () => {
    it('should render English translations by default', () => {
      render(<KnownIssuesCard issues={sampleIssues} />)
      
      expect(screen.getByText('Known Issues (Still Unresolved)')).toBeInTheDocument()
    })

    it('should render Thai translations when locale is "th"', () => {
      render(<KnownIssuesCard issues={sampleIssues} locale="th" />)
      
      expect(screen.getByText('ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)')).toBeInTheDocument()
    })

    it('should render Thai empty state', () => {
      render(<KnownIssuesCard issues={[]} locale="th" />)
      
      expect(screen.getByText('ไม่มีปัญหาที่ทราบในขณะนี้')).toBeInTheDocument()
    })

    it('should render English empty state by default', () => {
      render(<KnownIssuesCard issues={[]} />)
      
      expect(screen.getByText('No known issues at this time')).toBeInTheDocument()
    })

    it('should properly render Thai characters in title', () => {
      const { container } = render(<KnownIssuesCard issues={sampleIssues} locale="th" />)
      
      const title = container.querySelector('.card-title')
      expect(title).toHaveTextContent('ปัญหาที่ทราบ')
    })
  })

  describe('PatchNotesCard', () => {
    it('should render English translations by default', () => {
      render(<PatchNotesCard updates={sampleUpdates} />)
      
      expect(screen.getByText('Patch Notes (Bug Fixes and Improvements)')).toBeInTheDocument()
    })

    it('should render Thai translations when locale is "th"', () => {
      render(<PatchNotesCard updates={sampleUpdates} locale="th" />)
      
      expect(screen.getByText('บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)')).toBeInTheDocument()
    })

    it('should render Thai "Show More" button', () => {
      const manyUpdates: UpdateGroup[] = Array.from({ length: 10 }, (_, i) => ({
        date: `2025-11-${22 - i}`,
        displayDate: `Update Details - 2025-11-${22 - i}`,
        notes: [
          {
            id: `fix-${i}`,
            description: `Fix ${i}`,
            highlightedTerms: [],
            type: 'fix' as const
          }
        ]
      }))

      render(<PatchNotesCard updates={manyUpdates} locale="th" maxVisibleUpdates={3} />)
      
      expect(screen.getByText('แสดงเพิ่มเติม')).toBeInTheDocument()
    })

    it('should render Thai empty state', () => {
      render(<PatchNotesCard updates={[]} locale="th" />)
      
      expect(screen.getByText('ไม่มีการอัปเดตล่าสุด')).toBeInTheDocument()
    })

    it('should render English empty state by default', () => {
      render(<PatchNotesCard updates={[]} />)
      
      expect(screen.getByText('No recent updates')).toBeInTheDocument()
    })
  })

  describe('NewsUpdatesSection', () => {
    it('should render English translations by default', () => {
      render(<NewsUpdatesSection patchData={samplePatchData} />)
      
      expect(screen.getByText('Known Issues (Still Unresolved)')).toBeInTheDocument()
      expect(screen.getByText('Patch Notes (Bug Fixes and Improvements)')).toBeInTheDocument()
    })

    it('should render Thai translations when locale is "th"', () => {
      render(<NewsUpdatesSection patchData={samplePatchData} locale="th" />)
      
      expect(screen.getByText('ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)')).toBeInTheDocument()
      expect(screen.getByText('บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)')).toBeInTheDocument()
    })

    it('should render Thai empty state', () => {
      const emptyData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z'
      }

      render(<NewsUpdatesSection patchData={emptyData} locale="th" />)
      
      expect(screen.getByText('ไม่มีข้อมูลอัปเดต')).toBeInTheDocument()
    })

    it('should render Thai error state', () => {
      const errorData: PatchData = {
        knownIssues: [],
        updates: [],
        lastUpdated: '2025-11-22T00:00:00Z',
        error: 'Test error'
      }

      render(<NewsUpdatesSection patchData={errorData} locale="th" />)
      
      expect(screen.getByText('ไม่สามารถโหลดบันทึกการแก้ไขได้')).toBeInTheDocument()
    })

    it('should have proper ARIA labels in Thai', () => {
      const { container } = render(<NewsUpdatesSection patchData={samplePatchData} locale="th" />)
      
      const section = container.querySelector('[role="region"]')
      expect(section).toHaveAttribute('aria-label', 'ข่าวสารและการอัปเดตเกม')
    })
  })

  describe('Font Display and Spacing', () => {
    it('should render Thai characters without breaking layout', () => {
      const { container } = render(<KnownIssuesCard issues={sampleIssues} locale="th" />)
      
      const title = container.querySelector('.card-title')
      expect(title).toBeInTheDocument()
      
      // Check that the element has proper styling
      const computedStyle = window.getComputedStyle(title!)
      expect(computedStyle.fontSize).toBeTruthy()
    })

    it('should handle mixed Thai and English content', () => {
      const mixedIssue: KnownIssue = {
        id: 'mixed-1',
        description: 'ปัญหากับ [Longbow: Embla Inflorescence] ในโหมด Co-op',
        highlightedTerms: ['Longbow: Embla Inflorescence']
      }

      render(<KnownIssuesCard issues={[mixedIssue]} locale="th" />)
      
      expect(screen.getByText(/ปัญหากับ/)).toBeInTheDocument()
      expect(screen.getByText(/ในโหมด Co-op/)).toBeInTheDocument()
    })

    it('should properly render Thai characters in different font sizes', () => {
      const { container } = render(
        <div>
          <p className="text-xs">ขนาดเล็ก</p>
          <p className="text-sm">ขนาดปกติ</p>
          <p className="text-base">ขนาดใหญ่</p>
          <p className="text-lg">ขนาดใหญ่มาก</p>
        </div>
      )

      const paragraphs = container.querySelectorAll('p')
      expect(paragraphs).toHaveLength(4)
      
      paragraphs.forEach(p => {
        expect(p.textContent).toMatch(/[\u0E00-\u0E7F]/)
      })
    })
  })

  describe('Accessibility with Thai Language', () => {
    it('should have proper ARIA labels in Thai for Known Issues', () => {
      render(<KnownIssuesCard issues={sampleIssues} locale="th" />)
      
      const regions = screen.getAllByRole('region')
      const mainRegion = regions.find(r => r.getAttribute('aria-label') === 'ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)')
      expect(mainRegion).toBeInTheDocument()
      expect(mainRegion).toHaveAttribute('aria-label', 'ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)')
    })

    it('should have proper ARIA labels in Thai for Patch Notes', () => {
      render(<PatchNotesCard updates={sampleUpdates} locale="th" />)
      
      const regions = screen.getAllByRole('region')
      const mainRegion = regions.find(r => r.getAttribute('aria-label') === 'บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)')
      expect(mainRegion).toBeInTheDocument()
      expect(mainRegion).toHaveAttribute('aria-label', 'บันทึกการแก้ไข (การแก้ไขบั๊กและการปรับปรุง)')
    })

    it('should announce Thai content to screen readers', () => {
      render(<KnownIssuesCard issues={[]} locale="th" />)
      
      const status = screen.getByRole('status')
      expect(status).toHaveTextContent('ไม่มีปัญหาที่ทราบในขณะนี้')
      expect(status).toHaveAttribute('aria-live', 'polite')
    })
  })

  describe('Locale Switching', () => {
    it('should update translations when locale changes', () => {
      const { rerender } = render(<KnownIssuesCard issues={sampleIssues} locale="en" />)
      
      expect(screen.getByText('Known Issues (Still Unresolved)')).toBeInTheDocument()
      
      rerender(<KnownIssuesCard issues={sampleIssues} locale="th" />)
      
      expect(screen.getByText('ปัญหาที่ทราบ (ยังไม่ได้รับการแก้ไข)')).toBeInTheDocument()
      expect(screen.queryByText('Known Issues (Still Unresolved)')).not.toBeInTheDocument()
    })

    it('should maintain content when switching locales', () => {
      const { rerender } = render(<KnownIssuesCard issues={sampleIssues} locale="en" />)
      
      expect(screen.getByText(/Test issue with/)).toBeInTheDocument()
      
      rerender(<KnownIssuesCard issues={sampleIssues} locale="th" />)
      
      // Content should still be there, just the UI labels change
      expect(screen.getByText(/Test issue with/)).toBeInTheDocument()
    })
  })
})
