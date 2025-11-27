/**
 * Server-side utilities for fetching patch data
 * This file should only be imported in server components
 */

import fs from 'fs';
import path from 'path';
import { PatchData, KnownIssue, UpdateGroup } from './patch-data';
import { PatchParser } from './patch-parser';

/**
 * Server-side parser that doesn't rely on DOMParser
 * Parses HTML content using regex and string manipulation
 */
class ServerPatchParser {
  static parse(htmlContent: string): PatchData {
    try {
      const knownIssues = this.extractKnownIssues(htmlContent);
      const updates = this.extractUpdateDetails(htmlContent);

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

  private static extractKnownIssues(htmlContent: string): KnownIssue[] {
    const issues: KnownIssue[] = [];
    
    // Split content into lines
    const lines = htmlContent.split('\n');
    let inKnownIssuesSection = false;
    
    for (const line of lines) {
      const text = line.replace(/<[^>]*>/g, '').trim(); // Remove HTML tags
      
      if (text.includes('Known Issues')) {
        inKnownIssuesSection = true;
        continue;
      }
      
      if (inKnownIssuesSection && text.includes('[Update Details')) {
        break;
      }
      
      if (inKnownIssuesSection && text.startsWith('✧')) {
        const description = text.substring(1).trim();
        const highlightedTerms = PatchParser.extractHighlightedTerms(description);
        
        // Extract translations from data attributes
        const enMatch = line.match(/data-lang-en="([^"]+)"/);
        const thMatch = line.match(/data-lang-th="([^"]+)"/);
        
        issues.push({
          id: `issue-${issues.length + 1}`,
          description,
          highlightedTerms,
          translations: {
            en: enMatch ? enMatch[1] : description,
            th: thMatch ? thMatch[1] : description
          }
        });
      }
    }
    
    return issues;
  }

  private static extractUpdateDetails(htmlContent: string): UpdateGroup[] {
    const updateGroups: UpdateGroup[] = [];
    const lines = htmlContent.split('\n');
    let currentGroup: UpdateGroup | null = null;
    
    for (const line of lines) {
      const text = line.replace(/<[^>]*>/g, '').trim();
      
      const updateMatch = text.match(/\[Update Details - (\d{4}-\d{2}-\d{2})\]/);
      
      if (updateMatch) {
        if (currentGroup && currentGroup.notes.length > 0) {
          updateGroups.push(currentGroup);
        }
        
        const date = updateMatch[1];
        currentGroup = {
          date,
          displayDate: `Update Details - ${date}`,
          notes: [],
        };
        continue;
      }
      
      if (currentGroup && text.startsWith('✦')) {
        const description = text.substring(1).trim();
        const highlightedTerms = PatchParser.extractHighlightedTerms(description);
        const type = PatchParser.determinePatchType(description);
        
        // Extract translations from data attributes
        const enMatch = line.match(/data-lang-en="([^"]+)"/);
        const thMatch = line.match(/data-lang-th="([^"]+)"/);
        
        currentGroup.notes.push({
          id: `${currentGroup.date}-note-${currentGroup.notes.length + 1}`,
          description,
          highlightedTerms,
          type,
          translations: {
            en: enMatch ? enMatch[1] : description,
            th: thMatch ? thMatch[1] : description
          }
        });
      }
    }
    
    if (currentGroup && currentGroup.notes.length > 0) {
      updateGroups.push(currentGroup);
    }
    
    updateGroups.sort((a, b) => b.date.localeCompare(a.date));
    
    return updateGroups;
  }
}

/**
 * Server-side function to fetch and parse patch data from Patch.txt
 * This function reads the file from the filesystem and returns structured data
 * @returns Promise<PatchData> - Structured patch data
 */
export async function getPatchData(): Promise<PatchData> {
  try {
    // Read the Patch.txt file from the root directory
    const filePath = path.join(process.cwd(), 'Patch.txt');
    const htmlContent = fs.readFileSync(filePath, 'utf-8');
    
    // Parse the HTML content using server-side parser
    const patchData = ServerPatchParser.parse(htmlContent);
    
    return patchData;
  } catch (error) {
    console.error('Failed to load patch data:', error);
    return {
      knownIssues: [],
      updates: [],
      lastUpdated: new Date().toISOString(),
      error: 'Failed to load patch notes',
    };
  }
}
