// Map location data

export interface MapLocation {
  id: string;
  position: [number, number]; // [x%, y%] - percentage from top-left of the map
  title: string;
  description?: string;
  iconUrl?: string; // Icon URL from the game
  mapName?: string; // Map name where this location is located
  type?: string; // Type: chest, boss, npc, portal, resource, etc.
}

// List of all maps in the game
export const gameMapNames = [
  'Purgatorio Island',
  'Icelake',
  'Icelake Sewer',
  'Glevum Pit',
  'Galea Theater',
  'Lonza Fortress',
] as const;

export type GameMapName = typeof gameMapNames[number];

// Import locations from each map
import { purgatorioIslandLocations } from './maps/purgatorio-island';

// Combine all locations
export const mapLocations: MapLocation[] = [
  ...purgatorioIslandLocations,
  // Add locations from other maps in the future
];

// Function to filter locations by map name
export function getLocationsByMap(mapName: GameMapName): MapLocation[] {
  return mapLocations.filter(loc => loc.mapName === mapName);
}

// Function to filter locations by type
export function getLocationsByType(type: string): MapLocation[] {
  return mapLocations.filter(loc => loc.type === type);
}

// Default map configuration
export const mapConfig = {
  center: [50, 50] as [number, number], // Map center
  zoom: 1,
  dataVersion: 'v.1.0',
};
