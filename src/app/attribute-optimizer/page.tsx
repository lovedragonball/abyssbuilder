'use client';

import { useMemo, useState } from 'react';

type FieldConfig = {
  key: string;
  label: string;
};

type TrialBonusEntry = {
  label: string;
  value: number;
};

type TrialRankOption = {
  value: string;
  description?: string;
  bonuses?: TrialBonusEntry[];
};

const trialRankOptions: TrialRankOption[] = [
  { value: 'Lv. 0–14', description: 'No bonus' },
  {
    value: 'Lv. 15–19',
    bonuses: [{ label: 'Shield', value: 10 }],
  },
  {
    value: 'Lv. 20–24',
    bonuses: [{ label: 'Shield', value: 15 }],
  },
  {
    value: 'Lv. 25–29',
    bonuses: [
      { label: 'Shield', value: 20 },
      { label: 'DEF', value: 20 },
    ],
  },
  {
    value: 'Lv. 30–34',
    bonuses: [
      { label: 'Shield', value: 25 },
      { label: 'DEF', value: 25 },
    ],
  },
  {
    value: 'Lv. 35–39',
    bonuses: [
      { label: 'Shield', value: 30 },
      { label: 'DEF', value: 30 },
      { label: 'HP', value: 30 },
    ],
  },
  {
    value: 'Lv. 40–44',
    bonuses: [
      { label: 'Shield', value: 40 },
      { label: 'DEF', value: 40 },
      { label: 'HP', value: 40 },
    ],
  },
  {
    value: 'Lv. 45–49',
    bonuses: [
      { label: 'Shield', value: 50 },
      { label: 'DEF', value: 50 },
      { label: 'HP', value: 50 },
      { label: 'ATK', value: 50 },
    ],
  },
  {
    value: 'Lv. 50–54',
    bonuses: [
      { label: 'Shield', value: 75 },
      { label: 'DEF', value: 75 },
      { label: 'HP', value: 75 },
      { label: 'ATK', value: 75 },
    ],
  },
  {
    value: 'Lv. 55–59',
    bonuses: [
      { label: 'Shield', value: 100 },
      { label: 'DEF', value: 100 },
      { label: 'HP', value: 100 },
      { label: 'ATK', value: 100 },
    ],
  },
  {
    value: 'Lv. 60–61',
    bonuses: [
      { label: 'Shield', value: 150 },
      { label: 'DEF', value: 150 },
      { label: 'HP', value: 150 },
      { label: 'ATK', value: 150 },
    ],
  },
  {
    value: 'Lv. 62–63',
    bonuses: [
      { label: 'Shield', value: 200 },
      { label: 'DEF', value: 200 },
      { label: 'HP', value: 200 },
      { label: 'ATK', value: 200 },
    ],
  },
  {
    value: 'Lv. 64',
    bonuses: [
      { label: 'Shield', value: 250 },
      { label: 'DEF', value: 250 },
      { label: 'HP', value: 250 },
      { label: 'ATK', value: 250 },
    ],
  },
  {
    value: 'Lv. 65',
    bonuses: [
      { label: 'Shield', value: 300 },
      { label: 'DEF', value: 300 },
      { label: 'HP', value: 300 },
      { label: 'ATK', value: 300 },
    ],
  },
];

const weaponOptions = ['Weapon', 'Skill', 'Consonance Weapon'] as const;
const scalingOptions = ['ATK', 'HP', 'DEF'] as const;

type DamageType = typeof weaponOptions[number];
type ScalingType = typeof scalingOptions[number];

const weaponBuffFields: FieldConfig[] = [
  { key: 'atkPercent', label: 'ATK %' },
  { key: 'skillDmg', label: 'Skill DMG %' },
  { key: 'dmgBoost', label: 'DMG Boost %' },
  { key: 'skillDmgBoost', label: 'Skill DMG Boost %' },
  { key: 'critDmg', label: 'CRIT DMG %' },
  { key: 'critChance', label: 'CRIT Chance %' },
  { key: 'weaponDmgBoost', label: 'Weapon DMG Boost %' },
  { key: 'additionalDmgBoost', label: 'Additional DMG Boost %' },
];

const weaponFieldLayout: Record<DamageType, string[]> = {
  Weapon: [
    'atkPercent',
    'dmgBoost',
    'critDmg',
    'critChance',
    'weaponDmgBoost',
    'additionalDmgBoost',
  ],
  Skill: [
    'atkPercent',
    'skillDmg',
    'dmgBoost',
    'skillDmgBoost',
    'additionalDmgBoost',
  ],
  'Consonance Weapon': [
    'atkPercent',
    'skillDmg',
    'dmgBoost',
    'critDmg',
    'critChance',
    'weaponDmgBoost',
    'additionalDmgBoost',
  ],
};

const demonFields: FieldConfig[] = [
  { key: 'elementAtk', label: 'Element ATK %' },
  { key: 'atkPercent', label: 'ATK %' },
  { key: 'hpPercent', label: 'HP %' },
  { key: 'defPercent', label: 'DEF %' },
  { key: 'morale', label: 'Morale %' },
  { key: 'resolve', label: 'Resolve %' },
  { key: 'skillDmg', label: 'Skill DMG %' },
];

