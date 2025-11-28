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
    // Try multiple possible paths for the Patch.txt file
    // On Vercel, process.cwd() should point to the project root
    const cwd = process.cwd();
    const possiblePaths = [
      path.join(cwd, 'Patch.txt'),
      path.resolve(cwd, 'Patch.txt'),
      // Fallback paths in case cwd is different
      path.join(__dirname, '..', '..', '..', 'Patch.txt'),
      path.join(__dirname, '..', '..', 'Patch.txt'),
    ];

    let htmlContent: string | null = null;
    let lastError: Error | null = null;
    let foundPath: string | null = null;

    // Try each path until one works
    for (const filePath of possiblePaths) {
      try {
        // Check if file exists first
        try {
          await fs.promises.access(filePath, fs.constants.F_OK);
        } catch (accessErr) {
          // File doesn't exist at this path, try next
          continue;
        }

        // Use async file reading for better error handling
        htmlContent = await fs.promises.readFile(filePath, 'utf-8');
        foundPath = filePath;
        console.log(`Successfully loaded Patch.txt from: ${filePath}`);
        break;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        // Continue to next path
        continue;
      }
    }

    // If we couldn't read the file from any path
    if (!htmlContent) {
      const errorMessage = lastError 
        ? `Failed to load Patch.txt from any path. Last error: ${lastError.message}`
        : 'Failed to load Patch.txt: File not found in any expected location';
      
      console.error(errorMessage);
      console.error('Tried paths:', possiblePaths);
      
      return {
        knownIssues: [],
        updates: [],
        lastUpdated: new Date().toISOString(),
        error: errorMessage,
      };
    }
    
    // Parse the HTML content using server-side parser
    const patchData = ServerPatchParser.parse(htmlContent);
    
    return patchData;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to load patch data:', errorMessage);
    return {
      knownIssues: [],
      updates: [],
      lastUpdated: new Date().toISOString(),
      error: `Failed to load patch notes: ${errorMessage}`,
    };
  }
}
