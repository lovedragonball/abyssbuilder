'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { allCharacters } from '@/lib/data';
import Image from 'next/image';

type TierMode = 'ramming' | 'boss';
type TierRank = 'T0' | 'T1' | 'T2' | 'T3';

interface TierData {
  dps: string[];
  support: string[];
}

// ข้อมูล Tier List สำหรับแต่ละโหมด
const tierListData: Record<TierMode, Record<TierRank, TierData>> = {
  ramming: {
    T0: {
      dps: ['Lynn', 'Lisbell', 'Berenica', 'Fushu'],
      support: ['Truffle and Filbert', 'Daphne'],
    },
    T1: {
      dps: ['Kezhou', 'Outsider', 'Psyche', 'Player'],
      support: ['Fina', 'Yuming', 'Randy'],
    },
    T2: {
      dps: ['Hellfire', 'Rhythm', 'Yale and Oliver', 'Phantasio'],
      support: ['Tabethe'],
    },
    T3: {
      dps: ['Margie', 'Zhiliu', 'Lady Nifle'],
      support: [],
    },
  },
  boss: {
    T0: {
      dps: ['Lynn', 'Berenica', 'Fushu', 'Lisbell', 'Kezhou', 'Lady Nifle'],
      support: ['Truffle and Filbert', 'Daphne', 'Fina'],
    },
    T1: {
      dps: ['Outsider', 'Hellfire', 'Phantasio', 'Rhythm'],
      support: ['Yuming', 'Randy', 'Tabethe'],
    },
    T2: {
      dps: ['Yale and Oliver'],
      support: ['Hilda'],
    },
    T3: {
      dps: ['Margie'],
      support: [],
    },
  },
};

const tierColors = {
  T0: 'from-rose-500/80 to-rose-600/80',
  T1: 'from-amber-400/80 to-amber-500/80',
  T2: 'from-emerald-400/80 to-emerald-500/80',
  T3: 'from-sky-400/80 to-sky-500/80',
};

const tierLabels = {
  T0: 'bg-rose-500/90',
  T1: 'bg-amber-400/90',
  T2: 'bg-emerald-400/90',
  T3: 'bg-sky-400/90',
};