const supportFields: FieldConfig[] = [
  ...demonFields,
  { key: 'dmgBoost', label: 'DMG Boost %' },
  { key: 'skillDmgBoost', label: 'Skill DMG Boost %' },
  { key: 'weaponDmgBoost', label: 'Weapon DMG Boost %' },
  { key: 'additionalDmgBoost', label: 'Additional DMG Boost %' },
];

const usageSections = [
  {
    title: 'Purpose',
    description:
      'Compare two full build configurations (Build A & Build B) to see how different buffs, stats, and scalings change the final multiplier.',
    bullets: [
      'Shared settings (Trial Rank, Damage Type, Scaling Type) keep comparisons fair.',
      'Enter percentage-based bonuses for each category to simulate in-game buffs.',
      'Final Multiplier shows Build B’s delta over Build A.',
    ],
  },
  {
    title: 'Trial Rank Bonus',
    description:
      'Select your current Trial Rank to inject its ATK/HP/DEF/Shield boosts directly into both builds.',
    bullets: [
      'Bonuses scale sharply past Lv. 45, so double-check before comparing builds.',
      'Shield % is treated as its own multiplier bucket, mirroring in-game wording.',
    ],
  },
  {
    title: 'Damage Type & Scaling',
    description:
      'Weapon, Skill, and Consonance Weapon damage types toggle which multipliers matter.',
    bullets: [
      'Weapon/Consonance use CRIT stats + Weapon DMG Boost; Skill ignores them and instead uses Skill DMG boosts.',
      'Scaling Type determines whether ATK, HP, or DEF is treated as the base stat for calculations.',
    ],
  },
  {
    title: 'Resolve & Morale',
    description:
      'Adjust the Current HP slider/number field to simulate scenarios where HP-dependent multipliers change.',
    bullets: [
      'Resolve excels at low HP; Morale prefers high HP.',
      'HP is clamped at 25% for Resolve scaling, matching in-game behavior.',
    ],
  },
  {
    title: 'Workflow Tips',
    bullets: [
      'Populate Weapon Buffs first (many multipliers live here).',
      'Use Character Demon Wedge for personal stats, then Allies/Passive Buffs for team-wide bonuses.',
      'Use Reset All after major experiments to clear the slate and avoid stale data.',
    ],
  },
];

const formulaSections = [
  {
    title: 'Damage Formula',
    formula:
      'Damage = Base DMG × Enemy DEF Multiplier × Enemy RES Multiplier × Resolve Multiplier × Morale Multiplier × DMG Boost Multiplier × DMG Bonus Multiplier × CRIT Multiplier × Enemy Damage Taken Multiplier × Final DMG Multiplier × RNG Multiplier',
  },
  {
    title: 'Base DMG Components',
    bullets: [
      'Base DMG = MV Multiplier × Skill/Weapon Scalar',
      'MV Multiplier = Base Skill Multiplier × (1 + Skill DMG%)',
      'Weapon Scalar = Character Final ATK + Weapon Final ATK × Proficiency (1 or 1.2)',
      'Skill Scalar = Character Base ATK × (1 + ATK%) × (1 + Element ATK%)',
    ],
  },
  {
    title: 'Trial Rank Scaling',
    description:
      'Trial Rank bonuses behave like regular % modifiers (ATK%, HP%, DEF%, Shield%) added to the relevant buckets before multiplication.',
  },
  {
    title: 'CRIT Details',
    bullets: [
      'CRIT Multiplier = 1 + CRIT Level × (CRIT DMG - 1)',
      'CRIT Level rises above 1 only when CRIT Chance exceeds 100%.',
      'Skills ignore CRIT entirely—only Weapon/Consonance benefit.',
    ],
  },
  {
    title: 'Enemy & RNG Factors',
    bullets: [
      'Enemy DEF Multiplier = (300 + Level Δ) / (300 + Level Δ + DEF)',
      'Enemy RES Multiplier = 1 + Elemental Advantage (e.g., +300% or -50%).',
      'RNG Multiplier fluctuates between 95% and 105% per hit.',
    ],
  },
];

const caseStudies = [
  {
    title: 'Enemy DEF Reduction (FTC_Publik)',
    description:
      'Hellfire (TR54) attacked a Lv. 50 Guerilla Filthoid with a Greatsword first hit (40% MV). The calculated base damage was 311.31, while the observed average damage was 216.78.',
    bullets: [
      'Final Character ATK: 265.41 | Final Weapon ATK: 512.87',
      'Expected Base DMG: (265.41 + 512.87) × 0.40 = 311.31',
      'Observed DMG: 216.78 ⇒ Enemy DEF Multiplier ≈ 0.696 (≈30.4% reduction)',
      'Matches the model (level-clamped DEF bucket) used in this optimizer.',
    ],
  },
  {
    title: 'Morale vs Resolve Impact (10% values)',
    description:
      'Morale scales linearly with current HP, whereas Resolve grows sharply as HP drops (clamped at 25%).',
    tableHeader: ['Stat (10%)', 'HP%', 'Damage Bonus'],
    tableRows: [
      ['Morale', '100%', '+10.0%'],
      ['Morale', '50%', '+5.0%'],
      ['Resolve', '100%', '+0.0%'],
      ['Resolve', '50%', '+20.0%'],
      ['Resolve', '25%', '+37.5%'],
    ],
    note: 'Resolve can outperform Morale dramatically if you can safely stay near 25% HP.',
  },
];

