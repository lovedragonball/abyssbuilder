'use client';

import GameMap from '@/components/GameMap';
import { mapConfig } from '@/lib/map-data';

export default function MapPage() {
  return (
    <div className="w-full h-screen bg-slate-950">
      <GameMap dataVersion={mapConfig.dataVersion} />
    </div>
  );
}
