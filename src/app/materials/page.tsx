'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  Sword,
  Wrench,
  BookOpen,
  Scroll,
  Pin,
  PinOff,
  Sparkles,
  TrendingUp,
  Filter,
  X
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Weapon component to weapon name mapping
const weaponComponentMapping: Record<string, string> = {
  'Blade_Amberglow-_Blade': 'Blade_Amberglow',
  'Blade_Amberglow-_Grip': 'Blade_Amberglow',
  'Bluecurrent_Pulse-_Barrel': 'Bluecurrent_Pulse',
  'Bluecurrent_Pulse-_Frame': 'Bluecurrent_Pulse',
  'Destructo-_Barrel': 'Destructo',
  'Destructo-_Bolt': 'Destructo',
  'Destructo-_Frame': 'Destructo',
  'Entropic_Singularity-_Barrel': 'Entropic_Singularity',
  'Entropic_Singularity-_Bolt': 'Entropic_Singularity',
  'Entropic_Singularity-_Frame': 'Entropic_Singularity',
  'Exiled_Fangs-_Grip': 'Exiled_Fangs',
  'Exiled_Fangs-_Left_Blade': 'Exiled_Fangs',
  'Exiled_Fangs-_Right_Blade': 'Exiled_Fangs',
  'Fathomless_Sharkgaze-_Blade_(Left)': 'Fathomless_Sharkgaze',
  'Fathomless_Sharkgaze-_Blade_(Right)': 'Fathomless_Sharkgaze',
  'Fathomless_Sharkgaze-_Grip': 'Fathomless_Sharkgaze',
  'Firearm_Feast-_Barrel': 'Firearm_Feast',
  'Firearm_Feast-_Bolt': 'Firearm_Feast',
  'Firearm_Feast-_Frame': 'Firearm_Feast',
  'Flamme_De_Epuration-_Barrel': 'Flamme_De_Epuration',
  'Flamme_De_Epuration-_Bolt': 'Flamme_De_Epuration',
  'Flamme_De_Epuration-_Frame': 'Flamme_De_Epuration',
  'Ingenious_Tactics-_Blade': 'Ingenious_Tactics',
  'Ingenious_Tactics-_Grip': 'Ingenious_Tactics',
  'Ironforger-_Blade': 'Ironforger',
  'Ironforger-_Grip': 'Ironforger',
  'Momiji_Itteki-_Blade': 'Momiji_Itteki',
  'Momiji_Itteki-_Decoration': 'Momiji_Itteki',
  'Momiji_Itteki-_Grip': 'Momiji_Itteki',
  'Pyrothirst-_Blade': 'Pyrothirst',
  'Pyrothirst-_Grip': 'Pyrothirst',
  'Remanent_Reminiscence-_Blade': 'Remanent_Reminiscence',
  'Remanent_Reminiscence-_Grip': 'Remanent_Reminiscence',
  'Rendhusk-_Barrel': 'Rendhusk',
  'Rendhusk-_Bolt': 'Rendhusk',
  'Rendhusk-_Frame': 'Rendhusk',
  'Screamshot-_Barrel': 'Screamshot',
  'Screamshot-_Bolt': 'Screamshot',
  'Screamshot-_Frame': 'Screamshot',
  'Searing_Sandwhisper-_Bowstring': 'Searing_Sandwhisper',
  'Searing_Sandwhisper-_Lower_Limb': 'Searing_Sandwhisper',
  'Searing_Sandwhisper-_Riser': 'Searing_Sandwhisper',
  'Searing_Sandwhisper-_Upper_Limb': 'Searing_Sandwhisper',
  'Silent_Sower-_Barrel': 'Silent_Sower',
  'Silent_Sower-_Bolt': 'Silent_Sower',
  'Silent_Sower-_Frame': 'Silent_Sower',
  'Silverwhite_Edict-_Barrel': 'Silverwhite_Edict',
  'Silverwhite_Edict-_Bolt': 'Silverwhite_Edict',
  'Silverwhite_Edict-_Frame': 'Silverwhite_Edict',
  "Siren's_Kiss-_Blade": "Siren's_Kiss",
  "Siren's_Kiss-_Grip": "Siren's_Kiss",
  'Soulrend-_Bowstring': 'Soulrend',
  'Soulrend-_Lower_Limb': 'Soulrend',
  'Soulrend-_Upper_Limb': 'Soulrend',
  'Tetherlash-_Blade': 'Tetherslash',
  'Tetherlash-_Grip': 'Tetherslash',
  'Undying_Oneiros-_Blade': 'Undying_Oneiros',
  'Undying_Oneiros-_Grip': 'Undying_Oneiros',
  'Wanewraith-_Blade': 'Wanewraith',
  'Wanewraith-_Grip': 'Wanewraith',
  'Withershade-_Blade': 'Withershade',
  'Withershade-_Decoration': 'Withershade',
  'Withershade-_Grip': 'Withershade',
};

// Crafting Timer Interface
interface CraftingTimer {
  id: string;
  itemName: string;
  category: string;
  endTime: number;
  quantity: number;
  durationMinutes: number;
}

// Upgrade material forging recipes
const upgradeMaterialRecipes: Record<
  string,
  {
    coinCost: number;
    timeMinutes: number;
    materials: { name: string; quantity: number; category: string }[];
  }
> = {
  Repulsive_Crystal: {
    coinCost: 10000,
    timeMinutes: 10,
    materials: [
      { name: 'Luno_Memento', quantity: 15, category: 'Upgrade Materials' },
      { name: 'Vehicle_Armour', quantity: 5, category: 'Upgrade Materials' },
      { name: 'Insulation_Coating', quantity: 5, category: 'Upgrade Materials' },
      { name: 'Statue_Debris', quantity: 2, category: 'Upgrade Materials' },
    ],
  },
  Gold_Sand: {
    coinCost: 10000,
    timeMinutes: 10,
    materials: [
      { name: 'Luno_Memento', quantity: 15, category: 'Upgrade Materials' },
      { name: 'Snowswift_Tail_Feather', quantity: 5, category: 'Upgrade Materials' },
      { name: 'Fuel_Regent', quantity: 5, category: 'Upgrade Materials' },
      { name: 'Statue_Debris', quantity: 2, category: 'Upgrade Materials' },
    ],
  },
  Projectile: {
    coinCost: 50000,
    timeMinutes: 15,
    materials: [
      { name: 'Gold_Sand', quantity: 4, category: 'Upgrade Materials' },
      { name: 'Repulsive_Crystal', quantity: 6, category: 'Upgrade Materials' },
      { name: 'Weaponholder', quantity: 2, category: 'Upgrade Materials' },
      { name: 'Coolant', quantity: 2, category: 'Upgrade Materials' },
    ],
  },
  Sharpening_Potion: {
    coinCost: 50000,
    timeMinutes: 15,
    materials: [
      { name: 'Gold_Sand', quantity: 6, category: 'Upgrade Materials' },
      { name: 'Repulsive_Crystal', quantity: 4, category: 'Upgrade Materials' },
      { name: 'Weaponholder', quantity: 2, category: 'Upgrade Materials' },
      { name: 'Coolant', quantity: 2, category: 'Upgrade Materials' },
    ],
  },
};

// Weapon crafting recipes (for Secret Letters)
const weaponCraftingRecipes: Record<
  string,
  {
    coinCost: number;
    timeMinutes: number;
    craftingItem: { name: string; quantity: number };
    components: string[];
  }
