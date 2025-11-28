# Damage Calculator Buckets & Conditional Effects

This document summarizes the calculator logic wired into `src/lib/damage-calculator.ts`.

## Damage Buckets

The calculator splits all Demon Wedge stats into additive buckets that multiply together at the end of the formula. Bucket definitions live in `src/lib/damage-buckets.ts` and are based on the mapping from `demon_wedge_builder_data.txt`.

| Bucket ID | Description | Example Sources |
| --- | --- | --- |
| `SCALAR_ATK` | ATK%, Smash/Slash/Spike ATK, Elemental ATK. | `ATK +30%`, `Pyro ATK +18%`. |
| `MV_DMG` | Skill DMG / motion value buffs. | `Skill DMG +24%`. |
| `DMG_BOOST` | Generic Damage Dealt / Weapon DMG bonuses. | `Damage Dealt +15%`. |
| `CRIT_RATE` | Crit chance bonuses. | `Crit Chance +20%`. |
| `CRIT_DMG` | Crit damage bonuses. | `Crit DMG +40%`. |
| `FINAL_DMG` | Damage modifiers that apply after every other bucket (rare). | Feathered Serpent’s Steadfast. |
| `UTILITY` | Non-damage stats. Ignored by the calculator. | Max Sanity, Trigger Probability, Reload Speed, etc. |

Each bucket exposes a running breakdown so the UI can surface per-wedge contribution summaries.

## Conditional Effects

Many Demon Wedges include “secondary” effects in their descriptions (e.g., “When dealing CRIT Damage…”). We derive toggleable conditional stats at runtime via `src/lib/demon-wedge-conditions.ts`:

1. Gather every description/level description for a wedge.
2. Run heuristics to detect percentage-based effects tied to known buckets (Damage Dealt, Crit Chance, ATK, etc.).
3. Ignore flavour-only descriptions (tolerance increases, new damage instances, etc.).
4. Expose a `ConditionalEffectDefinition` object `{ id, label, bucketId, value }`.

When a wedge is equipped the calculator stores a `conditions` map keyed by effect id. Toggling a condition from the UI simply adds/removes that bucket value before the final damage computation.

## UI Surface

- Slots that contain conditional effects display a **Condition** pill. Active conditions highlight the button.
- The Condition modal lists every detected effect, including the targeted bucket and its percentage gain/loss.
- The comparison column renders a **Damage Buckets** section that shows the resulting multipliers and top contributors for each preset.

## Testing Notes

- Bucket math is covered indirectly by the linter-friendly `calculateDamage` unit flow. When adding new stat keywords adjust `mapStatToBucket` in `damage-buckets.ts`.
- Conditional effect parsing is heuristic-based. Always double-check the modal output for new wedges and extend `IGNORED_KEYWORDS` / parsing rules as needed.

