/**
 * Parser for extracting patch notes and known issues from HTML content.
 * 
 * This module provides functionality to parse HTML patch files and extract:
 * - Known issues (marked with ✧ symbol)
 * - Update details grouped by date (marked with ✦ symbol)
 * - Highlighted terms in brackets (e.g., [Longbow: Embla Inflorescence])
 * 
 * @module PatchParser
 * @example
 * ```typescript
 * const htmlContent = fs.readFileSync('Patch.txt', 'utf-8');
 * const patchData = PatchParser.parse(htmlContent);
 * console.log('Found', patchData.knownIssues.length, 'known issues');
 * console.log('Found', patchData.updates.length, 'update groups');
 * ```
 */

import { KnownIssue, PatchNote, UpdateGroup, PatchData } from './patch-data';

/**
 * PatchParser class for parsing HTML patch notes.
 * 
 * This class provides static methods to parse HTML content from patch files
 * and extract structured data including known issues and patch notes.
 * 
 * @class PatchParser
 * @public
 */
export class PatchParser {
  /**
   * Parse HTML content from Patch.txt and extract structured data.
   * 
   * This method parses the HTML content and extracts:
   * - Known issues from the "Known Issues" section
   * - Update details grouped by date from "[Update Details - DATE]" sections
   * - Highlighted terms enclosed in brackets
   * 
   * The parser expects HTML with the following structure:
   * - Known issues marked with ✧ symbol
   * - Update details marked with ✦ symbol
   * - Dates in format [Update Details - YYYY-MM-DD]
   * - Terms to highlight enclosed in brackets [Term]
   * 
   * @param {string} htmlContent - Raw HTML string from Patch.txt file
   * @returns {PatchData} Structured PatchData object containing known issues and updates
   * @throws {Error} Returns error in PatchData.error field if parsing fails
   * 
   * @example
   * ```typescript
   * const html = '<div class="ace-line"><strong>▍Known Issues</strong></div>...';
   * const patchData = PatchParser.parse(html);
   * 
   * if (patchData.error) {
   *   console.error('Parse error:', patchData.error);
   * } else {
   *   console.log('Parsed successfully');
   * }
   * ```
   * 
   * @public
   * @static
   */
  static parse(htmlContent: string): PatchData {
    try {
      // Create a DOM parser (works in browser environment)
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlContent, 'text/html');

      // Extract known issues
      const knownIssues = this.extractKnownIssues(doc);

      // Extract update details
      const updates = this.extractUpdateDetails(doc);

      return {
        knownIssues,
        updates,
        lastUpdated: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to parse patch data:', error);
      return {
        knownIssues: [],
        updates: [],
        lastUpdated: new Date().toISOString(),
        error: 'Failed to parse patch notes',
      };
    }
  }

  /**
   * Extract known issues from the parsed document.
   * 
   * Searches for the "Known Issues" section and extracts all lines
   * starting with the ✧ symbol. Each issue is parsed to extract
   * highlighted terms enclosed in brackets.
   * 
   * @param {Document} doc - Parsed HTML document
   * @returns {KnownIssue[]} Array of KnownIssue objects with unique IDs
   * 
   * @private
   * @static
   */
  private static extractKnownIssues(doc: Document): KnownIssue[] {
    const issues: KnownIssue[] = [];
    
    // Find all div elements with class "ace-line"
    const lines = Array.from(doc.querySelectorAll('.ace-line'));
    
    // Find the "Known Issues" heading
    let inKnownIssuesSection = false;
    
    for (const line of lines) {
      const text = line.textContent?.trim() || '';
      
      // Check if we've entered the Known Issues section
      if (text.includes('Known Issues')) {
        inKnownIssuesSection = true;
        continue;
      }
      
      // Check if we've left the Known Issues section (reached Update Details)
      if (inKnownIssuesSection && text.includes('[Update Details')) {
        break;
      }
      
      // Extract issues that start with ✧
      if (inKnownIssuesSection && text.startsWith('✧')) {
        const description = text.substring(1).trim(); // Remove ✧ symbol
        const highlightedTerms = this.extractHighlightedTerms(description);
        
        // Extract translations from data attributes
        const element = line as HTMLElement;
        const enText = element.getAttribute('data-lang-en') || description;
        const thText = element.getAttribute('data-lang-th') || '';
        
        issues.push({
          id: `issue-${issues.length + 1}`,
          description,
          highlightedTerms,
          translations: {
            en: enText,
            th: thText,
          },
        });
      }
    }
    
    return issues;
  }

