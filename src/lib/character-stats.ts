// Character Stats Data Structure
import { DemonWedge, DemonWedgeStat } from '@/lib/demon-wedges-data';

export interface CharacterLevelStats {
  Level: number;
  ATK: string;
  HP: string;
  Shield: string;
  DEF: string;
  'Max Sanity': string;
  'Skill DMG': string;
  'Skill Range': string;
  'Skill Duration': string;
  'Skill Efficiency': string;
  Morale: string;
  Resolve: string;
}

export interface CharacterData {
  name: string;
  overview_stats: CharacterLevelStats[];
}

export interface CharacterStatsLookup {
  [name: string]: CharacterData;
}

export interface FinalStats {
  ATK: number;
  HP: number;
  Shield: number;
  DEF: number;
  MaxSanity: number;
  SkillDMG: number;
  SkillRange: number;
  SkillDuration: number;
  SkillEfficiency: number;
  Morale: number;
  Resolve: number;
}

export interface NormalizedWedgeStat {
  statName: keyof FinalStats;
  value: number;
  isPercentage: boolean;
}

export type SelectedWedgeSlot = {
  wedge: DemonWedge;
  level: number;
  enabled: boolean;
};

import BerenicaData from '@/data/characters/Berenica.json';
import DaphneData from '@/data/characters/Daphne.json';
import HellfireData from '@/data/characters/Hellfire.json';
import LadyNifleData from '@/data/characters/Lady Nifle.json';
import LisbellData from '@/data/characters/Lisbell.json';
import LynnData from '@/data/characters/Lynn.json';
import MCData from '@/data/characters/MC.json';
import MargieData from '@/data/characters/Margie.json';
import OutsiderData from '@/data/characters/Outsider.json';
import PhantasioData from '@/data/characters/Phantasio.json';
import PsycheData from '@/data/characters/Psyche.json';
import RandyData from '@/data/characters/Randy.json';
import RebeccaData from '@/data/characters/Rebecca.json';
import RhythmData from '@/data/characters/Rhythm.json';
import SibylleData from '@/data/characters/Sibylle.json';
import TabetheData from '@/data/characters/Tabethe.json';
import TruffleFilbertData from '@/data/characters/Truffle and Filbert.json';
import YaleOliverData from '@/data/characters/Yale and Oliver.json';

export const charactersByName: CharacterStatsLookup = {
  Berenica: BerenicaData as CharacterData,
  Daphne: DaphneData as CharacterData,
  Hellfire: HellfireData as CharacterData,
  'Lady Nifle': LadyNifleData as CharacterData,
  Lisbell: LisbellData as CharacterData,
  Lynn: LynnData as CharacterData,
  MC: MCData as CharacterData,
  Margie: MargieData as CharacterData,
  Outsider: OutsiderData as CharacterData,
  Phantasio: PhantasioData as CharacterData,
  Psyche: PsycheData as CharacterData,
  Randy: RandyData as CharacterData,
  Rebecca: RebeccaData as CharacterData,
  Rhythm: RhythmData as CharacterData,
  Sibylle: SibylleData as CharacterData,
  Tabethe: TabetheData as CharacterData,
  'Truffle and Filbert': TruffleFilbertData as CharacterData,
  'Yale and Oliver': YaleOliverData as CharacterData,
};

const LEVEL_MIN = 1;
const LEVEL_MAX = 80;

export function getCharacterStats(characterName: string, level: number): CharacterLevelStats | null {
  const characterData = charactersByName[characterName];
  if (!characterData) return null;

  const clampedLevel = Math.min(Math.max(level, LEVEL_MIN), LEVEL_MAX);
  const exactMatch = characterData.overview_stats.find((stat) => stat.Level === clampedLevel);

  if (exactMatch) return exactMatch;
  if (characterData.overview_stats.length === 0) return null;

  // Fallback to closest available level if data is sparse
  const sorted = [...characterData.overview_stats].sort((a, b) => a.Level - b.Level);
  return sorted.reduce((prev, current) =>
    Math.abs(current.Level - clampedLevel) < Math.abs(prev.Level - clampedLevel) ? current : prev
  );
}

export function parseStatValue(raw: string): { value: number; isPercentage: boolean } {
  const trimmed = raw.trim();
  const isPercentage = trimmed.endsWith('%');
  const numericString = isPercentage ? trimmed.slice(0, -1) : trimmed;
  const parsed = parseFloat(numericString);

  return {
    value: Number.isNaN(parsed) ? 0 : parsed,
    isPercentage,
  };
}

