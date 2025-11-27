/**
 * Integration test for PatchParser with actual Patch.txt file
 */

import { PatchParser } from '../patch-parser';
import fs from 'fs';
import path from 'path';

describe('PatchParser Integration', () => {
  let patchContent: string;

  beforeAll(() => {
    // Read the actual Patch.txt file
    const patchPath = path.join(process.cwd(), 'Patch.txt');
    patchContent = fs.readFileSync(patchPath, 'utf-8');
  });

  it('should successfully parse the actual Patch.txt file', () => {
    const result = PatchParser.parse(patchContent);

    expect(result).toBeDefined();
    expect(result.error).toBeUndefined();
    expect(result.lastUpdated).toBeDefined();
  });

  it('should extract known issues from Patch.txt', () => {
    const result = PatchParser.parse(patchContent);

    expect(result.knownIssues.length).toBeGreaterThan(0);
    
    // Verify structure of first issue
    const firstIssue = result.knownIssues[0];
    expect(firstIssue.id).toBeDefined();
    expect(firstIssue.description).toBeDefined();
    expect(firstIssue.highlightedTerms).toBeDefined();
    expect(Array.isArray(firstIssue.highlightedTerms)).toBe(true);
  });

  it('should extract update groups from Patch.txt', () => {
    const result = PatchParser.parse(patchContent);

    expect(result.updates.length).toBeGreaterThan(0);
    
    // Verify structure of first update group
    const firstUpdate = result.updates[0];
    expect(firstUpdate.date).toBeDefined();
    expect(firstUpdate.displayDate).toBeDefined();
    expect(firstUpdate.notes).toBeDefined();
    expect(Array.isArray(firstUpdate.notes)).toBe(true);
    expect(firstUpdate.notes.length).toBeGreaterThan(0);
  });

  it('should extract specific known issue about Longbow', () => {
    const result = PatchParser.parse(patchContent);

    const longbowIssue = result.knownIssues.find(
      issue => issue.description.includes('Longbow: Embla Inflorescence')
    );

    expect(longbowIssue).toBeDefined();
    expect(longbowIssue?.highlightedTerms).toContain('Longbow: Embla Inflorescence');
  });

  it('should extract specific patch note about Eclosion', () => {
    const result = PatchParser.parse(patchContent);

    const allNotes = result.updates.flatMap(update => update.notes);
    const eclosionNote = allNotes.find(
      note => note.description.includes('Eclosion')
    );

    expect(eclosionNote).toBeDefined();
    expect(eclosionNote?.highlightedTerms).toContain('Eclosion');
    expect(eclosionNote?.type).toBe('fix');
  });

  it('should have updates sorted by date (newest first)', () => {
    const result = PatchParser.parse(patchContent);

    for (let i = 0; i < result.updates.length - 1; i++) {
      const currentDate = new Date(result.updates[i].date);
      const nextDate = new Date(result.updates[i + 1].date);
      expect(currentDate.getTime()).toBeGreaterThanOrEqual(nextDate.getTime());
    }
  });

  it('should extract all highlighted terms correctly', () => {
    const result = PatchParser.parse(patchContent);

    // Check that all issues have their bracketed terms extracted
    result.knownIssues.forEach(issue => {
      const bracketMatches = issue.description.match(/\[([^\]]+)\]/g);
      if (bracketMatches) {
        expect(issue.highlightedTerms.length).toBeGreaterThan(0);
      }
    });

    // Check that all patch notes have their bracketed terms extracted
    result.updates.forEach(update => {
      update.notes.forEach(note => {
        const bracketMatches = note.description.match(/\[([^\]]+)\]/g);
        if (bracketMatches) {
          expect(note.highlightedTerms.length).toBeGreaterThan(0);
        }
      });
    });
  });

  it('should correctly identify patch note types', () => {
    const result = PatchParser.parse(patchContent);

    const allNotes = result.updates.flatMap(update => update.notes);
    
    // Should have some fixes
    const fixes = allNotes.filter(note => note.type === 'fix');
    expect(fixes.length).toBeGreaterThan(0);

    // Should have some optimizations
    const optimizations = allNotes.filter(note => note.type === 'optimization');
    expect(optimizations.length).toBeGreaterThan(0);
  });

  it('should have valid date formats', () => {
    const result = PatchParser.parse(patchContent);

    result.updates.forEach(update => {
      // Check date format YYYY-MM-DD
      expect(update.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      
      // Check that date is valid
      const dateObj = new Date(update.date);
      expect(dateObj.toString()).not.toBe('Invalid Date');
      
      // Check display date format
      expect(update.displayDate).toBe(`Update Details - ${update.date}`);
    });
  });

  it('should have unique IDs for all items', () => {
    const result = PatchParser.parse(patchContent);

    // Check issue IDs are unique
    const issueIds = result.knownIssues.map(issue => issue.id);
    expect(new Set(issueIds).size).toBe(issueIds.length);

    // Check note IDs are unique
    const noteIds = result.updates.flatMap(update => 
      update.notes.map(note => note.id)
    );
    expect(new Set(noteIds).size).toBe(noteIds.length);
  });
});