type BuildPreset = {
  label: string;
  description?: string;
  weapon?: SectionValues;
  demon?: SectionValues;
  allies?: SectionValues;
  passive?: SectionValues;
};

const buildPresets: Record<string, BuildPreset> = {
  burst: {
    label: 'Burst DPS',
    description: 'High crit build optimized for weapon damage windows.',
    weapon: {
      atkPercent: 120,
      dmgBoost: 65,
      critChance: 70,
      critDmg: 190,
      weaponDmgBoost: 55,
      additionalDmgBoost: 25,
    },
    demon: {
      atkPercent: 60,
      elementAtk: 40,
      morale: 8,
    },
    allies: {
      atkPercent: 40,
      dmgBoost: 25,
      weaponDmgBoost: 20,
    },
    passive: {
      atkPercent: 30,
      additionalDmgBoost: 15,
    },
  },
  sustain: {
    label: 'Sustain Support',
    description: 'Balanced buffs for long fights with higher Resolve focus.',
    weapon: {
      atkPercent: 70,
      skillDmg: 30,
      skillDmgBoost: 25,
      additionalDmgBoost: 10,
    },
    demon: {
      atkPercent: 35,
      hpPercent: 45,
      resolve: 12,
    },
    allies: {
      elementAtk: 20,
      hpPercent: 30,
      resolve: 10,
      dmgBoost: 18,
      skillDmgBoost: 15,
    },
    passive: {
      atkPercent: 20,
      hpPercent: 25,
      resolve: 8,
    },
  },
  breaker: {
    label: 'Shield Breaker',
    description: 'Front-loaded skill damage for stance breaking.',
    weapon: {
      atkPercent: 50,
      skillDmg: 80,
      skillDmgBoost: 60,
      additionalDmgBoost: 30,
    },
    demon: {
      elementAtk: 25,
      atkPercent: 25,
      skillDmg: 35,
    },
    allies: {
      skillDmg: 20,
      skillDmgBoost: 15,
      additionalDmgBoost: 20,
    },
    passive: {
      atkPercent: 15,
      skillDmg: 20,
      dmgBoost: 15,
    },
  },
};

const sectionToggleDefaults = {
  weapon: true,
  demon: true,
  allies: true,
  passive: true,
} as const;

type SectionToggleKey = keyof typeof sectionToggleDefaults;

type SectionValues = Record<string, number>;
type TrialBonusMap = Record<string, number>;

const mapTrialBonuses = (bonuses?: TrialBonusEntry[]): TrialBonusMap => {
  const map: TrialBonusMap = {};
  bonuses?.forEach((bonus) => {
    map[bonus.label.toLowerCase()] = bonus.value;
  });
  return map;
};

const sumByKey = (sections: SectionValues[], key: string) =>
  sections.reduce((sum, section) => sum + (section[key] ?? 0), 0);

const calculateCritMultiplier = (critChance: number, critDmg: number) => {
  if (critChance <= 0 || critDmg <= 0) {
    return 1;
  }
  const cappedChance = Math.max(0, Math.min(critChance, 100));
  const overflowChance = Math.max(0, critChance - 100);
  const critLevel = cappedChance / 100 + overflowChance / 100;
  return 1 + critLevel * (critDmg / 100);
};

interface CalculateMultiplierOptions {
  damageType: DamageType;
  scalingType: ScalingType;
  trialBonuses: TrialBonusMap;
  currentHpPercent: number;
}

