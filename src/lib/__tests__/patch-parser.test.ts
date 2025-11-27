/**
 * Unit tests for PatchParser
 */

import { PatchParser } from '../patch-parser';
import { PatchData } from '../patch-data';

describe('PatchParser', () => {
  describe('extractHighlightedTerms', () => {
    it('should extract single bracketed term', () => {
      const text = 'Fixed an issue with [Longbow: Embla Inflorescence] causing problems.';
      const terms = PatchParser.extractHighlightedTerms(text);
      
      expect(terms).toEqual(['Longbow: Embla Inflorescence']);
    });

    it('should extract multiple bracketed terms', () => {
      const text = 'Fixed [Summon: Aurelia Aurita] and [Summon: Tentacles] not inheriting stats.';
      const terms = PatchParser.extractHighlightedTerms(text);
      
      expect(terms).toEqual(['Summon: Aurelia Aurita', 'Summon: Tentacles']);
    });

    it('should return empty array when no brackets found', () => {
      const text = 'Fixed an issue with the game freezing.';
      const terms = PatchParser.extractHighlightedTerms(text);
      
      expect(terms).toEqual([]);
    });

    it('should handle nested brackets correctly', () => {
      const text = 'Fixed [Item [Nested]] issue.';
      const terms = PatchParser.extractHighlightedTerms(text);
      
      // Should extract the first complete bracketed term
      expect(terms.length).toBeGreaterThan(0);
    });
  });

  describe('determinePatchType', () => {
    it('should identify fix type', () => {
      const description = 'Fixed an issue where the game would crash.';
      const type = PatchParser.determinePatchType(description);
      
      expect(type).toBe('fix');
    });

    it('should identify optimization type', () => {
      const description = 'Optimized performance on mobile devices.';
      const type = PatchParser.determinePatchType(description);
      
      expect(type).toBe('optimization');
    });

    it('should return other for unrecognized types', () => {
      const description = 'Added new feature to the game.';
      const type = PatchParser.determinePatchType(description);
      
      expect(type).toBe('other');
    });

    it('should be case insensitive', () => {
      const description = 'FIXED an issue with OPTIMIZATION.';
      const type = PatchParser.determinePatchType(description);
      
      expect(type).toBe('fix'); // 'fixed' comes first
    });
  });

  describe('parse', () => {
    const sampleHTML = `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="ace-line"><strong>▍Known Issues</strong></div>
          <div class="ace-line">The following is a list of some known issues.</div>
          <div class="ace-line">✧ In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause issues.</div>
          <div class="ace-line">✧ Currently, [Summon: Aurelia Aurita] does not inherit Morale from summoner.</div>
          <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
          <div class="ace-line">✦ Fixed an issue where the pick-up range bonus from [Eclosion] would not apply.</div>
          <div class="ace-line">✦ Fixed an issue in Mystic Maze where [Seaborne Moon] would not apply.</div>
          <div class="ace-line"><strong>[Update Details - 2025-11-20]</strong></div>
          <div class="ace-line">✦ Optimized performance on selected mobile devices.</div>
          <div class="ace-line">✦ Fixed some text translation errors.</div>
        </body>
      </html>
    `;

    it('should parse known issues correctly', () => {
      const result = PatchParser.parse(sampleHTML);
      
      expect(result.knownIssues).toHaveLength(2);
      expect(result.knownIssues[0].description).toContain('Longbow: Embla Inflorescence');
      expect(result.knownIssues[0].highlightedTerms).toContain('Longbow: Embla Inflorescence');
      expect(result.knownIssues[1].description).toContain('Summon: Aurelia Aurita');
    });

    it('should parse update groups correctly', () => {
      const result = PatchParser.parse(sampleHTML);
      
      expect(result.updates).toHaveLength(2);
      expect(result.updates[0].date).toBe('2025-11-22'); // Newest first
      expect(result.updates[1].date).toBe('2025-11-20');
    });

    it('should parse patch notes within update groups', () => {
      const result = PatchParser.parse(sampleHTML);
      
      const firstUpdate = result.updates[0];
      expect(firstUpdate.notes).toHaveLength(2);
      expect(firstUpdate.notes[0].description).toContain('Eclosion');
      expect(firstUpdate.notes[0].highlightedTerms).toContain('Eclosion');
      expect(firstUpdate.notes[0].type).toBe('fix');
    });

    it('should sort updates by date (newest first)', () => {
      const result = PatchParser.parse(sampleHTML);
      
      expect(result.updates[0].date).toBe('2025-11-22');
      expect(result.updates[1].date).toBe('2025-11-20');
    });

    it('should assign unique IDs to issues', () => {
      const result = PatchParser.parse(sampleHTML);
      
      const ids = result.knownIssues.map(issue => issue.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should assign unique IDs to patch notes', () => {
      const result = PatchParser.parse(sampleHTML);
      
      const allNotes = result.updates.flatMap(update => update.notes);
      const ids = allNotes.map(note => note.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('should include lastUpdated timestamp', () => {
      const result = PatchParser.parse(sampleHTML);
      
      expect(result.lastUpdated).toBeDefined();
      expect(new Date(result.lastUpdated).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should handle malformed HTML gracefully', () => {
      const malformedHTML = '<div>Invalid HTML without proper structure';
      const result = PatchParser.parse(malformedHTML);
      
      expect(result.knownIssues).toEqual([]);
      expect(result.updates).toEqual([]);
      expect(result.error).toBeUndefined(); // Should not error, just return empty
    });

    it('should handle empty HTML', () => {
      const emptyHTML = '';
      const result = PatchParser.parse(emptyHTML);
      
      expect(result.knownIssues).toEqual([]);
      expect(result.updates).toEqual([]);
    });

    it('should correctly identify optimization type patches', () => {
      const result = PatchParser.parse(sampleHTML);
      
      const optimizationNote = result.updates
        .flatMap(update => update.notes)
        .find(note => note.description.includes('Optimized'));
      
      expect(optimizationNote?.type).toBe('optimization');
    });
  });

  describe('parse with real Patch.txt structure', () => {
    const realWorldHTML = `
      <!DOCTYPE html>
      <html>
        <body>
          <div class="ace-line">Dear Phoxhunter,</div>
          <h3 class="heading-3 ace-line"><strong>▍Known Issues<br><br></strong></h3>
          <div class="ace-line">The following is a list of some known issues in the current version.</div>
          <div class="ace-line">✧ In Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause the launch point of homing arrows to be positioned incorrectly after charging. This issue is scheduled for a near-future fix.</div>
          <div class="ace-line">✧ In the current version, [Summon: Aurelia Aurita] from [Rebecca] and [Summon: Tentacles] from [Tabethe] do not inherit Morale or Resolve from their summoner. A fix is planned for a future version.</div>
          <div class="ace-line"><strong>[Update Details - 2025-11-22]</strong></div>
          <div class="ace-line">✦ Fixed an issue where the pick-up range bonus from the [Eclosion] effect, granted by Psyche's Intron Lv. 4, would not apply immediately upon entering the [Flamboyance] state.</div>
          <div class="ace-line">✦ Fixed an issue in Mystic Maze where the set effect of [Seaborne Moon] would not immediately apply its pick-up range bonus upon activation.</div>
          <div class="ace-line"><strong>[Update Details - 2025-11-20]</strong></div>
          <div class="ace-line">✦ Fixed an issue in Co-op Commissions, using the [Longbow: Embla Inflorescence] may cause the launch point of homing arrows to be positioned incorrectly after charging.</div>
          <div class="ace-line">✦ Optimized the reconnection logic for mobile devices when the game is switched to the background.</div>
        </body>
      </html>
    `;

    it('should extract multiple highlighted terms from single issue', () => {
      const result = PatchParser.parse(realWorldHTML);
      
      const issueWithMultipleTerms = result.knownIssues.find(
        issue => issue.description.includes('Rebecca')
      );
      
      expect(issueWithMultipleTerms?.highlightedTerms).toContain('Summon: Aurelia Aurita');
      expect(issueWithMultipleTerms?.highlightedTerms).toContain('Rebecca');
      expect(issueWithMultipleTerms?.highlightedTerms).toContain('Summon: Tentacles');
      expect(issueWithMultipleTerms?.highlightedTerms).toContain('Tabethe');
    });

    it('should extract multiple highlighted terms from single patch note', () => {
      const result = PatchParser.parse(realWorldHTML);
      
      const noteWithMultipleTerms = result.updates[0].notes.find(
        note => note.description.includes('Flamboyance')
      );
      
      expect(noteWithMultipleTerms?.highlightedTerms).toContain('Eclosion');
      expect(noteWithMultipleTerms?.highlightedTerms).toContain('Flamboyance');
    });

    it('should handle dates in correct format', () => {
      const result = PatchParser.parse(realWorldHTML);
      
      result.updates.forEach(update => {
        expect(update.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(update.displayDate).toBe(`Update Details - ${update.date}`);
      });
    });
  });
});