> = {
  // Melee Weapons
  'Secret_Letter-_Blade_Amberglow': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Blade_Amberglow-_Blade', 'Blade_Amberglow-_Grip'],
  },
  'Secret_Letter-_Exiled_Fangs': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Exiled_Fangs-_Grip', 'Exiled_Fangs-_Left_Blade', 'Exiled_Fangs-_Right_Blade'],
  },
  'Secret_Letter-_Fathomless_Sharkgaze': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Fathomless_Sharkgaze-_Blade_(Left)', 'Fathomless_Sharkgaze-_Blade_(Right)', 'Fathomless_Sharkgaze-_Grip'],
  },
  'Secret_Letter-_Ingenious_Tactics': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Ingenious_Tactics-_Blade', 'Ingenious_Tactics-_Grip'],
  },
  'Secret_Letter-_Ironforger': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Ironforger-_Blade', 'Ironforger-_Grip'],
  },
  'Secret_Letter-_Momiji_Itteki': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Momiji_Itteki-_Blade', 'Momiji_Itteki-_Decoration', 'Momiji_Itteki-_Grip'],
  },
  'Secret_Letter-_Pyrothirst': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Pyrothirst-_Blade', 'Pyrothirst-_Grip'],
  },
  'Secret_Letter-_Remanent_Reminiscence': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Remanent_Reminiscence-_Blade', 'Remanent_Reminiscence-_Grip'],
  },
  "Secret_Letter-_Siren's_Kiss": {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ["Siren's_Kiss-_Blade", "Siren's_Kiss-_Grip"],
  },
  'Secret_Letter-_Tetherslash': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Tetherlash-_Blade', 'Tetherlash-_Grip'],
  },
  'Secret_Letter-_Undying_Oneiros': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Undying_Oneiros-_Blade', 'Undying_Oneiros-_Grip'],
  },
  'Secret_Letter-_Wanewraith': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Wanewraith-_Blade', 'Wanewraith-_Grip'],
  },
  'Secret_Letter-_Withershade': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Sharpening_Potion', quantity: 2 },
    components: ['Withershade-_Blade', 'Withershade-_Decoration', 'Withershade-_Grip'],
  },
  // Ranged Weapons
  'Secret_Letter-_Bluecurrent_Pulse': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Bluecurrent_Pulse-_Barrel', 'Bluecurrent_Pulse-_Frame'],
  },
  'Secret_Letter-_Destructo': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Destructo-_Barrel', 'Destructo-_Bolt', 'Destructo-_Frame'],
  },
  'Secret_Letter-_Excresduo': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Excresduo-_Barrel', 'Excresduo-_Frame'],
  },
  'Secret_Letter-_Entropic_Singularity': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Entropic_Singularity-_Barrel', 'Entropic_Singularity-_Bolt', 'Entropic_Singularity-_Frame'],
  },
  'Secret_Letter-_Flamme_De_Epuration': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Flamme_De_Epuration-_Barrel', 'Flamme_De_Epuration-_Bolt', 'Flamme_De_Epuration-_Frame'],
  },
  'Secret_Letter-_Rendhusk': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Rendhusk-_Barrel', 'Rendhusk-_Bolt', 'Rendhusk-_Frame'],
  },
  'Secret_Letter-_Screamshot': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Screamshot-_Barrel', 'Screamshot-_Bolt', 'Screamshot-_Frame'],
  },
  'Secret_Letter-_Osteobreaker': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Osteobreaker-_Barrel', 'Osteobreaker-_Bolt', 'Osteobreaker-_Frame'],
  },
  'Secret_Letter-_Searing_Sandwhisper': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Searing_Sandwhisper-_Bowstring', 'Searing_Sandwhisper-_Lower_Limb', 'Searing_Sandwhisper-_Riser', 'Searing_Sandwhisper-_Upper_Limb'],
  },
  'Secret_Letter-_Silent_Sower': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Silent_Sower-_Barrel', 'Silent_Sower-_Bolt', 'Silent_Sower-_Frame'],
  },
  'Secret_Letter-_Silverwhite_Edict': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Silverwhite_Edict-_Barrel', 'Silverwhite_Edict-_Bolt', 'Silverwhite_Edict-_Frame'],
  },
  'Secret_Letter-_Soulrend': {
    coinCost: 280000,
    timeMinutes: 180,
    craftingItem: { name: 'Projectile', quantity: 2 },
    components: ['Soulrend-_Bowstring', 'Soulrend-_Lower_Limb', 'Soulrend-_Upper_Limb'],
  },
};

// Character secret letters (items that unlock characters)
const characterSecretLetters = new Set([
  'Secret_Letter-_Berenica',
  'Secret_Letter-_Daphne',
  'Secret_Letter-_Lady_Nifle',
  'Secret_Letter-_Lisbelle',
  'Secret_Letter-_Lynn',
  'Secret_Letter-_Margie',
  'Secret_Letter-_Outsider',
  'Secret_Letter-_Randy',
  'Secret_Letter-_Rebecca',
  'Secret_Letter-_Sibylle',
  'Secret_Letter-_Truffle_and_Filbert',
]);