const calculateMultiplier = (
  sections: SectionValues[],
  { damageType, scalingType, trialBonuses, currentHpPercent }: CalculateMultiplierOptions
) => {
  const getTrialBonus = (label: string) => trialBonuses[label.toLowerCase()] ?? 0;

  const totalAtkPercent =
    sumByKey(sections, 'atkPercent') + sumByKey(sections, 'elementAtk') + getTrialBonus('atk');
  const totalHpPercent = sumByKey(sections, 'hpPercent') + getTrialBonus('hp');
  const totalDefPercent = sumByKey(sections, 'defPercent') + getTrialBonus('def');

  const scalingPercent =
    scalingType === 'ATK'
      ? totalAtkPercent
      : scalingType === 'HP'
        ? totalHpPercent
        : totalDefPercent;

  const scalingMultiplier = 1 + scalingPercent / 100;

  const generalDamageBoost = sumByKey(sections, 'dmgBoost');
  const additionalDamageBoost = sumByKey(sections, 'additionalDmgBoost');
  const resolvePercent = sumByKey(sections, 'resolve');
  const moralePercent = sumByKey(sections, 'morale');

  const weaponDamageBoost = damageType === 'Skill' ? 0 : sumByKey(sections, 'weaponDmgBoost');
  const skillDamage = damageType === 'Weapon' ? 0 : sumByKey(sections, 'skillDmg');
  const skillDamageBoost =
    damageType === 'Skill' ? sumByKey(sections, 'skillDmgBoost') : 0;

  const critChance = damageType === 'Skill' ? 0 : sumByKey(sections, 'critChance');
  const critDmg = damageType === 'Skill' ? 0 : sumByKey(sections, 'critDmg');

  const skillMultiplier = 1 + skillDamage / 100;
  const skillBoostMultiplier = 1 + skillDamageBoost / 100;
  const generalBoostMultiplier = 1 + generalDamageBoost / 100;
  const weaponBoostMultiplier = 1 + weaponDamageBoost / 100;
  const additionalBoostMultiplier = 1 + additionalDamageBoost / 100;
  const critMultiplier = calculateCritMultiplier(critChance, critDmg);

  const hpRatio = Math.max(0.25, Math.min(1, currentHpPercent / 100));
  const resolveMultiplier =
    1 + (resolvePercent / 100) * 2 * ((1 - hpRatio) * 2 + 1) * (1 - hpRatio);
  const moraleMultiplier = 1 + (moralePercent / 100) * hpRatio;

  const total =
    scalingMultiplier *
    skillMultiplier *
    skillBoostMultiplier *
    generalBoostMultiplier *
    weaponBoostMultiplier *
    additionalBoostMultiplier *
    resolveMultiplier *
    moraleMultiplier *
    critMultiplier;

  return Number.isFinite(total) ? total : 1;
};

const calculateEnemyDefMultiplier = (
  characterLevel: number,
  enemyLevel: number,
  enemyDef: number
) => {
  const levelDiff = Math.min(0, Math.max(-20, characterLevel - enemyLevel));
  const numerator = 300 + levelDiff;
  const denominator = numerator + Math.max(0, enemyDef);
  if (denominator <= 0) {
    return 1;
  }
  return numerator / denominator;
};

const describePenetration = (multiplier: number) => {
  if (multiplier >= 0.75) return 'Full penetration';
  if (multiplier >= 0.6) return 'Minor reduction';
  if (multiplier >= 0.4) return 'Heavily reduced';
  return 'Barely scratches';
};

const createInitialValues = (fields: FieldConfig[]) =>
  fields.reduce<Record<string, number>>((acc, field) => {
    acc[field.key] = 0;
    return acc;
  }, {});

const mergePresetValues = (
  fields: FieldConfig[],
  preset?: SectionValues
): SectionValues => {
  const base = createInitialValues(fields);
  if (preset) {
    Object.entries(preset).forEach(([key, value]) => {
      base[key] = value;
    });
  }
  return base;
};

type SectionStateSetter = React.Dispatch<
  React.SetStateAction<Record<string, number>>
>;

const SECTION_CARD_CLASS =
  'rounded-lg border border-[#1f2b4c] bg-[#121a36] p-5 shadow-[0_6px_18px_rgba(0,0,0,0.45)]';
const PANEL_CLASS =
  'space-y-4 rounded-lg border border-[#1f2b4c] bg-[#182349] p-4 shadow-inner shadow-black/60';
const LABEL_CLASS =
  'mb-1 text-xs font-semibold uppercase tracking-wide text-[#dee8ff]';
const INPUT_CLASS =
  'w-full rounded border border-[#243360] bg-[#0b1330] p-2 text-white placeholder:text-slate-400 focus:border-[#3b82f6] focus:outline-none focus:ring-0';
const SELECT_CLASS = `${INPUT_CLASS} cursor-pointer`;

const FieldGrid = ({
  values,
  onChange,
  fields,
}: {
  values: Record<string, number>;
  onChange: (key: string, value: number) => void;
  fields: FieldConfig[];
}) => (
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    {fields.map((field) => (
      <div key={field.key} className="flex flex-col">
        <label className={LABEL_CLASS}>{field.label}</label>
        <input
          type="number"
          className={INPUT_CLASS}
          placeholder="0"
          value={values[field.key] ?? 0}
          onChange={(event) =>
            onChange(field.key, Number(event.target.value) || 0)
          }
        />
      </div>
    ))}
  </div>
);

const makeOnChange =
  (setter: SectionStateSetter) => (key: string, value: number) =>
    setter((prev) => ({ ...prev, [key]: value }));

