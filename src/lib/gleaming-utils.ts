import type { Mod } from './types';

/**
 * Check if a mod is a Gleaming mod (Jormugand's Gleaming family)
 */
export function isGleamingMod(mod: Mod | null | undefined): boolean {
  if (!mod || !mod.name) return false;
  return mod.name.startsWith("Jormugand's Gleaming");
}

/**
 * Check if there's any Gleaming mod in the build
 * @param allSlots - Array of all mod slots in the build
 * @param ignoreSlotIndex - Optional slot index to ignore (useful when checking before placing a mod)
 * @returns true if any Gleaming mod is found
 */
export function hasAnyGleamingInBuild(
  allSlots: (Mod | null | undefined)[],
  ignoreSlotIndex?: number
): boolean {
  for (let i = 0; i < allSlots.length; i++) {
    // Skip the slot we're trying to place into
    if (ignoreSlotIndex !== undefined && i === ignoreSlotIndex) {
      continue;
    }
    
    const mod = allSlots[i];
    if (mod && isGleamingMod(mod)) {
      return true;
    }
  }
  return false;
}

/**
 * Sanitize a build by removing duplicate Gleaming mods
 * Keeps only the first Gleaming mod found, removes all others
 * @param allSlots - Array of all mod slots in the build
 * @returns Sanitized array with at most one Gleaming mod
 */
export function sanitizeGleamingModsOnLoad<T extends Mod | null | undefined>(
  allSlots: T[]
): T[] {
  const sanitized = [...allSlots];
  let foundFirstGleaming = false;
  
  for (let i = 0; i < sanitized.length; i++) {
    const mod = sanitized[i];
    if (mod && isGleamingMod(mod)) {
      if (foundFirstGleaming) {
        // Remove this Gleaming mod (keep only the first one)
        sanitized[i] = (mod === null ? null : undefined) as T;
      } else {
        // This is the first Gleaming mod, keep it
        foundFirstGleaming = true;
      }
    }
  }
  
  return sanitized;
}
