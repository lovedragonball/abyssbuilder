import { createBuild, updateBuild, getBuild } from '@/lib/firestore';
import { allMods, allCharacters, allWeapons } from '@/lib/data';
import type { Build } from '@/lib/types';

export async function saveBuildToFirestore(
  buildData: Omit<Build, 'id' | 'createdAt' | 'updatedAt'>,
  existingBuildId?: string
): Promise<string> {
  if (existingBuildId) {
    // Update existing build
    await updateBuild(existingBuildId, buildData);
    return existingBuildId;
  } else {
    // Create new build
    const buildId = await createBuild(buildData);
    return buildId;
  }
}

export async function loadBuildForEditing(buildId: string) {
  const build = await getBuild(buildId);
  if (!build) return null;

  // Convert mod names back to mod objects
  const loadedMods = (build.mods || [])
    .map((modName: string) => allMods.find((m) => m.name === modName))
    .filter(Boolean);

  // Convert character IDs back to character objects
  const loadedTeam = (build.team || [])
    .map((charId: string) => allCharacters.find((c) => c.id === charId))
    .filter(Boolean);

  // Convert weapon IDs back to weapon objects
  const loadedWeapons = (build.supportWeapons || [])
    .map((wpnId: string) => allWeapons.find((w) => w.id === wpnId))
    .filter(Boolean);

  // Convert support mod names back to mod objects
  const loadedSupportMods: Record<string, any[]> = {};
  if (build.supportMods) {
    Object.entries(build.supportMods).forEach(([key, modNames]) => {
      const mods = (modNames as string[])
        .map((modName) => allMods.find((m) => m.name === modName))
        .filter(Boolean);
      loadedSupportMods[key] = mods;
    });
  }

  return {
    build,
    loadedMods,
    loadedTeam,
    loadedWeapons,
    loadedSupportMods,
  };
}