  /**
   * Extract update details grouped by date.
   * 
   * Searches for "[Update Details - DATE]" sections and extracts all
   * patch notes (lines starting with ✦) under each date. Groups are
   * sorted by date in descending order (newest first).
   * 
   * @param {Document} doc - Parsed HTML document
   * @returns {UpdateGroup[]} Array of UpdateGroup objects sorted by date (newest first)
   * 
   * @private
   * @static
   */
  private static extractUpdateDetails(doc: Document): UpdateGroup[] {
    const updateGroups: UpdateGroup[] = [];
    
    // Find all div elements with class "ace-line"
    const lines = Array.from(doc.querySelectorAll('.ace-line'));
    
    let currentGroup: UpdateGroup | null = null;
    
    for (const line of lines) {
      const text = line.textContent?.trim() || '';
      
      // Check for update details header with date
      const updateMatch = text.match(/\[Update Details - (\d{4}-\d{2}-\d{2})\]/);
      
      if (updateMatch) {
        // Save previous group if exists
        if (currentGroup && currentGroup.notes.length > 0) {
          updateGroups.push(currentGroup);
        }
        
        // Start new group
        const date = updateMatch[1];
        currentGroup = {
          date,
          displayDate: `Update Details - ${date}`,
          notes: [],
        };
        continue;
      }
      
      // Extract patch notes that start with ✦
      if (currentGroup && text.startsWith('✦')) {
        const description = text.substring(1).trim(); // Remove ✦ symbol
        const highlightedTerms = this.extractHighlightedTerms(description);
        const type = this.determinePatchType(description);
        
        // Extract translations from data attributes
        const element = line as HTMLElement;
        const enText = element.getAttribute('data-lang-en') || description;
        const thText = element.getAttribute('data-lang-th') || '';
        
        currentGroup.notes.push({
          id: `${currentGroup.date}-note-${currentGroup.notes.length + 1}`,
          description,
          highlightedTerms,
          type,
          translations: {
            en: enText,
            th: thText,
          },
        });
      }
    }
    
    // Add the last group if exists
    if (currentGroup && currentGroup.notes.length > 0) {
      updateGroups.push(currentGroup);
    }
    
    // Sort by date (newest first)
    updateGroups.sort((a, b) => b.date.localeCompare(a.date));
    
    return updateGroups;
  }

  /**
   * Extract terms enclosed in brackets from text.
   * 
   * Uses regex pattern `/\[([^\]]+)\]/g` to find all terms enclosed
   * in square brackets. Useful for identifying game elements, items,
   * or features that should be highlighted in the UI.
   * 
   * @param {string} text - Text to search for bracketed terms
   * @returns {string[]} Array of terms found in brackets (without the brackets)
   * 
   * @example
   * ```typescript
   * const text = 'Fixed [Longbow: Embla] and [Summon: Aurelia] issues.';
   * const terms = PatchParser.extractHighlightedTerms(text);
   * // Returns: ['Longbow: Embla', 'Summon: Aurelia']
   * ```
   * 
   * @public
   * @static
   */
  static extractHighlightedTerms(text: string): string[] {
    const terms: string[] = [];
    const regex = /\[([^\]]+)\]/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      terms.push(match[1]);
    }
    
    return terms;
  }

  /**
   * Determine the type of patch note based on keywords in the description.
   * 
   * Analyzes the description text to categorize the patch note:
   * - 'fix': Contains keywords like "fixed" or "fix"
   * - 'optimization': Contains keywords like "optimized" or "optimization"
   * - 'other': No recognized keywords found
   * 
   * The check is case-insensitive and prioritizes 'fix' over 'optimization'
   * if both keywords are present.
   * 
   * @param {string} description - Patch note description text
   * @returns {'fix' | 'optimization' | 'other'} Type of patch note
   * 
   * @example
   * ```typescript
   * PatchParser.determinePatchType('Fixed an issue'); // Returns: 'fix'
   * PatchParser.determinePatchType('Optimized performance'); // Returns: 'optimization'
   * PatchParser.determinePatchType('Updated content'); // Returns: 'other'
   * ```
   * 
   * @public
   * @static
   */
  static determinePatchType(description: string): 'fix' | 'optimization' | 'other' {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes('fixed') || lowerDesc.includes('fix')) {
      return 'fix';
    }
    
    if (lowerDesc.includes('optimized') || lowerDesc.includes('optimization')) {
      return 'optimization';
    }
    
    return 'other';
  }
}
