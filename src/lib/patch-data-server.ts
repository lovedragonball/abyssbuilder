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
 * @param baseUrl - Optional base URL for fetching from public folder (for Vercel)
 * @returns Promise<PatchData> - Structured patch data
 */
export async function getPatchData(baseUrl?: string): Promise<PatchData> {
  try {
    let htmlContent: string | null = null;
    let loadMethod = 'unknown';

    // Method 1: Try to read from filesystem (for local development and Vercel serverless)
    const cwd = process.cwd();
    // Prioritize public folder which is standard for Next.js static assets
    const possiblePaths = [
      path.join(cwd, 'public', 'Patch.txt'),
      path.join(cwd, 'Patch.txt'),
    ];

    console.log(`[PatchData] Attempting to load Patch.txt from filesystem. CWD: ${cwd}`);

    for (const filePath of possiblePaths) {
      try {
        // Check if file exists
        await fs.promises.access(filePath, fs.constants.F_OK);
        // Read file content
        htmlContent = await fs.promises.readFile(filePath, 'utf-8');
        loadMethod = `filesystem: ${filePath}`;
        console.log(`[PatchData] ✅ Successfully loaded Patch.txt from: ${filePath}`);
        break;
      } catch (err) {
        console.log(`[PatchData] ⚠️ Could not read from ${filePath}:`, err instanceof Error ? err.message : String(err));
        continue;
      }
    }

    // Method 2: If filesystem fails, try to fetch from public URL (fallback)
    if (!htmlContent) {
      try {
        // Get the base URL
        const url = baseUrl
          || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null)
          || process.env.NEXT_PUBLIC_BASE_URL
          || 'http://localhost:3000';

        if (url) {
          const patchUrl = `${url}/Patch.txt`;
          console.log(`[PatchData] Attempting to fetch from URL: ${patchUrl}`);

          const response = await fetch(patchUrl, {
            next: { revalidate: 3600 },
            headers: { 'User-Agent': 'AbyssBuilder/1.0' },
          });

          if (response.ok) {
            htmlContent = await response.text();
            loadMethod = `http: ${patchUrl}`;
            console.log(`[PatchData] ✅ Successfully loaded Patch.txt from URL: ${patchUrl}`);
          } else {
            console.warn(`[PatchData] ❌ Failed to fetch from URL: ${response.status} ${response.statusText}`);
          }
        }
      } catch (fetchErr) {
        console.warn('[PatchData] ❌ Failed to fetch Patch.txt from URL:', fetchErr);
      }
    }

    // If all methods failed
    if (!htmlContent) {
      const errorMessage = 'Failed to load Patch.txt: Tried filesystem and HTTP methods, all failed.';
      console.error(`[PatchData] ❌ ${errorMessage}`);

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