// Material categories with their items (ordered by priority)
const categories = {
  'Secret Letters': [
    'Secret_Letter-_Berenica',
    'Secret_Letter-_Blade_Amberglow',
    'Secret_Letter-_Bluecurrent_Pulse',
    'Secret_Letter-_Daphne',
    'Secret_Letter-_Destructo',
    'Secret_Letter-_Entropic_Singularity',
    'Secret_Letter-_Excresduo',
    'Secret_Letter-_Exiled_Fangs',
    'Secret_Letter-_Fathomless_Sharkgaze',
    'Secret_Letter-_Flamme_De_Epuration',
    'Secret_Letter-_Ingenious_Tactics',
    'Secret_Letter-_Ironforger',
    'Secret_Letter-_Lady_Nifle',
    'Secret_Letter-_Lisbelle',
    'Secret_Letter-_Lynn',
    'Secret_Letter-_Margie',
    'Secret_Letter-_Momiji_Itteki',
    'Secret_Letter-_Osteobreaker',
    'Secret_Letter-_Outsider',
    'Secret_Letter-_Pyrothirst',
    'Secret_Letter-_Randy',
    'Secret_Letter-_Rebecca',
    'Secret_Letter-_Remanent_Reminiscence',
    'Secret_Letter-_Rendhusk',
    'Secret_Letter-_Screamshot',
    'Secret_Letter-_Searing_Sandwhisper',
    'Secret_Letter-_Sibylle',
    'Secret_Letter-_Silent_Sower',
    'Secret_Letter-_Silverwhite_Edict',
    "Secret_Letter-_Siren's_Kiss",
    'Secret_Letter-_Soulrend',
    'Secret_Letter-_Tetherslash',
    'Secret_Letter-_Truffle_and_Filbert',
    'Secret_Letter-_Undying_Oneiros',
    'Secret_Letter-_Wanewraith',
    'Secret_Letter-_Withershade',
  ],
  'Weapon Components': [
    'Blade_Amberglow-_Blade',
    'Blade_Amberglow-_Grip',
    'Bluecurrent_Pulse-_Barrel',
    'Bluecurrent_Pulse-_Frame',
    'Destructo-_Barrel',
    'Destructo-_Bolt',
    'Destructo-_Frame',
    'Entropic_Singularity-_Barrel',
    'Entropic_Singularity-_Bolt',
    'Entropic_Singularity-_Frame',
    'Exiled_Fangs-_Grip',
    'Exiled_Fangs-_Left_Blade',
    'Exiled_Fangs-_Right_Blade',
    'Fathomless_Sharkgaze-_Blade_(Left)',
    'Fathomless_Sharkgaze-_Blade_(Right)',
    'Fathomless_Sharkgaze-_Grip',
    'Firearm_Feast-_Barrel',
    'Firearm_Feast-_Bolt',
    'Firearm_Feast-_Frame',
    'Flamme_De_Epuration-_Barrel',
    'Flamme_De_Epuration-_Bolt',
    'Flamme_De_Epuration-_Frame',
    'Ingenious_Tactics-_Blade',
    'Ingenious_Tactics-_Grip',
    'Ironforger-_Blade',
    'Ironforger-_Grip',
    'Momiji_Itteki-_Blade',
    'Momiji_Itteki-_Decoration',
    'Momiji_Itteki-_Grip',
    'Pyrothirst-_Blade',
    'Pyrothirst-_Grip',
    'Remanent_Reminiscence-_Blade',
    'Remanent_Reminiscence-_Grip',
    'Rendhusk-_Barrel',
    'Rendhusk-_Bolt',
    'Rendhusk-_Frame',
    'Screamshot-_Barrel',
    'Screamshot-_Bolt',
    'Screamshot-_Frame',
    'Searing_Sandwhisper-_Bowstring',
    'Searing_Sandwhisper-_Lower_Limb',
    'Searing_Sandwhisper-_Riser',
    'Searing_Sandwhisper-_Upper_Limb',
    'Silent_Sower-_Barrel',
    'Silent_Sower-_Bolt',
    'Silent_Sower-_Frame',
    'Silverwhite_Edict-_Barrel',
    'Silverwhite_Edict-_Bolt',
    'Silverwhite_Edict-_Frame',
    "Siren's_Kiss-_Blade",
    "Siren's_Kiss-_Grip",
    'Soulrend-_Bowstring',
    'Soulrend-_Lower_Limb',
    'Soulrend-_Upper_Limb',
    'Tetherlash-_Blade',
    'Tetherlash-_Grip',
    'Undying_Oneiros-_Blade',
    'Undying_Oneiros-_Grip',
    'Wanewraith-_Blade',
    'Wanewraith-_Grip',
    'Withershade-_Blade',
    'Withershade-_Decoration',
    'Withershade-_Grip',
  ],
  'Upgrade Materials': [
    'Advanced_Weapon_Component-_Barrel',
    'Advanced_Weapon_Component-_Blade',
    'Advanced_Weapon_Component-_Bolt',
    'Advanced_Weapon_Component-_Decoration',
    'Advanced_Weapon_Component-_Frame',
    'Advanced_Weapon_Component-_Grip',
    'Auspicious_Scroll',
    'Azure_Pearl',
    'Basic_Weapon_Component-_Barrel',
    'Basic_Weapon_Component-_Blade',
    'Basic_Weapon_Component-_Bolt',
    'Basic_Weapon_Component-_Decoration',
    'Basic_Weapon_Component-_Frame',
    'Basic_Weapon_Component-_Grip',
    'Bird_Egg',
    'Blessing_Trinketry',
    'Bottled_Lightning',
    'Caramellus',
    'Carmine_Globule',
    'Chain',
    'Cleansing_Water',
    'Coin',
    'Combat_Melody_I',
    'Combat_Melody_II',
    'Combat_Melody_III',
    'Combat_Melody_IV',
    'Commission_Manual-_Volume_I',
    'Commission_Manual-_Volume_II',
    'Compound_Potion',
    'Contact_Index',
    'Coolant',
    'Copy_of_Elysian_Hymnal',
    'Crackbloom',
    'Creeping_Tendrils',
    'Crown_of_Enlightenment',
    'Cryo_Teargem',
    'Damaged_Sal_Volatile',
    'Dewiolet',
    'Eclipta_Grass',
    'Everbright_Flame',
    'Eye_of_Infinity',
    'Filthoid_Carapace',
    'Filthoid_Cell_Culture_Dish',
    'Filthoid_Clot',
    'Filthoid_Polymer',
    'Filthoid_Tentacle',
    'Fire-Tempered_Shackles',
    'Flame_Lizard_Scale',
    'Fluid_Alloy',
    'Fuel_Regent',
    'Galeweaver',
    'Gilded_Emblem',
    'Gleaming_Arrow',
    'Gleaming_Precision_Scope',
    'Gleaming_Quiver',
    'Gold_Sand',
    'Golden_Floriated_Diadem',
    'Golden_Wool',
    'Goldshell_Nut',
    'Herbal_Sprig',
    'Humectant',
    'Indigofly',
    'Insulation_Coating',
    'Intermediate_Weapon_Component-_Barrel',
    'Intermediate_Weapon_Component-_Blade',
    'Intermediate_Weapon_Component-_Bolt',
    'Intermediate_Weapon_Component-_Decoration',
    'Intermediate_Weapon_Component-_Frame',
    'Intermediate_Weapon_Component-_Grip',
    'Iridescent_Prism',
    'Iron_Emblem',
    'Ironshell_Nut',
    'Legion_Nameplate',
    'Lense_of_Enlightenment',
    'Lightning_Rod',
    'Lucent_Prism',
    'Lumite',
    'Luno_Memento',
    'Metallic_Armour',
    'Obsidian_Key',
    'Oceanifly',
    'Phoxene_Plumule',
    'Phoxene',
    'Phoxichor_Canister',
    'Plop_Plop_Stone',
    'Portable_Power_Unit',
    'Prismatic_Hourglass',
    'Pristine_Hourglass',
    'Processed_Herb',
    'Projectile',
    'Propulsion_Unit',
    'Recasting_Mould',
    'Repulsive_Crystal',
    'Ring_of_Chronal_Reversion',
    'Ring_of_Escaped_Entropy',
    'Ring_of_Justice_Rekindled',
    'Ring_of_Severed_Fear',
    'Rust-Etched_Dagger',
    'Sacral_Bellflower',
    'Sacred_Candle',
    'Scales_of_Eternal_Justice',
    'Seashell',
    'Secret_Letter_Clue',
    'Serum_Syringe',
    'Sharpening_Potion',
    'Signal_Cable',
    'Silver_Emblem',
    'Silverite',
    'Snowcap',
    'Snowswift_Tail_Feather',
    'Solidified_Lava',
    'Spring_Water',
    'Statue_Debris',
    'Stone_Powder',
    'Stormfall_Jade',
    'Tempest_Piercer',
    'Tome_of_the_Noclunism_Ritual',
    'Toy_Hammer',
    'Track_Shift-Module',
    'Twilight_Tread',
    'Vehicle_Armour',
    'Veil_of_Silence',
    'Vermillion_Teardrop',
    'Virifly',
    'Water_Purifier',
    'Weapon_Manual_I',
    'Weapon_Manual_II',
    'Weapon_Manual_III',
    'Weapon_Manual_IV',
    'Weapon_Track-Shift_Module',
    'Weaponholder',
    'Withered_Bough',
    'Yum_Cream',
    'Yum_Treat',
    'Yum-Yum_Cream',
    'Yum-Yum_Milk',
    'Yum-Yum_Treat',
    'Yum-Yum-Yum_Cream',
  ],
  'Readables': [
    'A_Brawl_at_the_Galea_Theatre',
    "A_Healer's_Journal",
    'A_Journal_Used_to_the_Last_Page',
    'A_Lost_Diary',
    'A_Piece_of_Scratch_Paper',
    'A_Secret_From_a_Wall_Crack',
    'A_Warning_from_a_Wall_Crack',
    'Aged_Newspaper',
    "Alice's_Diary",
    'An_Addressless_Letter',
    'Angry_Etchings',
    "Annie's_Letter",
    'Betwixt_Leaves_and_Branches-_The_Eve_of_Uprising',
    'Betwixt_Leaves_and_Branches-_The_Filthoid_Waves',
    'Bloodstained_Journal',
    'Boycott_the_Silvercandle_Carnival!',
    'Catastrophe_in_a_Bottle-_Volume_I',
    'Crumpled_Leaflet_from_The_Forsakens',
    'Dust-Laden_Family_Letter',
    "Elisa_Taylor's_Profile",
    'Emergency_Medical_Log',
    "Emperor's_Signet_Ring",
    'Field_Notes-_Volume_I',
    'Field_Notes-_Volume_II',
    'Field_Notes-_Volume_III',
    'Foreign_Tome',
    'Hive_Mind',
    "Hunt_Clark's_Profile",
    'Icelake_III',
    'Icelake_IV',
    'Icelake_IX',
    'Icelake_V',
    'Icelake_VI',
    'Icelake_VII',
    'Icelake_VIII',
    'Icelake_X',
    'Icelake-_Volume_I',
    'Icelake-_Volume_II',
    'Illness_and_Humanity_—_Excerpt_on_Deterioration',
    'Letter_from_the_Buyer',
    'Lonza_Fortress_(III)',
    'Lonza_Fortress_Operation_Directive',
    'Lonza_Fortress-_Volume_I',
    'Lonza_Fortress-_Volume_II',
    'Medicine_Labels',
    'Momiji-_A_Chronicle_of_Rebellion_I',
    'Momiji-_A_Chronicle_of_Rebellion_II',
    'Momiji-_A_Chronicle_of_Rebellion_III',
    'Momiji-_A_Chronicle_of_Rebellion_IV',
    'My_Dearest_Comrade',
    'Opened_Letter',
    'Overdue_Notices',
    'Prop_Log_-_Galea_Theatre',
    "Psyche_Frey's_Profile",
    'Purgatorio_Island-_Volume_I',
    'Purgatorio_Island-_Volume_II',
    'Purgatorio_Island-_Volume_III',
    'Purgatorio_Island-_Volume_IV',
    'Request_for_Additional_Maintenance_Manpower',
    'Request_for_Drainage_System_Upgrade',
    'Say_Goodbye_to_Poverty_and_Achieve_Financial_Freedom',
    'Scattered_Diary-_Volume_I',
    'Scattered_Diary-_Volume_II',
    'Scattered_Diary-_Volume_III',
    'Scrunched_Note',
    'Secret_Histories_of_the_Forsakens_(I)',
    'Silvercandle_Hymns_(I)',
    'Silvercandle_Hymns_(II)',
    'Silvercandle_Hymns_(III)',
    'Silvercandle_Hymns_(IV)',
    'Silvercandle_Hymns_(IX)',
    'Silvercandle_Hymns_(V)',
    'Silvercandle_Hymns_(VI)',
    'Silvercandle_Hymns_(VII)',
    'Silvercandle_Hymns_(VIII)',
    'Silvercandle_Hymns_(X)',
    'Simulated_Battle_Logs',
    "Some_Forsaken_Member's_Journal",
    'Statue_Inscription',
    'Surgical_Log',
    "The_Forsakens'_Pamphlet",
    "The_Invincible_Legion's_Chief_I",
    "The_Invincible_Legion's_Chief_II",
    'Transcript_of_a_Conversation',
    'Triumph_Day_Leave_Notice',
    'Unsent_Letter_in_Reply',
    "What'll_It_Be-_Just_Say_the_Word!",
    'Yellowed_Diary',
  ],
  'Quest Items': [
    'A_Box_of_Paper_Stars',
    'A_Dangerous_Prescription',
    "A_Girl's_Old_Clothes",
    "Avar's_Photograph",
    'Bloodstained_Photograph',
    'D10_Die',
    'Familiar_Wire_Portrait',
    'Medical_Kit',
    'Old_Key',
    'Portrait_Gift_from_Faye',
    'Treasure_on_the_Saddle',
    'White_Flower',
  ],
};

