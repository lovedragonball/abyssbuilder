'use client';

import { useState } from 'react';
import Image from 'next/image';

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

// Character secret letters (items that unlock characters)
const characterSecretLetters = new Set([
  'Secret_Letter-_Berenica',
  'Secret_Letter-_Daphne',
  'Secret_Letter-_Excresduo',
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
    'Secret_Letter-_Silent_Shower',
    'Secret_Letter-_Silverwhite_Edict',
    "Secret_Letter-_Siren's_Kiss",
    'Secret_Letter-_Soulrend',
    'Secret_Letter-_Tetherslash',
    'Secret_Letter-_Truffle_and_Filbert',
    'Secret_Letter-_Undying_Oneiros',
    'Secret_Letter-_Wanewraith',
    'Secret_Letter-_Withershade',
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
};

// Category icons
const categoryIcons: Record<string, string> = {
  'Quest Items': '📜',
  'Readables': '📖',
  'Secret Letters': '✉️',
  'Upgrade Materials': '⚙️',
  'Weapon Components': '⚔️',
};

export default function MaterialsPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<{ name: string; category: string } | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedWeapon, setSelectedWeapon] = useState<string | null>(null);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <div className="bg-slate-900/90 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-purple-500 rounded-sm"></div>
            <h1 className="text-2xl font-bold text-white tracking-widest uppercase">
              Materials & Forging
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-8">
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
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    viewMode === 'grid'
                      ? 'bg-purple-600 border-purple-500 text-white'
                      : 'bg-slate-900 border-slate-600 text-slate-400 hover:text-white'
                  }`}
                  title="Grid View"
                >
                  ⊞
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    viewMode === 'list'
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
                          {filteredItems.map((item) => (
                            <button
                              key={item}
                              onClick={() => setSelectedItem({ name: item, category })}
                              className="bg-slate-900/50 border border-slate-600 rounded-lg p-3 hover:border-purple-500 hover:scale-105 transition-all group cursor-pointer"
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
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {filteredItems.map((item) => (
                            <button
                              key={item}
                              onClick={() => setSelectedItem({ name: item, category })}
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
                              <p className="text-sm text-slate-300 text-left group-hover:text-purple-300 transition-colors">
                                {formatItemName(item)}
                              </p>
                            </button>
                          ))}
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
      {selectedItem && !selectedWeapon && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
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
              <button
                onClick={() => setSelectedItem(null)}
                className="text-slate-400 hover:text-white transition-colors text-2xl"
              >
                ✕
              </button>
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

              {/* Weapon Component - Show Full Weapon */}
              {selectedItem.category === 'Weapon Components' && getWeaponFromComponent(selectedItem.name) && (
                <div className="w-full bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-2 border-purple-500/50 rounded-lg p-6">
                  <h4 className="text-lg font-bold text-white mb-4 text-center">Full Weapon</h4>
                  <button
                    onClick={() => {
                      const weaponName = getWeaponFromComponent(selectedItem.name);
                      if (weaponName) setSelectedWeapon(weaponName);
                    }}
                    className="w-full bg-slate-800 hover:bg-slate-700 border-2 border-slate-600 hover:border-purple-500 rounded-lg p-4 transition-all group"
                  >
                    <div className="w-full h-48 relative bg-slate-900 rounded-lg overflow-hidden mb-3">
                      <Image
                        src={`/Forging/Secret Letters/Secret_Letter-_${getWeaponFromComponent(selectedItem.name)}.png`}
                        alt={formatItemName(getWeaponFromComponent(selectedItem.name) || '')}
                        fill
                        className="object-contain p-4"
                      />
                    </div>
                    <p className="text-white font-semibold group-hover:text-purple-300 transition-colors">
                      {formatItemName(getWeaponFromComponent(selectedItem.name) || '')}
                    </p>
                    <p className="text-sm text-slate-400 mt-1">Click to view all components</p>
                  </button>
                </div>
              )}

              {/* Character Unlock Info - For Secret Letters */}
              {selectedItem.category === 'Secret Letters' && characterSecretLetters.has(selectedItem.name) && (
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
                {selectedItem.category === 'Secret Letters' && characterSecretLetters.has(selectedItem.name) && (
                  <div className="mt-4 pt-4 border-t border-slate-600">
                    <p className="text-slate-400 mb-1">Type</p>
                    <p className="text-yellow-300 font-semibold">Character Unlock Item</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <button
                onClick={() => setSelectedItem(null)}
                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-3 rounded-lg transition-colors font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
                      setSelectedItem({ name: component, category: 'Weapon Components' });
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
  );
}