export default function AttributeOptimizerPage() {
  const [trialRank, setTrialRank] = useState(trialRankOptions[0].value);
  const [weaponType, setWeaponType] = useState<DamageType>(weaponOptions[0]);
  const [scalingType, setScalingType] = useState<ScalingType>(scalingOptions[0]);
  const [currentHpPercent, setCurrentHpPercent] = useState(100);
  const [characterLevel, setCharacterLevel] = useState(70);
  const [enemyLevel, setEnemyLevel] = useState(70);
  const [enemyDef, setEnemyDef] = useState(300);
  const [openSections, setOpenSections] = useState(
    () => ({ ...sectionToggleDefaults })
  );

  const [buildAWeapon, setBuildAWeapon] = useState(() =>
    createInitialValues(weaponBuffFields)
  );
  const [buildBWeapon, setBuildBWeapon] = useState(() =>
    createInitialValues(weaponBuffFields)
  );
  const [buildADemon, setBuildADemon] = useState(() =>
    createInitialValues(demonFields)
  );
  const [buildBDemon, setBuildBDemon] = useState(() =>
    createInitialValues(demonFields)
  );
  const [buildAAllies, setBuildAAllies] = useState(() =>
    createInitialValues(supportFields)
  );
  const [buildBAllies, setBuildBAllies] = useState(() =>
    createInitialValues(supportFields)
  );
  const [buildAPassive, setBuildAPassive] = useState(() =>
    createInitialValues(supportFields)
  );
  const [buildBPassive, setBuildBPassive] = useState(() =>
    createInitialValues(supportFields)
  );

  const buildAWeaponChange = makeOnChange(setBuildAWeapon);
  const buildBWeaponChange = makeOnChange(setBuildBWeapon);
  const buildADemonChange = makeOnChange(setBuildADemon);
  const buildBDemonChange = makeOnChange(setBuildBDemon);
  const buildAAlliesChange = makeOnChange(setBuildAAllies);
  const buildBAlliesChange = makeOnChange(setBuildBAllies);
  const buildAPassiveChange = makeOnChange(setBuildAPassive);
  const buildBPassiveChange = makeOnChange(setBuildBPassive);

  const handleHpChange = (value: number) => {
    const clamped = Math.min(100, Math.max(0, value));
    setCurrentHpPercent(clamped);
  };

  const currentTrialDetails = useMemo(
    () => trialRankOptions.find((option) => option.value === trialRank),
    [trialRank]
  );

  const trialBonusMap = useMemo(
    () => mapTrialBonuses(currentTrialDetails?.bonuses),
    [currentTrialDetails]
  );

  const presetEntries = Object.entries(buildPresets);

  const toggleSection = (key: SectionToggleKey) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  const activeWeaponFields = useMemo(
    () =>
      weaponBuffFields.filter((field) =>
        weaponFieldLayout[weaponType].includes(field.key)
      ),
    [weaponType]
  );

  const enemyDefMultiplier = useMemo(
    () =>
      calculateEnemyDefMultiplier(characterLevel, enemyLevel, Math.max(0, enemyDef)),
    [characterLevel, enemyLevel, enemyDef]
  );

  const penetrationVerdict = useMemo(
    () => describePenetration(enemyDefMultiplier),
    [enemyDefMultiplier]
  );

  const applyPreset = (presetKey: string, target: 'A' | 'B') => {
    const preset = buildPresets[presetKey];
    if (!preset) return;

    const setWeapon = target === 'A' ? setBuildAWeapon : setBuildBWeapon;
    const setDemon = target === 'A' ? setBuildADemon : setBuildBDemon;
    const setAllies = target === 'A' ? setBuildAAllies : setBuildBAllies;
    const setPassive = target === 'A' ? setBuildAPassive : setBuildBPassive;

    setWeapon(mergePresetValues(weaponBuffFields, preset.weapon));
    setDemon(mergePresetValues(demonFields, preset.demon));
    setAllies(mergePresetValues(supportFields, preset.allies));
    setPassive(mergePresetValues(supportFields, preset.passive));
  };

  const swapBuilds = () => {
    setBuildAWeapon((prev) => {
      const clone = { ...buildBWeapon };
      setBuildBWeapon({ ...prev });
      return clone;
    });
    setBuildADemon((prev) => {
      const clone = { ...buildBDemon };
      setBuildBDemon({ ...prev });
      return clone;
    });
    setBuildAAllies((prev) => {
      const clone = { ...buildBAllies };
      setBuildBAllies({ ...prev });
      return clone;
    });
    setBuildAPassive((prev) => {
      const clone = { ...buildBPassive };
      setBuildBPassive({ ...prev });
      return clone;
    });
  };

  const buildAMultiplier = useMemo(
    () =>
      calculateMultiplier(
        [buildAWeapon, buildADemon, buildAAllies, buildAPassive],
        {
          damageType: weaponType,
          scalingType,
          trialBonuses: trialBonusMap,
          currentHpPercent,
        }
      ),
    [
      buildAWeapon,
      buildADemon,
      buildAAllies,
      buildAPassive,
      weaponType,
      scalingType,
      trialBonusMap,
      currentHpPercent,
    ]
  );

  const buildBMultiplier = useMemo(
    () =>
      calculateMultiplier(
        [buildBWeapon, buildBDemon, buildBAllies, buildBPassive],
        {
          damageType: weaponType,
          scalingType,
          trialBonuses: trialBonusMap,
          currentHpPercent,
        }
      ),
    [
      buildBWeapon,
      buildBDemon,
      buildBAllies,
      buildBPassive,
      weaponType,
      scalingType,
      trialBonusMap,
      currentHpPercent,
    ]
  );

  const buildAEffectiveMultiplier = buildAMultiplier * enemyDefMultiplier;
  const buildBEffectiveMultiplier = buildBMultiplier * enemyDefMultiplier;

  const differencePercent = useMemo(() => {
    if (buildAEffectiveMultiplier === 0) return 0;
    return (
      ((buildBEffectiveMultiplier - buildAEffectiveMultiplier) /
        buildAEffectiveMultiplier) *
      100
    );
  }, [buildAEffectiveMultiplier, buildBEffectiveMultiplier]);

  const resetAll = () => {
    setTrialRank(trialRankOptions[0].value);
    setWeaponType(weaponOptions[0]);
    setScalingType(scalingOptions[0]);
    setCurrentHpPercent(100);
    setCharacterLevel(70);
    setEnemyLevel(70);
    setEnemyDef(300);
    setBuildAWeapon(createInitialValues(weaponBuffFields));
    setBuildBWeapon(createInitialValues(weaponBuffFields));
    setBuildADemon(createInitialValues(demonFields));
    setBuildBDemon(createInitialValues(demonFields));
    setBuildAAllies(createInitialValues(supportFields));
    setBuildBAllies(createInitialValues(supportFields));
    setBuildAPassive(createInitialValues(supportFields));
    setBuildBPassive(createInitialValues(supportFields));
  };

  const buildABonusPercent = (buildAMultiplier - 1) * 100;
  const buildBBonusPercent = (buildBMultiplier - 1) * 100;
  const buildAEffectiveBonusPercent = (buildAEffectiveMultiplier - 1) * 100;
  const buildBEffectiveBonusPercent = (buildBEffectiveMultiplier - 1) * 100;

  const buildSection = (
    title: string,
    accent: string,
    values: Record<string, number>,
    onChange: (key: string, value: number) => void,
    fields: FieldConfig[]
  ) => (
    <div className={PANEL_CLASS}>
      <h3 className={`text-lg font-semibold tracking-wide ${accent}`}>{title}</h3>
      <FieldGrid values={values} onChange={onChange} fields={fields} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#050b1d] px-4 py-10 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <div className="text-center text-blue-200">
          <h1 className="text-2xl font-bold tracking-wide">
            Attribute Optimizer Comparison
          </h1>
        </div>

        {/* Trial Rank */}
        <section className={SECTION_CARD_CLASS}>
          <h2 className="mb-4 text-lg font-semibold text-yellow-300">
            Trial Rank
          </h2>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="md:w-64">
              <label className={LABEL_CLASS}>Select Rank</label>
              <select
                className={SELECT_CLASS}
                value={trialRank}
                onChange={(event) => setTrialRank(event.target.value)}
              >
                  {trialRankOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.value}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 rounded border border-[#1f2b4c] bg-[#0b1330] p-4 text-sm text-slate-200">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Bonuses
                </p>
              {currentTrialDetails?.bonuses ? (
                <ul className="mt-2 grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-emerald-300">
                  {currentTrialDetails.bonuses.map((bonus) => (
                    <li
                      key={`${currentTrialDetails.value}-${bonus.label}`}
                      className="flex items-center justify-between rounded bg-[#111b3a] px-3 py-1 text-xs font-semibold text-emerald-300"
                    >
                      <span className="text-slate-200">{bonus.label}</span>
                      <span>
                        {bonus.value >= 0 ? '+' : ''}
                        {bonus.value}%
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-lg font-semibold text-slate-100">
                  {currentTrialDetails?.description ?? 'No bonus'}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Damage Type */}
        <section className={SECTION_CARD_CLASS}>
          <h2 className="mb-4 text-lg font-semibold text-yellow-300">
            Damage Type
          </h2>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <label className={LABEL_CLASS}>Weapon Type</label>
              <select
                className={SELECT_CLASS}
                value={weaponType}
                onChange={(event) => setWeaponType(event.target.value as DamageType)}
              >
                {weaponOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={LABEL_CLASS}>Scaling Type</label>
              <select
                className={SELECT_CLASS}
                value={scalingType}
                onChange={(event) => setScalingType(event.target.value as ScalingType)}
              >
                {scalingOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className={LABEL_CLASS}>Current HP: {currentHpPercent}%</label>
              <input
                type="range"
                min={0}
                max={100}
                className="h-2 w-full cursor-pointer rounded-full bg-[#1f2f55]"
                value={currentHpPercent}
                onChange={(event) => handleHpChange(Number(event.target.value))}
              />
              <input
                type="number"
                min={0}
                max={100}
                className={`${INPUT_CLASS} mt-2 text-center`}
                value={currentHpPercent}
                onChange={(event) => handleHpChange(Number(event.target.value))}
              />
            </div>
          </div>
        </section>

        {/* Enemy Encounter */}
        <section className={SECTION_CARD_CLASS}>
          <h2 className="mb-4 text-lg font-semibold text-yellow-300">
            Enemy Encounter
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div>
              <label className={LABEL_CLASS}>Character Level</label>
              <input
                type="number"
                min={1}
                max={100}
                className={INPUT_CLASS}
                value={characterLevel}
                onChange={(event) =>
                  setCharacterLevel(Number(event.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Enemy Level</label>
              <input
                type="number"
                min={1}
                max={200}
                className={INPUT_CLASS}
                value={enemyLevel}
                onChange={(event) =>
                  setEnemyLevel(Number(event.target.value) || 0)
                }
              />
            </div>
            <div>
              <label className={LABEL_CLASS}>Enemy DEF</label>
              <input
                type="number"
                min={0}
                className={INPUT_CLASS}
                value={enemyDef}
                onChange={(event) => setEnemyDef(Number(event.target.value) || 0)}
              />
            </div>
          </div>
          <div className="mt-4 rounded border border-[#1f2b4c] bg-[#0b1330] p-4 text-sm text-slate-200">
            <p className="text-base font-semibold text-emerald-300">
              Enemy DEF Multiplier:{' '}
              <span className="text-white">{enemyDefMultiplier.toFixed(3)}x</span>
            </p>
            <p className="text-xs uppercase tracking-wide text-slate-400">
              Verdict: {penetrationVerdict}
            </p>
          </div>
        </section>

        {/* Quick Presets */}
        <section className={SECTION_CARD_CLASS}>
          <h2 className="mb-4 text-lg font-semibold text-yellow-300">
            Quick Presets
          </h2>
          <div className="space-y-4">
            {presetEntries.map(([key, preset]) => (
              <div
                key={key}
                className="rounded border border-[#1f2b4c] bg-[#0b1330] p-4 shadow-inner shadow-black/30"
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-base font-semibold text-slate-100">
                      {preset.label}
                    </p>
                    {preset.description && (
                      <p className="text-xs text-slate-400">{preset.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      className="rounded bg-blue-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-500"
                      onClick={() => applyPreset(key, 'A')}
                    >
                      Apply to Build A
                    </button>
                    <button
                      className="rounded bg-purple-600 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-purple-500"
                      onClick={() => applyPreset(key, 'B')}
                    >
                      Apply to Build B
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Weapon Buffs */}
        <section className={SECTION_CARD_CLASS}>
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => toggleSection('weapon')}
          >
            <h2 className="text-lg font-semibold uppercase tracking-wide text-yellow-300">
              Weapon Buffs
            </h2>
            <span className="text-2xl text-slate-400">
              {openSections.weapon ? '−' : '+'}
            </span>
          </button>
          {openSections.weapon && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {buildSection(
                'Build A',
                'text-blue-400',
                buildAWeapon,
                buildAWeaponChange,
                activeWeaponFields
              )}
              {buildSection(
                'Build B',
                'text-purple-400',
                buildBWeapon,
                buildBWeaponChange,
                activeWeaponFields
              )}
            </div>
          )}
        </section>

        {/* Character Demon Wedge */}
        <section className={SECTION_CARD_CLASS}>
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => toggleSection('demon')}
          >
            <h2 className="text-lg font-semibold uppercase tracking-wide text-yellow-300">
              Character Demon Wedge
            </h2>
            <span className="text-2xl text-slate-400">
              {openSections.demon ? '−' : '+'}
            </span>
          </button>
          {openSections.demon && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {buildSection(
                'Build A',
                'text-blue-400',
                buildADemon,
                buildADemonChange,
                demonFields
              )}
              {buildSection(
                'Build B',
                'text-purple-400',
                buildBDemon,
                buildBDemonChange,
                demonFields
              )}
            </div>
          )}
        </section>

        {/* Allies Buffs */}
        <section className={SECTION_CARD_CLASS}>
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => toggleSection('allies')}
          >
            <h2 className="text-lg font-semibold uppercase tracking-wide text-yellow-300">
              Allies Buffs
            </h2>
            <span className="text-2xl text-slate-400">
              {openSections.allies ? '−' : '+'}
            </span>
          </button>
          {openSections.allies && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {buildSection(
                'Build A',
                'text-blue-400',
                buildAAllies,
                buildAAlliesChange,
                supportFields
              )}
              {buildSection(
                'Build B',
                'text-purple-400',
                buildBAllies,
                buildBAlliesChange,
                supportFields
              )}
            </div>
          )}
        </section>

        {/* Passive Buffs */}
        <section className={SECTION_CARD_CLASS}>
          <button
            className="flex w-full items-center justify-between text-left"
            onClick={() => toggleSection('passive')}
          >
            <h2 className="text-lg font-semibold uppercase tracking-wide text-yellow-300">
              Passive Buffs
            </h2>
            <span className="text-2xl text-slate-400">
              {openSections.passive ? '−' : '+'}
            </span>
          </button>
          {openSections.passive && (
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              {buildSection(
                'Build A',
                'text-blue-400',
                buildAPassive,
                buildAPassiveChange,
                supportFields
              )}
              {buildSection(
                'Build B',
                'text-purple-400',
                buildBPassive,
                buildBPassiveChange,
                supportFields
              )}
            </div>
          )}
        </section>

        {/* Final Multiplier */}
        <section className="space-y-4 text-center">
          <h2 className="text-lg font-semibold text-yellow-300">Final Multiplier</h2>
          <div className="rounded-lg border border-[#2b2f50] bg-[#121a36] p-6 shadow-lg shadow-black/40">
            <div className="grid grid-cols-1 gap-6 text-lg md:grid-cols-3">
              <div>
                <p className="text-sm font-semibold text-blue-300">Build A</p>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-green-400">
                    {buildAMultiplier.toFixed(3)}x
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Base +{buildABonusPercent.toFixed(2)}%
                  </p>
                  <p className="text-2xl font-bold text-emerald-300">
                    {buildAEffectiveMultiplier.toFixed(3)}x
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Vs Enemy +{buildAEffectiveBonusPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-purple-300">Build B</p>
                <div className="space-y-1">
                  <p className="text-3xl font-bold text-green-400">
                    {buildBMultiplier.toFixed(3)}x
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Base +{buildBBonusPercent.toFixed(2)}%
                  </p>
                  <p className="text-2xl font-bold text-emerald-300">
                    {buildBEffectiveMultiplier.toFixed(3)}x
                  </p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">
                    Vs Enemy +{buildBEffectiveBonusPercent.toFixed(2)}%
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-yellow-300">Δ Difference</p>
                <p className="text-3xl font-bold text-green-400">
                  {differencePercent >= 0 ? '+' : ''}
                  {differencePercent.toFixed(2)}%
                </p>
                <p className="mt-1 text-xs text-slate-400">B vs A (effective)</p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-3">
              <button
                className="rounded bg-slate-700 px-6 py-2 font-semibold text-white shadow hover:bg-slate-600"
                onClick={swapBuilds}
              >
                Swap Builds
              </button>
              <button
                className="rounded bg-red-600 px-8 py-2 font-semibold text-white shadow hover:bg-red-500"
                onClick={resetAll}
              >
                Reset All
              </button>
            </div>
          </div>
        </section>

        <section className={SECTION_CARD_CLASS}>
          <h2 className="mb-4 text-lg font-semibold text-yellow-300">How to Use</h2>
          <div className="space-y-6">
            {usageSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h3 className="text-base font-semibold text-blue-200">
                  {section.title}
                </h3>
                {section.description && (
                  <p className="text-sm text-slate-300">{section.description}</p>
                )}
                {section.bullets && (
                  <ul className="list-disc space-y-1 pl-5 text-sm text-slate-300">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={SECTION_CARD_CLASS}>
          <h2 className="mb-4 text-lg font-semibold text-yellow-300">
            Damage Formula Reference
          </h2>
          <div className="space-y-6 text-sm text-slate-300">
            {formulaSections.map((section) => (
              <div key={section.title} className="space-y-2">
                <h3 className="text-base font-semibold text-blue-200">
                  {section.title}
                </h3>
                {section.description && <p>{section.description}</p>}
                {section.formula && (
                  <div className="rounded bg-[#0b1330] p-3 font-mono text-xs text-emerald-300">
                    {section.formula}
                  </div>
                )}
                {section.bullets && (
                  <ul className="list-disc space-y-1 pl-5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className={SECTION_CARD_CLASS}>
          <h2 className="mb-4 text-lg font-semibold text-yellow-300">Case Studies</h2>
          <div className="space-y-6 text-sm text-slate-300">
            {caseStudies.map((study) => (
              <div key={study.title} className="space-y-2">
                <h3 className="text-base font-semibold text-blue-200">
                  {study.title}
                </h3>
                {study.description && <p>{study.description}</p>}
                {study.bullets && (
                  <ul className="list-disc space-y-1 pl-5">
                    {study.bullets.map((bullet) => (
                      <li key={bullet}>{bullet}</li>
                    ))}
                  </ul>
                )}
                {study.tableHeader && study.tableRows && (
                  <div className="overflow-x-auto rounded border border-[#1f2b4c] bg-[#0b1330]">
                    <table className="min-w-full text-left text-xs text-slate-200">
                      <thead className="bg-[#111c3a] text-[10px] uppercase tracking-wide text-slate-400">
                        <tr>
                          {study.tableHeader.map((header) => (
                            <th key={header} className="px-3 py-2">
                              {header}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {study.tableRows.map((row, index) => (
                          <tr
                            key={`${study.title}-row-${index}`}
                            className={index % 2 === 0 ? 'bg-[#131d3f]' : ''}
                          >
                            {row.map((cell, cellIndex) => (
                              <td key={`${cell}-${cellIndex}`} className="px-3 py-2">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {study.note && (
                  <p className="text-xs italic text-slate-400">{study.note}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
