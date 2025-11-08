export type Element = 'Lumino' | 'Anemo' | 'Hydro' | 'Pyro' | 'Electro' | 'Umbro';
export type MeleeWeaponType = 'Sword' | 'Greatsword' | 'Dual Blades' | 'Katana' | 'Polearm' | 'Whipsword';
export type RangedWeaponType = 'Assault Rifle' | 'Bow' | 'Dual Pistols' | 'Grenade Launcher' | 'Pistol' | 'Shotgun';
export type WeaponType = MeleeWeaponType; // For compatibility with old structure, can be refactored
export type Role = 'Support' | 'DPS (Skill Damage)' | 'DPS (Weapon DMG)' | 'DPS (Weapon/Skill DMG)' | 'Support (Healing)' | 'DPS (Skill DMG, Summon)' | 'Support (Summon, CC)' | 'DPS (Skill DMG, CC)' | 'Support (CC, Healing)' | 'Support (Shielding)';
export type AttackType = 'Slash' | 'Smash' | 'Spike';

export type Character = {
  id: string;
  name: string;
  image: string;
  element: Element;
  role: Role;
  melee: MeleeWeaponType;
  ranged: RangedWeaponType;
  rarity?: 4 | 5;
  lore?: string;
  hasConsonanceWeapon?: boolean;
};

export type Weapon = {
  id: string;
  name: string;
  image: string;
  type: WeaponType | RangedWeaponType;
  attackType: AttackType;
  maxAttack: number;
  rarity?: 3 | 4 | 5;
  description?: string;
};

export type ModRarity = 2 | 3 | 4 | 5;
export type ModType = 'Characters' | 'Melee Weapon' | 'Ranged Weapon' | 'Melee Consonance Weapon' | 'Ranged Consonance Weapon';
export type ModElement = 'Lumino' | 'Anemo' | 'Hydro' | 'Pyro' | 'Electro' | 'Umbro';

export type Mod = {
  name: string;
  rarity: ModRarity;
  modType: ModType;
  element?: ModElement;
  symbol?: string;
  mainAttribute: string;
  effect?: string;
  tolerance: number;
  track: number;
  source: string;
  image: string;
};

export type Build = {
    id: string;
    userId: string;
    buildName: string;
    description: string;
    guide?: string;
    visibility: 'public' | 'private';
    itemType: 'character' | 'weapon';
    itemId: string;
    itemName: string;
    itemImage: string;
    creator: string | null;
    mods: string[]; // names of mods
    team: string[]; // character ids
    supportWeapons: string[]; // weapon ids
    supportMods: Record<string, string[]>;
    voteCount: number;
    votedBy?: string[]; // user IDs who voted
    views?: number;
    createdAt: any; // serverTimestamp
    updatedAt: any; // serverTimestamp
    // Legacy fields for compatibility with existing mock data
    character?: Character;
    weapon?: Weapon;
    upvotes?: number;
    contentFocus?: Role[];
  };

export type UserProfile = {
    uid: string;
    username: string;
    displayName: string;
    photoURL: string;
    bio?: string;
    favoriteBuilds?: string[]; // build IDs
    following?: string[]; // user IDs
    followers?: string[]; // user IDs
    achievements?: string[];
    createdAt: string;
};
