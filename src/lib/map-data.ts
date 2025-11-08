// ข้อมูล locations บนแผนที่

export interface MapLocation {
  id: string;
  position: [number, number]; // [x%, y%] - เปอร์เซ็นต์จากซ้ายบนของแผนที่
  title: string;
  description?: string;
  iconUrl?: string; // URL ของ icon จากเกม
  mapName?: string; // ชื่อแผนที่ที่ location นี้อยู่
  type?: string; // ประเภท: chest, boss, npc, portal, resource, etc.
}

// รายชื่อแผนที่ทั้งหมดในเกม
export const gameMapNames = [
  'Purgatorio Island',
  'Icelake',
  'Icelake Sewer',
  'Glevum Pit',
  'Galea Theater',
  'Lonza Fortress',
] as const;

export type GameMapName = typeof gameMapNames[number];

// Import locations จากแต่ละแผนที่
import { purgatorioIslandLocations } from './maps/purgatorio-island';

// รวม locations ทั้งหมด
export const mapLocations: MapLocation[] = [
  ...purgatorioIslandLocations,
  // เพิ่ม locations จากแผนที่อื่นๆ ในอนาคต
];

// ฟังก์ชันกรอง locations ตามชื่อแผนที่
export function getLocationsByMap(mapName: GameMapName): MapLocation[] {
  return mapLocations.filter(loc => loc.mapName === mapName);
}

// ฟังก์ชันกรอง locations ตามประเภท
export function getLocationsByType(type: string): MapLocation[] {
  return mapLocations.filter(loc => loc.type === type);
}

// ตั้งค่าเริ่มต้นของแผนที่
export const mapConfig = {
  center: [50, 50] as [number, number], // กึ่งกลางแผนที่
  zoom: 1,
  dataVersion: 'v.1.0',
};