export default function TierListPage() {
  const [mode, setMode] = useState<TierMode>('ramming');
  const [elementFilter, setElementFilter] = useState<string>('All');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [meleeFilter, setMeleeFilter] = useState<string>('All');
  const [featureFilter, setFeatureFilter] = useState<string>('All');
  const [selectedCharacters, setSelectedCharacters] = useState<string[]>([]);

  const elements = ['All', 'Umbro', 'Anemo', 'Pyro', 'Electro', 'Hydro', 'Lumino'];
  const roles = ['All', 'DPS', 'Support'];
  const meleeWeapons = ['All', 'Sword', 'Dual Blades', 'Whipsword', 'Greatsword', 'Katana', 'Polearm'];
  const features = ['All', 'Weapon DMG', 'Skill DMG', 'Consonance Weapon', 'Support', 'Healing', 'CC', 'Shielding', 'Summon'];

  const getCharacter = (name: string) => {
    return allCharacters.find((c) => c.name === name);
  };

  const matchesFilters = (character: any) => {
    if (elementFilter !== 'All' && character.element !== elementFilter) return false;
    if (roleFilter !== 'All') {
      const isDPS = character.role.includes('DPS');
      const isSupport = character.role.includes('Support');
      if (roleFilter === 'DPS' && !isDPS) return false;
      if (roleFilter === 'Support' && !isSupport) return false;
    }
    if (meleeFilter !== 'All' && character.melee !== meleeFilter) return false;
    if (featureFilter !== 'All') {
      if (featureFilter === 'Consonance Weapon' && !character.hasConsonanceWeapon) return false;
      if (featureFilter !== 'Consonance Weapon' && !character.role.includes(featureFilter)) return false;
    }
    return true;
  };

  const handleCharacterClick = (characterName: string) => {
    setSelectedCharacters((prev) => {
      if (prev.includes(characterName)) {
        return prev.filter((name) => name !== characterName);
      } else {
        return [...prev, characterName];
      }
    });
  };

  const renderCharacterCard = (characterName: string) => {
    const character = getCharacter(characterName);
    if (!character || !matchesFilters(character)) return null;

    const isSelected = selectedCharacters.includes(character.name);

    return (
      <motion.div
        key={character.id}
        className={`flex flex-col items-center gap-1 p-2 rounded-lg cursor-pointer transition-all ${
          isSelected 
            ? 'bg-primary/20 ring-2 ring-primary' 
            : 'bg-card/50 hover:bg-card'
        }`}
        onClick={() => handleCharacterClick(character.name)}
        whileHover={{ scale: 1.05, y: -2 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        <div className={`relative w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
          isSelected ? 'border-primary' : 'border-border'
        }`}>
          <Image
            src={character.image}
            alt={character.name}
            fill
            className="object-cover"
          />
          {isSelected && (
            <motion.div
              className="absolute inset-0 bg-primary/20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </div>
        <span className={`text-xs font-medium text-center transition-colors ${
          isSelected ? 'text-primary' : ''
        }`}>
          {character.name}
        </span>
      </motion.div>
    );
  };

  const renderTierRow = (tier: TierRank, index: number) => {
    const data = tierListData[mode][tier];
    
    return (
      <motion.div 
        key={tier} 
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {/* DPS Column */}
        <motion.div 
          className={`rounded-lg bg-gradient-to-br ${tierColors[tier]} p-4`}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              className={`${tierLabels[tier]} text-white font-bold text-xl px-4 py-2 rounded`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {tier}
            </motion.div>
            <span className="text-white font-semibold text-lg">DPS</span>
          </div>
          <div className="bg-background/90 rounded-lg p-4 min-h-[120px]">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {data.dps.map((name) => renderCharacterCard(name))}
            </div>
          </div>
        </motion.div>

        {/* Support Column */}
        <motion.div 
          className={`rounded-lg bg-gradient-to-br ${tierColors[tier]} p-4`}
          whileHover={{ scale: 1.01 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <motion.div 
              className={`${tierLabels[tier]} text-white font-bold text-xl px-4 py-2 rounded`}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              {tier}
            </motion.div>
            <span className="text-white font-semibold text-lg">SUPPORT</span>
          </div>
          <div className="bg-background/90 rounded-lg p-4 min-h-[120px]">
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 gap-3">
              {data.support.map((name) => renderCharacterCard(name))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-headline font-bold">Tier List</h1>
        <p className="text-muted-foreground">
          Character rankings based on performance in each mode
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 p-1 bg-card rounded-lg w-fit relative overflow-hidden">
        <motion.div
          className="absolute top-1 bottom-1 bg-primary rounded-md"
          initial={false}
          animate={{
            left: mode === 'ramming' ? 4 : 'calc(50% + 4px)',
            right: mode === 'ramming' ? 'calc(50% + 4px)' : 4,
          }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        />
        <button
          onClick={() => setMode('ramming')}
          className={`relative z-10 px-6 py-2 rounded-md font-medium transition-colors ${
            mode === 'ramming'
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Ramming
        </button>
        <button
          onClick={() => setMode('boss')}
          className={`relative z-10 px-6 py-2 rounded-md font-medium transition-colors ${
            mode === 'boss'
              ? 'text-primary-foreground'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          Boss
        </button>
      </div>

      {/* Filters */}
      <motion.div 
        className="bg-card border border-border rounded-lg p-4 space-y-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* Element Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Element</h3>
            {elementFilter !== 'All' && (
              <motion.button
                onClick={() => setElementFilter('All')}
                className="text-xs text-muted-foreground hover:text-foreground"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear
              </motion.button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {elements.map((element) => (
              <motion.button
                key={element}
                onClick={() => setElementFilter(element)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  elementFilter === element
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {element}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Role Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Role</h3>
            {roleFilter !== 'All' && (
              <motion.button
                onClick={() => setRoleFilter('All')}
                className="text-xs text-muted-foreground hover:text-foreground"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear
              </motion.button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {roles.map((role) => (
              <motion.button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  roleFilter === role
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {role}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Proficiency Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Proficiency</h3>
            {meleeFilter !== 'All' && (
              <motion.button
                onClick={() => setMeleeFilter('All')}
                className="text-xs text-muted-foreground hover:text-foreground"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear
              </motion.button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {meleeWeapons.map((weapon) => (
              <motion.button
                key={weapon}
                onClick={() => setMeleeFilter(weapon)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  meleeFilter === weapon
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {weapon}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Feature Filter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Feature</h3>
            {featureFilter !== 'All' && (
              <motion.button
                onClick={() => setFeatureFilter('All')}
                className="text-xs text-muted-foreground hover:text-foreground"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear
              </motion.button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {features.map((feature) => (
              <motion.button
                key={feature}
                onClick={() => setFeatureFilter(feature)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                  featureFilter === feature
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {feature}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Clear All Filters */}
        {(elementFilter !== 'All' || roleFilter !== 'All' || meleeFilter !== 'All' || featureFilter !== 'All') && (
          <motion.button
            onClick={() => {
              setElementFilter('All');
              setRoleFilter('All');
              setMeleeFilter('All');
              setFeatureFilter('All');
            }}
            className="w-full py-2 px-4 bg-muted hover:bg-muted/80 text-foreground rounded-md font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Clear All Filters
          </motion.button>
        )}
      </motion.div>

      {/* Legend */}
      <div className="bg-card border border-border rounded-lg p-4">
        <h3 className="font-semibold mb-2">Legend</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• <span className="text-rose-400 font-semibold">T0</span> - The strongest characters, highly recommended</li>
          <li>• <span className="text-amber-400 font-semibold">T1</span> - Very strong characters, great for general gameplay</li>
          <li>• <span className="text-emerald-400 font-semibold">T2</span> - Good characters, viable options</li>
          <li>• <span className="text-sky-400 font-semibold">T3</span> - Characters that require more investment</li>
        </ul>
      </div>

      {/* Selected Characters Info */}
      {selectedCharacters.length > 0 && (
        <motion.div
          className="bg-card border border-primary/50 rounded-lg p-3"
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Selected Characters ({selectedCharacters.length})</h3>
            <motion.button
              onClick={() => setSelectedCharacters([])}
              className="text-xs text-muted-foreground hover:text-foreground"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Clear All
            </motion.button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2">
            {selectedCharacters.map((charName, index) => {
              const char = getCharacter(charName);
              if (!char) return null;
              return (
                <motion.div
                  key={char.id}
                  className="flex items-center gap-2 p-2 bg-background/50 rounded-lg border border-border"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <div className="relative w-12 h-12 rounded-md overflow-hidden border-2 border-primary flex-shrink-0">
                    <Image src={char.image} alt={char.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-xs truncate">{char.name}</h4>
                    <div className="flex flex-wrap gap-0.5 mt-0.5">
                      <span className="text-[10px] px-1 py-0.5 bg-primary/20 rounded">{char.element}</span>
                      <span className="text-[10px] px-1 py-0.5 bg-primary/20 rounded">{char.role.split(' ')[0]}</span>
                    </div>
                  </div>
                  <motion.button
                    onClick={() => handleCharacterClick(char.name)}
                    className="text-muted-foreground hover:text-foreground flex-shrink-0 text-sm"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    ✕
                  </motion.button>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Tier List */}
      <motion.div
        className="space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderTierRow('T0', 0)}
        {renderTierRow('T1', 1)}
        {renderTierRow('T2', 2)}
        {renderTierRow('T3', 3)}
      </motion.div>

      {/* Notice */}
      <div className="bg-rose-950/20 border border-rose-900/30 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <span className="text-rose-400 text-xl">⚠️</span>
          <div className="space-y-1">
            <h4 className="font-semibold text-rose-300">Notice</h4>
            <p className="text-sm text-muted-foreground">
              This Tier List is only a recommendation. Actual performance depends on your build and playstyle.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
