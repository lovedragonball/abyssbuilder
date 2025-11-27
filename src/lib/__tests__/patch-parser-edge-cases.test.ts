/**
 * Edge case tests for PatchParser
 * Tests various HTML input scenarios and error conditions
 */

import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { it } from 'node:test';
import { describe } from 'node:test';
import { describe } from 'node:test';
import { PatchParser } from '../patch-parser';

describe('PatchParser Edge Cases', () => {
  describe('Malformed HTML Scenarios', () => {
    it('should handle HTML with missing closing tags', () => {
      const html = `
        <div class="ace-line"><strong>▍Known Issues</strong>
        <div class="ace-line">✧ Issue without closing div
        <div class="ace-line">✧ Another issue
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBeGreaterThanOrEqual(0);
      expect(result.error).toBeUndefined();
    });

    it('should handle HTML with special characters', () => {
      const html = `
        <div class="ace-line"><strong>▍Known Issues</strong></div>
        <div class="ace-line">✧ Issue with special chars: &lt;script&gt; & "quotes"</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
      expect(result.knownIssues[0].description).toContain('special chars');
    });

    it('should handle HTML with nested divs', () => {
      const html = `
        <div>
          <div class="ace-line"><strong>▍Known Issues</strong></div>
          <div>
            <div class="ace-line">✧ Nested issue</div>
          </div>
        </div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
    });

    it('should handle HTML with inline styles and attributes', () => {
      const html = `
        <div class="ace-line" style="color: red;" data-id="123">
          <strong>▍Known Issues</strong>
        </div>
        <div class="ace-line" id="issue-1">✧ Styled issue</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
    });
  });

  describe('Empty and Null Scenarios', () => {
    it('should handle null input', () => {
      const result = PatchParser.parse(null as any);
      expect(result.knownIssues).toEqual([]);
      expect(result.updates).toEqual([]);
    });

    it('should handle undefined input', () => {
      const result = PatchParser.parse(undefined as any);
      expect(result.knownIssues).toEqual([]);
      expect(result.updates).toEqual([]);
    });

    it('should handle whitespace-only input', () => {
      const result = PatchParser.parse('   \n\t   ');
      expect(result.knownIssues).toEqual([]);
      expect(result.updates).toEqual([]);
    });

    it('should handle HTML with no content', () => {
      const html = '<html><body></body></html>';
      const result = PatchParser.parse(html);
      expect(result.knownIssues).toEqual([]);
      expect(result.updates).toEqual([]);
    });
  });

  describe('Unusual Content Scenarios', () => {
    it('should handle issues without bracketed terms', () => {
      const html = `
        <div class="ace-line"><strong>▍Known Issues</strong></div>
        <div class="ace-line">✧ This is an issue without any bracketed terms</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
      expect(result.knownIssues[0].highlightedTerms).toEqual([]);
    });

    it('should handle very long descriptions', () => {
      const longText = 'A'.repeat(1000);
      const html = `
        <div class="ace-line"><strong>▍Known Issues</strong></div>
        <div class="ace-line">✧ ${longText}</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
      expect(result.knownIssues[0].description.length).toBeGreaterThan(500);
    });

    it('should handle multiple consecutive spaces', () => {
      const html = `
        <div class="ace-line"><strong>▍Known Issues</strong></div>
        <div class="ace-line">✧ Issue    with    multiple    spaces</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
    });

    it('should handle line breaks within descriptions', () => {
      const html = `
        <div class="ace-line"><strong>▍Known Issues</strong></div>
        <div class="ace-line">✧ Issue with
        line break in the middle</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
    });

    it('should handle emoji and unicode characters', () => {
      const html = `
        <div class="ace-line"><strong>▍Known Issues</strong></div>
        <div class="ace-line">✧ Issue with emoji 🎮 and unicode ñ</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
      expect(result.knownIssues[0].description).toContain('🎮');
    });
  });

  describe('Date Format Scenarios', () => {
    it('should handle various date formats', () => {
      const html = `
        <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
        <div class="ace-line">✦ Fix 1</div>
        <div class="ace-line"><strong>[Update Details - 2025-01-05]</strong></div>
        <div class="ace-line">✦ Fix 2</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.updates.length).toBe(2);
    });

    it('should handle invalid date formats gracefully', () => {
      const html = `
        <div class="ace-line"><strong>[Update Details - invalid-date]</strong></div>
        <div class="ace-line">✦ Fix 1</div>
      `;
      
      const result = PatchParser.parse(html);
      // Should still parse but may skip invalid dates
      expect(result.updates.length).toBeGreaterThanOrEqual(0);
    });

    it('should handle dates in different order', () => {
      const html = `
        <div class="ace-line"><strong>[Update Details - 2025-11-20]</strong></div>
        <div class="ace-line">✦ Older fix</div>
        <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
        <div class="ace-line">✦ Newer fix</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.updates.length).toBe(2);
      // Should be sorted newest first
      expect(result.updates[0].date).toBe('2025-11-22');
      expect(result.updates[1].date).toBe('2025-11-20');
    });
  });

  describe('Bracketed Terms Edge Cases', () => {
    it('should handle empty brackets', () => {
      const text = 'Issue with [] empty brackets';
      const terms = PatchParser.extractHighlightedTerms(text);
      expect(terms).toEqual([]);
    });

    it('should handle brackets with only spaces', () => {
      const text = 'Issue with [   ] space brackets';
      const terms = PatchParser.extractHighlightedTerms(text);
      // Should either extract or ignore, but not crash
      expect(Array.isArray(terms)).toBe(true);
    });

    it('should handle unclosed brackets', () => {
      const text = 'Issue with [unclosed bracket';
      const terms = PatchParser.extractHighlightedTerms(text);
      expect(terms).toEqual([]);
    });

    it('should handle multiple brackets on same line', () => {
      const text = '[Term1] and [Term2] and [Term3]';
      const terms = PatchParser.extractHighlightedTerms(text);
      expect(terms).toEqual(['Term1', 'Term2', 'Term3']);
    });

    it('should handle brackets with special characters', () => {
      const text = 'Issue with [Item: Name & Description]';
      const terms = PatchParser.extractHighlightedTerms(text);
      expect(terms).toContain('Item: Name & Description');
    });

    it('should handle brackets with numbers', () => {
      const text = 'Issue with [Level 99] and [Item #123]';
      const terms = PatchParser.extractHighlightedTerms(text);
      expect(terms).toContain('Level 99');
      expect(terms).toContain('Item #123');
    });
  });

  describe('Mixed Content Scenarios', () => {
    it('should handle HTML with both known issues and updates', () => {
      const html = `
        <div class="ace-line"><strong>▍Known Issues</strong></div>
        <div class="ace-line">✧ Issue 1</div>
        <div class="ace-line">✧ Issue 2</div>
        <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
        <div class="ace-line">✦ Fix 1</div>
        <div class="ace-line">✦ Fix 2</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(2);
      expect(result.updates.length).toBe(1);
      expect(result.updates[0].notes.length).toBe(2);
    });

    it('should handle multiple update sections', () => {
      const html = `
        <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
        <div class="ace-line">✦ Fix 1</div>
        <div class="ace-line"><strong>[Update Details - 2025-11-21]</strong></div>
        <div class="ace-line">✦ Fix 2</div>
        <div class="ace-line"><strong>[Update Details - 2025-11-20]</strong></div>
        <div class="ace-line">✦ Fix 3</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.updates.length).toBe(3);
    });

    it('should handle content before known issues section', () => {
      const html = `
        <div class="ace-line">Dear Phoxhunter,</div>
        <div class="ace-line">Welcome message here</div>
        <div class="ace-line"><strong>▍Known Issues</strong></div>
        <div class="ace-line">✧ Issue 1</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
    });

    it('should handle content between sections', () => {
      const html = `
        <div class="ace-line"><strong>▍Known Issues</strong></div>
        <div class="ace-line">✧ Issue 1</div>
        <div class="ace-line">Some random text between sections</div>
        <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
        <div class="ace-line">✦ Fix 1</div>
      `;
      
      const result = PatchParser.parse(html);
      expect(result.knownIssues.length).toBe(1);
      expect(result.updates.length).toBe(1);
    });
  });

  describe('Performance Scenarios', () => {
    it('should handle large number of issues', () => {
      let html = '<div class="ace-line"><strong>▍Known Issues</strong></div>';
      for (let i = 0; i < 100; i++) {
        html += `<div class="ace-line">✧ Issue ${i}</div>`;
      }
      
      const startTime = Date.now();
      const result = PatchParser.parse(html);
      const endTime = Date.now();
      
      expect(result.knownIssues.length).toBe(100);
      expect(endTime - startTime).toBeLessThan(1000); // Should parse in under 1 second
    });

    it('should handle large number of updates', () => {
      let html = '';
      for (let i = 0; i < 50; i++) {
        html += `<div class="ace-line"><strong>[Update Details - 2025-11-${String(i + 1).padStart(2, '0')}]</strong></div>`;
        html += `<div class="ace-line">✦ Fix ${i}</div>`;
      }
      
      const startTime = Date.now();
      const result = PatchParser.parse(html);
      const endTime = Date.now();
      
      expect(result.updates.length).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(2000); // Should parse in under 2 seconds
    });
  });

  describe('Type Determination Edge Cases', () => {
    it('should handle mixed keywords in description', () => {
      const description = 'Fixed and Optimized the performance issue';
      const type = PatchParser.determinePatchType(description);
      expect(['fix', 'optimization']).toContain(type);
    });

    it('should handle descriptions with no keywords', () => {
      const description = 'Updated the game content';
      const type = PatchParser.determinePatchType(description);
      expect(type).toBe('other');
    });

    it('should handle empty description', () => {
      const description = '';
      const type = PatchParser.determinePatchType(description);
      expect(type).toBe('other');
    });

    it('should handle description with only special characters', () => {
      const description = '!@#$%^&*()';
      const type = PatchParser.determinePatchType(description);
      expect(type).toBe('other');
    });
  });
});