export function characterStatsToFinalStats(stats: CharacterLevelStats): FinalStats {
  return {
    ATK: parseStatValue(stats.ATK).value,
    HP: parseStatValue(stats.HP).value,
    Shield: parseStatValue(stats.Shield).value,
    DEF: parseStatValue(stats.DEF).value,
    MaxSanity: parseStatValue(stats['Max Sanity']).value,
    SkillDMG: parseStatValue(stats['Skill DMG']).value,
    SkillRange: parseStatValue(stats['Skill Range']).value,
    SkillDuration: parseStatValue(stats['Skill Duration']).value,
    SkillEfficiency: parseStatValue(stats['Skill Efficiency']).value,
    Morale: parseStatValue(stats.Morale).value,
    Resolve: parseStatValue(stats.Resolve).value,
  };
}

export function emptyFinalStats(): FinalStats {
  return {
    ATK: 0,
    HP: 0,
    Shield: 0,
    DEF: 0,
    MaxSanity: 0,
    SkillDMG: 0,
    SkillRange: 0,
    SkillDuration: 0,
    SkillEfficiency: 0,
    Morale: 0,
    Resolve: 0,
  };
}

const wedgeStatNameMap: Record<string, keyof FinalStats> = {
  atk: 'ATK',
  hp: 'HP',
  shield: 'Shield',
  def: 'DEF',
  'max sanity': 'MaxSanity',
  'max sanity%': 'MaxSanity',
  'skill dmg': 'SkillDMG',
  'skill range': 'SkillRange',
  'skill duration': 'SkillDuration',
  'skill efficiency': 'SkillEfficiency',
  morale: 'Morale',
  resolve: 'Resolve',
};

function normalizeWedgeName(rawName: string): keyof FinalStats | null {
  const normalized = rawName.trim().toLowerCase();
  if (wedgeStatNameMap[normalized]) return wedgeStatNameMap[normalized];

  const strippedPercent = normalized.replace(/\s*%$/, '');
  if (wedgeStatNameMap[strippedPercent]) return wedgeStatNameMap[strippedPercent];

  return null;
}

export function parseDemonWedgeStat(rawName: string, rawValue: string): NormalizedWedgeStat | null {
  const statName = normalizeWedgeName(rawName);
  if (!statName) return null;

  const parsed = parseStatValue(rawValue);
  return {
    statName,
    value: parsed.value,
    isPercentage: parsed.isPercentage,
  };
}

const additiveStats: Array<keyof FinalStats> = ['SkillDMG', 'SkillRange', 'SkillDuration', 'SkillEfficiency', 'Morale', 'Resolve'];

export function applyWedgeStats(base: FinalStats, wedgeStats: NormalizedWedgeStat[]): FinalStats {
  const result: FinalStats = { ...base };

  wedgeStats.forEach(({ statName, value, isPercentage }) => {
    if (isPercentage) {
      if (additiveStats.includes(statName)) {
        result[statName] += value;
      } else {
        result[statName] *= 1 + value / 100;
      }
    } else {
      result[statName] += value;
    }
  });

  return result;
}

function getWedgeStatsForSelection(selection: SelectedWedgeSlot): DemonWedgeStat[] {
  const { wedge, level } = selection;
  if (!wedge.levels || wedge.levels.length === 0) {
    return wedge.stats;
  }

  const exact = wedge.levels.find((lvl) => lvl.level === level);
  if (exact?.stats) return exact.stats;

  const byIndex = wedge.levels[level];
  if (byIndex?.stats) return byIndex.stats;

  return wedge.stats;
}

export function collectWedgeStats(
  wedgeSlots: (SelectedWedgeSlot | null | undefined)[] = [],
  consonanceSlots: (SelectedWedgeSlot | null | undefined)[] = []
): NormalizedWedgeStat[] {
  const normalizedStats: NormalizedWedgeStat[] = [];

  const addStatsFromSelection = (selection: SelectedWedgeSlot | null | undefined) => {
    if (!selection || !selection.enabled) return;

    const stats = getWedgeStatsForSelection(selection);
    stats.forEach((stat) => {
      const normalized = parseDemonWedgeStat(stat.name, stat.value);
      if (normalized) {
        normalizedStats.push(normalized);
      }
    });
  };

  [...(wedgeSlots || []), ...(consonanceSlots || [])].forEach(addStatsFromSelection);
  return normalizedStats;
}

export function getAllCharacterNames(): string[] {
  return Object.keys(charactersByName);
}