// Category icons
const categoryIcons: Record<string, string> = {
  'Secret Letters': '✉️',
  'Weapon Components': '⚔️',
  'Upgrade Materials': '⚙️',
  'Readables': '📖',
  'Quest Items': '📜',
};

export default function MaterialsPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ name: string; category: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);
  const [itemHistory, setItemHistory] = useState<{ name: string; category: string }[]>([]);
  const [craftQuantity, setCraftQuantity] = useState<number>(1);
  const [pinnedItems, setPinnedItems] = useState<Set<string>>(new Set());
  const [showPinnedSidebar, setShowPinnedSidebar] = useState(true);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [activeTimers, setActiveTimers] = useState<CraftingTimer[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedTimers = localStorage.getItem('activeCraftingTimers');
    if (savedTimers) {
      try {
        // Filter out old completed timers that are more than 24 hours old to keep it clean
        const parsed = JSON.parse(savedTimers);
        const now = Date.now();
        const validTimers = parsed.filter((t: CraftingTimer) => t.endTime > now - 86400000);
        setActiveTimers(validTimers);
      } catch (e) {
        console.error('Failed to load active timers:', e);
      }
    }
  }, []);

  // Save timers to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('activeCraftingTimers', JSON.stringify(activeTimers));
    }
  }, [activeTimers]);

  // Check for completed timers and send notifications
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      activeTimers.forEach((timer) => {
        if (timer.endTime <= now && timer.endTime > now - 5000) { // Check if just finished (within last 5s) to avoid spam
          // This check is a bit naive for reloads, but good enough for active page.
          // Better approach: check if we already notified. For now, let's just rely on the user removing the timer.
          // Actually, let's just trigger notification if it's time.
          // To prevent spam, we can add a 'notified' flag, but let's keep it simple first.
          // We will rely on the fact that we only trigger if we are exactly at the time (or close).
          // But setInterval might miss the exact ms.
          // Let's just use a separate effect for scheduling timeouts for future events.
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers]);

  // Schedule notifications for active timers
  useEffect(() => {
    activeTimers.forEach(timer => {
      const now = Date.now();
      const timeRemaining = timer.endTime - now;

      if (timeRemaining > 0) {
        const timeoutId = setTimeout(() => {
          if (Notification.permission === 'granted') {
            new Notification('Crafting Complete!', {
              body: `${formatItemName(timer.itemName)} (x${timer.quantity}) is ready!`,
              icon: `/Forging/${timer.category}/${timer.itemName}.png` // Try to use item image
            });
          } else if (Notification.permission !== 'denied') {
            Notification.requestPermission().then(permission => {
              if (permission === 'granted') {
                new Notification('Crafting Complete!', {
                  body: `${formatItemName(timer.itemName)} (x${timer.quantity}) is ready!`,
                });
              }
            });
          }
        }, timeRemaining);

        return () => clearTimeout(timeoutId);
      }
    });
  }, [activeTimers]);

  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      alert('This browser does not support desktop notification');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  const startTimer = async (itemName: string, category: string, quantity: number, durationMinutes: number) => {
    const granted = await requestNotificationPermission();
    if (!granted) {
      alert('Please enable notifications to use the timer feature.');
      return;
    }

    const endTime = Date.now() + durationMinutes * 60 * 1000;
    const newTimer: CraftingTimer = {
      id: Date.now().toString(),
      itemName,
      category,
      endTime,
      quantity,
      durationMinutes
    };

    setActiveTimers(prev => [...prev, newTimer]);
    alert(`Timer started for ${formatItemName(itemName)}! You will be notified in ${durationMinutes} minutes.`);
  };

  const removeTimer = (id: string) => {
    setActiveTimers(prev => prev.filter(t => t.id !== id));
  };

  const formatTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const diff = endTime - now;

    if (diff <= 0) return 'Ready!';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Force update for timer countdowns
  const [, setTick] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('pinnedCraftingItems');
    if (saved) {
      try {
        setPinnedItems(new Set(JSON.parse(saved)));
      } catch (e) {
        console.error('Failed to load pinned items:', e);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem('itemCraftQuantities');
    if (saved) {
      try {
        setItemQuantities(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load item quantities:', e);
      }
    }
  }, []);

  // Toggle pin for craftable items
  const togglePin = (itemName: string, category: string) => {
    const itemKey = `${category}:${itemName}`;
    const newPinned = new Set(pinnedItems);

    if (newPinned.has(itemKey)) {
      newPinned.delete(itemKey);
    } else {
      newPinned.add(itemKey);
    }

    setPinnedItems(newPinned);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('pinnedCraftingItems', JSON.stringify([...newPinned]));
    }
  };

  // Check if item is pinned
  const isPinned = (itemName: string, category: string) => {
    return pinnedItems.has(`${category}:${itemName}`);
  };

  // Check if item is craftable
  const isCraftable = (itemName: string, category: string) => {
    if (category === 'Upgrade Materials') {
      return !!upgradeMaterialRecipes[itemName];
    }
    if (category === 'Secret Letters') {
      return !!weaponCraftingRecipes[itemName];
    }
    return false;
  };

  // Get item quantity
  const getItemQuantity = (itemName: string, category: string) => {
    const itemKey = `${category}:${itemName}`;
    return itemQuantities[itemKey] || 0;
  };

  // Update item quantity
  const updateItemQuantity = (itemName: string, category: string, quantity: number) => {
    const itemKey = `${category}:${itemName}`;
    const newQuantities = { ...itemQuantities };

    if (quantity <= 0) {
      delete newQuantities[itemKey];
    } else {
      newQuantities[itemKey] = quantity;
    }

    setItemQuantities(newQuantities);

    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('itemCraftQuantities', JSON.stringify(newQuantities));
    }
  };

  // Navigate to item with history tracking
  const navigateToItem = (name: string, category: string) => {
    if (selectedItem) {
      setItemHistory([...itemHistory, selectedItem]);
    }
    setSelectedItem({ name, category });
    // Load saved quantity or default to 1
    const savedQuantity = getItemQuantity(name, category);
    setCraftQuantity(savedQuantity > 0 ? savedQuantity : 1);
  };

  // Go back to previous item
  const goBack = () => {
    if (itemHistory.length > 0) {
      const previous = itemHistory[itemHistory.length - 1];
      setSelectedItem(previous);
      setItemHistory(itemHistory.slice(0, -1));
      // Load saved quantity or default to 1
      const savedQuantity = getItemQuantity(previous.name, previous.category);
      setCraftQuantity(savedQuantity > 0 ? savedQuantity : 1);
    }
  };

  // Close modal and clear history
  const closeModal = () => {
    setSelectedItem(null);
    setItemHistory([]);
    setCraftQuantity(1); // Reset quantity when closing
  };

  // Calculate total materials needed recursively
  const calculateTotalMaterials = (itemName: string, quantity: number, category: string): Record<string, { quantity: number; category: string }> => {
    const totals: Record<string, { quantity: number; category: string }> = {};

    if (category === 'Upgrade Materials') {
      const recipe = upgradeMaterialRecipes[itemName];
      if (recipe) {
        recipe.materials.forEach((material) => {
          const subMaterials = calculateTotalMaterials(material.name, material.quantity * quantity, material.category);
          Object.entries(subMaterials).forEach(([name, data]) => {
            if (totals[name]) {
              totals[name].quantity += data.quantity;
            } else {
              totals[name] = { ...data };
            }
          });
        });
      } else {
        // Base material (no recipe)
        if (totals[itemName]) {
          totals[itemName].quantity += quantity;
        } else {
          totals[itemName] = { quantity, category };
        }
      }
    } else if (category === 'Secret Letters') {
      const recipe = weaponCraftingRecipes[itemName];
      if (recipe) {
        // Add crafting item
        const craftingMaterials = calculateTotalMaterials(recipe.craftingItem.name, recipe.craftingItem.quantity * quantity, 'Upgrade Materials');
        Object.entries(craftingMaterials).forEach(([name, data]) => {
          if (totals[name]) {
            totals[name].quantity += data.quantity;
          } else {
            totals[name] = { ...data };
          }
        });

        // Add weapon components
        recipe.components.forEach((component) => {
          if (totals[component]) {
            totals[component].quantity += quantity;
          } else {
            totals[component] = { quantity, category: 'Weapon Components' };
          }
        });
      }
    }

    return totals;
  };

  // Get weapon name from component
  const getWeaponFromComponent = (componentName: string): string | null => {
    return weaponComponentMapping[componentName] || null;
  };

  // Get all components for a weapon
  const getWeaponComponents = (weaponName: string): string[] => {
    return Object.entries(weaponComponentMapping)
      .filter(([_, weapon]) => weapon === weaponName)
      .map(([component]) => component);
  };

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const expandAll = () => {
    setExpandedCategories(new Set(Object.keys(filteredCategories)));
  };

  const collapseAll = () => {
    setExpandedCategories(new Set());
  };

  const getUpgradeRecipe = (itemName: string) => {
    return upgradeMaterialRecipes[itemName] || null;
  };

  const getWeaponCraftingRecipe = (secretLetterName: string) => {
    return weaponCraftingRecipes[secretLetterName] || null;
  };

  const formatItemName = (name: string) => {
    return name.replace(/_/g, ' ');
  };

  // Filter items based on search query
  const filterItems = (items: string[]) => {
    if (!searchQuery.trim()) return items;
    const query = searchQuery.toLowerCase();
    return items.filter((item) =>
      formatItemName(item).toLowerCase().includes(query)
    );
  };

  // Filter categories that have matching items
  const getFilteredCategories = () => {
    if (!searchQuery.trim()) return categories;

    const filtered: Record<string, string[]> = {};
    Object.entries(categories).forEach(([category, items]) => {
      const filteredItems = filterItems(items);
      if (filteredItems.length > 0) {
        filtered[category] = filteredItems;
      }
    });
    return filtered;
  };

  const filteredCategories = getFilteredCategories();
  const upgradeRecipe =
    selectedItem && selectedItem.category === 'Upgrade Materials'
      ? getUpgradeRecipe(selectedItem.name)
      : null;
  const weaponCraftingRecipe =
    selectedItem && selectedItem.category === 'Secret Letters' && !characterSecretLetters.has(selectedItem.name)
      ? getWeaponCraftingRecipe(selectedItem.name)
      : null;

  const renderSelectedItemModal = () => {
    if (!selectedItem || selectedWeapon) {
      return null;
    }

    const isSecretLetter = selectedItem.category === 'Secret Letters';
    const isUpgradeMaterial = selectedItem.category === 'Upgrade Materials';
    const isCharacterLetter = isSecretLetter && characterSecretLetters.has(selectedItem.name);


    return (
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={closeModal}
      >
        <div
          className="bg-slate-900 border-2 border-purple-500 rounded-xl max-w-4xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {formatItemName(selectedItem.name)}
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-lg">{categoryIcons[selectedItem.category]}</span>
                <p className="text-slate-400">{selectedItem.category}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {itemHistory.length > 0 && (
                <button
                  onClick={goBack}
                  className="text-slate-400 hover:text-white transition-colors px-3 py-1 bg-slate-800 rounded-lg border border-slate-600 hover:border-purple-500 flex items-center gap-2"
                  title="Go back"
                >
                  <span className="text-lg">←</span>
                  <span className="text-sm">Back</span>
                </button>
              )}
              <button
                onClick={closeModal}
                className="text-slate-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Modal Content */}
          <div className="flex flex-col items-center gap-6">
            <div className="w-64 h-64 relative bg-slate-800 rounded-lg overflow-hidden border-2 border-slate-700">
              <Image
                src={`/Forging/${selectedItem.category}/${selectedItem.name}.png`}
                alt={formatItemName(selectedItem.name)}
                fill
                className="object-contain p-4"
              />
            </div>



            {/* Character Unlock Info - For Secret Letters */}
            {isCharacterLetter && (
              <div className="w-full bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">🎭</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-yellow-300 mb-2">Character Unlock</h4>
                    <p className="text-white text-base leading-relaxed">
                      Collect <span className="text-yellow-300 font-bold text-xl px-2 py-1 bg-yellow-500/20 rounded">30</span> pieces of this Secret Letter to unlock{' '}
                      <span className="text-yellow-300 font-bold text-xl px-2 py-1 bg-yellow-500/20 rounded">1</span> character
                    </p>
                    <div className="mt-3 flex items-center gap-2 text-sm text-yellow-200/80">
                      <span>💡</span>
                      <span>Tip: Farm these letters to expand your character roster!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Weapon Crafting Info - For Secret Letters (Weapons) */}
            {isSecretLetter && weaponCraftingRecipe && (
              <div className="w-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-lg p-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">⚔️</div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-purple-300 mb-2">Weapon Crafting</h4>
                    <p className="text-white text-sm">Forge this weapon using the materials below</p>
                  </div>
                </div>

                {/* Quantity Calculator */}
                <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Craft Quantity</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const newQty = Math.max(1, craftQuantity - 1);
                          setCraftQuantity(newQty);
                          updateItemQuantity(selectedItem.name, selectedItem.category, newQty);
                        }}
                        className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-purple-500 rounded-lg text-white font-bold transition-colors text-sm"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={craftQuantity}
                        onChange={(e) => {
                          const newQty = Math.max(1, Math.min(999, parseInt(e.target.value) || 1));
                          setCraftQuantity(newQty);
                          updateItemQuantity(selectedItem.name, selectedItem.category, newQty);
                        }}
                        className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-white text-center text-xl font-bold focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => {
                          const newQty = Math.min(999, craftQuantity + 1);
                          setCraftQuantity(newQty);
                          updateItemQuantity(selectedItem.name, selectedItem.category, newQty);
                        }}
                        className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-purple-500 rounded-lg text-white font-bold transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={Math.min(craftQuantity, 100)}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value);
                        setCraftQuantity(newQty);
                        updateItemQuantity(selectedItem.name, selectedItem.category, newQty);
                      }}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-500"
                    />
                    {craftQuantity > 100 && (
                      <p className="text-xs text-slate-400 text-right">
                        Showing slider up to 100. Manual input used for higher quantities.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Total Coin Cost</p>
                    <p className="text-2xl font-bold text-yellow-300">
                      {(weaponCraftingRecipe.coinCost * craftQuantity).toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Total Time Required</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-blue-300">{weaponCraftingRecipe.timeMinutes * craftQuantity} minutes</p>
                      <button
                        onClick={() => startTimer(selectedItem.name, selectedItem.category, craftQuantity, weaponCraftingRecipe.timeMinutes * craftQuantity)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>⏱️</span> Start Timer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Crafting Item */}
                <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="text-white font-semibold">Special Crafting Item</h5>
                    <button
                      onClick={() => navigateToItem(weaponCraftingRecipe.craftingItem.name, 'Upgrade Materials')}
                      className="text-sm text-purple-300 hover:text-white transition-colors underline"
                    >
                      View Item
                    </button>
                  </div>
                  <div className="flex items-center gap-4 bg-slate-800/80 border border-slate-700 rounded-lg p-3">
                    <div className="relative w-14 h-14 bg-slate-950 rounded-md overflow-hidden">
                      <Image
                        src={`/Forging/Upgrade Materials/${weaponCraftingRecipe.craftingItem.name}.png`}
                        alt={formatItemName(weaponCraftingRecipe.craftingItem.name)}
                        fill
                        className="object-contain p-2"
                      />
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{formatItemName(weaponCraftingRecipe.craftingItem.name)}</p>
                      <p className="text-slate-400 text-xs">Upgrade Material</p>
                    </div>
                    <span className="text-purple-300 text-base font-bold ml-auto">
                      x{weaponCraftingRecipe.craftingItem.quantity * craftQuantity}
                    </span>
                  </div>
                </div>

                {/* Required Components */}
                <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                  <h5 className="text-white font-semibold mb-3">Required Components</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {weaponCraftingRecipe.components.map((component) => (
                      <button
                        key={component}
                        onClick={() => navigateToItem(component, 'Weapon Components')}
                        className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-lg p-3 hover:border-purple-500 transition-colors text-left"
                      >
                        <div className="relative w-14 h-14 bg-slate-950 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={`/Forging/Weapon Components/${component}.png`}
                            alt={formatItemName(component)}
                            fill
                            className="object-contain p-2"
                          />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-white font-semibold text-sm">{formatItemName(component)}</p>
                          <p className="text-slate-400 text-xs">Weapon Component</p>
                        </div>
                        <span className="text-purple-300 text-base font-bold flex-shrink-0">
                          x{craftQuantity}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Total Materials Breakdown */}
                {(() => {
                  const totalMaterials = calculateTotalMaterials(selectedItem.name, craftQuantity, selectedItem.category);
                  const materialEntries = Object.entries(totalMaterials).sort((a, b) => {
                    if (a[1].category !== b[1].category) {
                      return a[1].category.localeCompare(b[1].category);
                    }
                    return a[0].localeCompare(b[0]);
                  });

                  if (materialEntries.length > 0) {
                    return (
                      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">📊</span>
                          <h5 className="text-lg font-bold text-green-300">Total Materials Needed</h5>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">All base materials required (including nested crafting)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                          {materialEntries.map(([name, data]) => (
                            <button
                              key={name}
                              onClick={() => navigateToItem(name, data.category)}
                              className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-lg p-2 hover:border-green-500 transition-colors text-left"
                            >
                              <div className="relative w-12 h-12 bg-slate-950 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  src={`/Forging/${data.category}/${name}.png`}
                                  alt={formatItemName(name)}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-white font-semibold text-xs truncate">{formatItemName(name)}</p>
                                <p className="text-slate-400 text-xs">{data.category}</p>
                              </div>
                              <span className="text-green-300 text-sm font-bold flex-shrink-0">
                                x{data.quantity}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Upgrade Material Forging */}
            {isUpgradeMaterial && upgradeRecipe && (
              <div className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">Materials &amp; Forging</h4>
                    <p className="text-slate-400 text-sm">{formatItemName(selectedItem.name)}</p>
                  </div>
                </div>

                {/* Quantity Calculator */}
                <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-400">Craft Quantity</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          const newQty = Math.max(1, craftQuantity - 1);
                          setCraftQuantity(newQty);
                          updateItemQuantity(selectedItem.name, selectedItem.category, newQty);
                        }}
                        className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-purple-500 rounded-lg text-white font-bold transition-colors text-sm"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        min="1"
                        max="999"
                        value={craftQuantity}
                        onChange={(e) => {
                          const newQty = Math.max(1, Math.min(999, parseInt(e.target.value) || 1));
                          setCraftQuantity(newQty);
                          updateItemQuantity(selectedItem.name, selectedItem.category, newQty);
                        }}
                        className="w-20 bg-slate-800 border border-slate-600 rounded-lg px-3 py-1 text-white text-center text-xl font-bold focus:outline-none focus:border-purple-500"
                      />
                      <button
                        onClick={() => {
                          const newQty = Math.min(999, craftQuantity + 1);
                          setCraftQuantity(newQty);
                          updateItemQuantity(selectedItem.name, selectedItem.category, newQty);
                        }}
                        className="w-8 h-8 bg-slate-800 hover:bg-slate-700 border border-slate-600 hover:border-purple-500 rounded-lg text-white font-bold transition-colors text-sm"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Slider */}
                  <div className="space-y-2">
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={Math.min(craftQuantity, 100)}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value);
                        setCraftQuantity(newQty);
                        updateItemQuantity(selectedItem.name, selectedItem.category, newQty);
                      }}
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-purple-500 [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-purple-500"
                    />
                    {craftQuantity > 100 && (
                      <p className="text-xs text-slate-400 text-right">
                        Showing slider up to 100. Manual input used for higher quantities.
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Total Coin Cost</p>
                    <p className="text-2xl font-bold text-yellow-300">
                      {(upgradeRecipe.coinCost * craftQuantity).toLocaleString('en-US')}
                    </p>
                  </div>
                  <div className="bg-slate-900/70 border border-slate-700 rounded-lg p-4">
                    <p className="text-slate-400 text-sm mb-1">Total Time Required</p>
                    <div className="flex items-center justify-between">
                      <p className="text-xl font-bold text-blue-300">{upgradeRecipe.timeMinutes * craftQuantity} minutes</p>
                      <button
                        onClick={() => startTimer(selectedItem.name, selectedItem.category, craftQuantity, upgradeRecipe.timeMinutes * craftQuantity)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-semibold transition-colors flex items-center gap-1"
                      >
                        <span>⏱️</span> Start Timer
                      </button>
                    </div>
                  </div>
                </div>

                {/* Materials Needed */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {upgradeRecipe.materials.map((material) => (
                    <button
                      key={material.name}
                      onClick={() => navigateToItem(material.name, material.category)}
                      className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-lg p-3 hover:border-purple-500 transition-colors text-left"
                    >
                      <div className="relative w-14 h-14 bg-slate-950 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={`/Forging/Upgrade Materials/${material.name}.png`}
                          alt={formatItemName(material.name)}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-white font-semibold text-sm">{formatItemName(material.name)}</p>
                        <p className="text-slate-400 text-xs">Upgrade Material</p>
                      </div>
                      <span className="text-purple-300 text-base font-bold flex-shrink-0">
                        x{material.quantity * craftQuantity}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Total Materials Breakdown */}
                {(() => {
                  const totalMaterials = calculateTotalMaterials(selectedItem.name, craftQuantity, selectedItem.category);
                  const materialEntries = Object.entries(totalMaterials).sort((a, b) => {
                    if (a[1].category !== b[1].category) {
                      return a[1].category.localeCompare(b[1].category);
                    }
                    return a[0].localeCompare(b[0]);
                  });

                  if (materialEntries.length > 0) {
                    return (
                      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border-2 border-green-500/50 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-2xl">📊</span>
                          <h5 className="text-lg font-bold text-green-300">Total Materials Needed</h5>
                        </div>
                        <p className="text-sm text-slate-300 mb-4">All base materials required (including nested crafting)</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-96 overflow-y-auto">
                          {materialEntries.map(([name, data]) => (
                            <button
                              key={name}
                              onClick={() => navigateToItem(name, data.category)}
                              className="flex items-center gap-3 bg-slate-900/80 border border-slate-700 rounded-lg p-2 hover:border-green-500 transition-colors text-left"
                            >
                              <div className="relative w-12 h-12 bg-slate-950 rounded-md overflow-hidden flex-shrink-0">
                                <Image
                                  src={`/Forging/${data.category}/${name}.png`}
                                  alt={formatItemName(name)}
                                  fill
                                  className="object-contain p-1"
                                />
                              </div>
                              <div className="flex-1 text-left min-w-0">
                                <p className="text-white font-semibold text-xs truncate">{formatItemName(name)}</p>
                                <p className="text-slate-400 text-xs">{data.category}</p>
                              </div>
                              <span className="text-green-300 text-sm font-bold flex-shrink-0">
                                x{data.quantity}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            )}

            {/* Item Info */}
            <div className="w-full bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-400 mb-1">Category</p>
                  <p className="text-white font-semibold">{selectedItem.category}</p>
                </div>
                <div>
                  <p className="text-slate-400 mb-1">Item Name</p>
                  <p className="text-white font-semibold">{formatItemName(selectedItem.name)}</p>
                </div>
              </div>
              {isCharacterLetter && (
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <p className="text-slate-400 mb-1">Type</p>
                  <p className="text-yellow-300 font-semibold">Character Unlock Item</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {/* Pin Button (only for craftable items) */}
              {isCraftable(selectedItem.name, selectedItem.category) && (
                <button
                  onClick={() => togglePin(selectedItem.name, selectedItem.category)}
                  className={`w-full px-4 py-3 rounded-lg transition-all font-semibold flex items-center justify-center gap-2 ${isPinned(selectedItem.name, selectedItem.category)
                    ? 'bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-400'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border-2 border-slate-600 hover:border-purple-500'
                    }`}
                >
                  <span className="text-xl">📌</span>
                  <span>{isPinned(selectedItem.name, selectedItem.category) ? 'Unpin Item' : 'Pin Item'}</span>
                </button>
              )}

              <div className="flex gap-3">
                {itemHistory.length > 0 && (
                  <button
                    onClick={goBack}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-lg transition-colors font-semibold border border-slate-600 hover:border-purple-500 flex items-center justify-center gap-2"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                )}
                <button
                  onClick={closeModal}
                  className={`${itemHistory.length > 0 ? 'flex-1' : 'w-full'} bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors font-semibold`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-purple-500 rounded-sm"></div>
              <h1 className="text-2xl font-bold text-white tracking-widest uppercase">
                Materials & Forging
              </h1>
            </div>
            <button
              onClick={() => setShowPinnedSidebar(!showPinnedSidebar)}
              className="px-4 py-2 bg-slate-800 border border-slate-600 text-slate-300 hover:text-white hover:border-purple-500 rounded-lg transition-colors flex items-center gap-2"
            >
              <span>📌</span>
              <span>{showPinnedSidebar ? 'Hide' : 'Show'} Pinned</span>
              {pinnedItems.size > 0 && (
                <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {pinnedItems.size}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content with Sidebar */}
      <div className="flex">
        {/* Pinned Items Sidebar */}
        {showPinnedSidebar && (
          <div className="w-80 bg-slate-900/50 border-r border-slate-700 min-h-screen sticky top-[73px] self-start">
            <div className="p-4">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📌</span>
                <span>Pinned Craftable Items</span>
              </h2>

              {/* Active Timers Section */}
              {activeTimers.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-bold text-blue-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                    <span>⏱️</span> Active Forging
                  </h3>
                  <div className="space-y-2">
                    {activeTimers.map((timer) => (
                      <div key={timer.id} className="bg-slate-800/80 border border-blue-500/50 rounded-lg p-3 relative overflow-hidden">
                        {/* Progress Bar Background */}
                        <div
                          className="absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-1000"
                          style={{
                            width: `${Math.max(0, Math.min(100, 100 - ((timer.endTime - Date.now()) / (timer.durationMinutes * 60 * 1000)) * 100))}%`
                          }}
                        />

                        <div className="flex items-center gap-3 relative z-10">
                          <div className="w-10 h-10 relative bg-slate-900 rounded overflow-hidden flex-shrink-0">
                            <Image
                              src={`/Forging/${timer.category}/${timer.itemName}.png`}
                              alt={formatItemName(timer.itemName)}
                              fill
                              className="object-contain p-1"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs text-white font-semibold truncate">
                              {formatItemName(timer.itemName)}
                            </p>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-blue-300 font-mono">
                                {formatTimeRemaining(timer.endTime)}
                              </span>
                              <span className="text-[10px] text-slate-400">x{timer.quantity}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => removeTimer(timer.id)}
                            className="text-slate-500 hover:text-red-400 transition-colors"
                            title="Cancel Timer"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="h-px bg-slate-700 my-4" />
                </div>
              )}

              {pinnedItems.size === 0 ? (
                <div className="text-center py-8 text-slate-400 text-sm">
                  <p className="mb-2">No pinned items yet</p>
                  <p>Click the 📌 button on any craftable item to pin it</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {[...pinnedItems].map((itemKey) => {
                    const [category, itemName] = itemKey.split(':');
                    const quantity = getItemQuantity(itemName, category);
                    return (
                      <div
                        key={itemKey}
                        className="bg-slate-800/50 border border-slate-600 rounded-lg p-3 hover:border-purple-500 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => navigateToItem(itemName, category)}
                            className="flex-1 flex items-center gap-3 cursor-pointer"
                          >
                            <div className="w-12 h-12 relative bg-slate-900 rounded overflow-hidden flex-shrink-0">
                              <Image
                                src={`/Forging/${category}/${itemName}.png`}
                                alt={formatItemName(itemName)}
                                fill
                                className="object-contain p-1"
                              />
                              {quantity > 0 && (
                                <div className="absolute bottom-0 right-0 bg-purple-600 text-white text-xs px-1.5 py-0.5 rounded-tl font-bold">
                                  {quantity}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs text-slate-300 group-hover:text-purple-300 transition-colors line-clamp-2">
                                {formatItemName(itemName)}
                              </p>
                              <div className="flex items-center justify-between mt-0.5">
                                <p className="text-xs text-slate-500">
                                  {categoryIcons[category]} {category}
                                </p>
                                {quantity > 0 && (
                                  <p className="text-xs text-purple-400 font-semibold">
                                    Required: {quantity}
                                  </p>
                                )}
                              </div>
                            </div>
                          </button>
                          <button
                            onClick={() => togglePin(itemName, category)}
                            className="text-purple-400 hover:text-red-400 transition-colors p-1"
                            title="Unpin"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className={`flex-1 px-6 py-8 ${showPinnedSidebar ? 'max-w-[calc(100%-20rem)]' : 'container mx-auto'}`}>
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Search Bar & Controls */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search items..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 pl-12 text-white placeholder-slate-400 focus:outline-none focus:border-purple-500 transition-colors"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl">
                    🔍
                  </span>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${viewMode === 'grid'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-slate-900 border-slate-600 text-slate-400 hover:text-white'
                      }`}
                    title="Grid View"
                  >
                    ⊞
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg border transition-colors ${viewMode === 'list'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-slate-900 border-slate-600 text-slate-400 hover:text-white'
                      }`}
                    title="List View"
                  >
                    ☰
                  </button>
                </div>

                {/* Expand/Collapse All */}
                <div className="flex gap-2">
                  <button
                    onClick={expandAll}
                    className="px-4 py-2 bg-slate-900 border border-slate-600 text-slate-400 hover:text-white rounded-lg transition-colors whitespace-nowrap"
                    title="Expand All"
                  >
                    Expand All
                  </button>
                  <button
                    onClick={collapseAll}
                    className="px-4 py-2 bg-slate-900 border border-slate-600 text-slate-400 hover:text-white rounded-lg transition-colors whitespace-nowrap"
                    title="Collapse All"
                  >
                    Collapse All
                  </button>
                </div>
              </div>

              {/* Search Results */}
              {searchQuery && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-slate-400">
                    Found <span className="text-purple-400 font-semibold">{Object.values(filteredCategories).reduce((sum, items) => sum + items.length, 0)}</span> items
                    {' '}in <span className="text-purple-400 font-semibold">{Object.keys(filteredCategories).length}</span> categories
                  </p>
                </div>
              )}
            </div>

            {/* Categories */}
            {Object.keys(filteredCategories).length === 0 ? (
              <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                <p className="text-xl text-slate-400">No items found matching "{searchQuery}"</p>
              </div>
            ) : (
              Object.entries(filteredCategories).map(([category, items]) => {
                const filteredItems = filterItems(items);
                return (
                  <div
                    key={category}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden"
                  >
                    {/* Category Header */}
                    <button
                      onClick={() => toggleCategory(category)}
                      className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{categoryIcons[category]}</span>
                        <h2 className="text-xl font-bold text-white">{category}</h2>
                        <span className="text-sm text-slate-400">
                          ({filteredItems.length}{searchQuery && ` of ${categories[category as keyof typeof categories].length}`} items)
                        </span>
                      </div>
                      <span className="text-white text-xl">
                        {expandedCategories.has(category) ? '▼' : '▶'}
                      </span>
                    </button>

                    {/* Category Content */}
                    {expandedCategories.has(category) && (
                      <div className="px-6 py-4 border-t border-slate-700">
                        {viewMode === 'grid' ? (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                            {filteredItems.map((item) => {
                              const craftable = isCraftable(item, category);
                              const pinned = isPinned(item, category);
                              return (
                                <div key={item} className="relative">
                                  <button
                                    onClick={() => navigateToItem(item, category)}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 hover:border-purple-500 hover:scale-105 transition-all group cursor-pointer"
                                  >
                                    <div className="aspect-square relative mb-2 bg-slate-800 rounded overflow-hidden">
                                      <Image
                                        src={`/Forging/${category}/${item}.png`}
                                        alt={formatItemName(item)}
                                        fill
                                        className="object-contain p-2"
                                      />
                                    </div>
                                    <p className="text-xs text-slate-300 text-center line-clamp-2 group-hover:text-purple-300 transition-colors">
                                      {formatItemName(item)}
                                    </p>
                                  </button>
                                  {craftable && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        togglePin(item, category);
                                      }}
                                      className={`absolute top-1 right-1 w-6 h-6 rounded-full flex items-center justify-center transition-all ${pinned
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-slate-800/80 text-slate-400 hover:bg-purple-600 hover:text-white'
                                        }`}
                                      title={pinned ? 'Unpin' : 'Pin'}
                                    >
                                      <span className="text-xs">📌</span>
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {filteredItems.map((item) => {
                              const craftable = isCraftable(item, category);
                              const pinned = isPinned(item, category);
                              return (
                                <div key={item} className="relative">
                                  <button
                                    onClick={() => navigateToItem(item, category)}
                                    className="w-full bg-slate-900/50 border border-slate-600 rounded-lg p-3 hover:border-purple-500 transition-colors group flex items-center gap-4 cursor-pointer"
                                  >
                                    <div className="w-16 h-16 relative bg-slate-800 rounded overflow-hidden flex-shrink-0">
                                      <Image
                                        src={`/Forging/${category}/${item}.png`}
                                        alt={formatItemName(item)}
                                        fill
                                        className="object-contain p-2"
                                      />
                                    </div>
                                    <p className="text-sm text-slate-300 text-left group-hover:text-purple-300 transition-colors flex-1">
                                      {formatItemName(item)}
                                    </p>
                                    {craftable && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          togglePin(item, category);
                                        }}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${pinned
                                          ? 'bg-purple-600 text-white'
                                          : 'bg-slate-800 text-slate-400 hover:bg-purple-600 hover:text-white'
                                          }`}
                                        title={pinned ? 'Unpin' : 'Pin'}
                                      >
                                        <span className="text-sm">📌</span>
                                      </button>
                                    )}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Item Detail Modal */}
        {renderSelectedItemModal()}

        {/* Weapon Detail Modal */}
        {selectedWeapon && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedWeapon(null)}
          >
            <div
              className="bg-slate-900 border-2 border-purple-500 rounded-xl max-w-5xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {formatItemName(selectedWeapon)}
                  </h3>
                  <p className="text-slate-400">Full Weapon & Components</p>
                </div>
                <button
                  onClick={() => setSelectedWeapon(null)}
                  className="text-slate-400 hover:text-white transition-colors text-2xl"
                >
                  ✕
                </button>
              </div>

              {/* Weapon Image */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-white mb-4 text-center">Complete Weapon</h4>
                  <div className="w-full h-64 relative bg-slate-800 rounded-lg overflow-hidden">
                    <Image
                      src={`/Forging/Secret Letters/Secret_Letter-_${selectedWeapon}.png`}
                      alt={formatItemName(selectedWeapon)}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                </div>
              </div>

              {/* Weapon Components */}
              <div>
                <h4 className="text-lg font-bold text-white mb-4">Weapon Components</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {getWeaponComponents(selectedWeapon).map((component) => (
                    <button
                      key={component}
                      onClick={() => {
                        setSelectedWeapon(null);
                        navigateToItem(component, 'Weapon Components');
                      }}
                      className="bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-purple-500 rounded-lg p-3 transition-all group"
                    >
                      <div className="aspect-square relative bg-slate-900 rounded overflow-hidden mb-2">
                        <Image
                          src={`/Forging/Weapon Components/${component}.png`}
                          alt={formatItemName(component)}
                          fill
                          className="object-contain p-2"
                        />
                      </div>
                      <p className="text-xs text-slate-300 text-center line-clamp-2 group-hover:text-purple-300 transition-colors">
                        {formatItemName(component)}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setSelectedWeapon(null)}
                className="w-full mt-6 bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
