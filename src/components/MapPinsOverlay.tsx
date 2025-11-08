import Image from 'next/image';
import type { MapLocation } from '@/lib/map-data';

interface MapPinsOverlayProps {
  locations: MapLocation[];
  onSelect?: (location: MapLocation) => void;
}

/**
 * Renders clickable map pins positioned via percentage coordinates.
 * The parent container should be `relative` so the overlay can stretch across the map image.
 */
export function MapPinsOverlay({ locations, onSelect }: MapPinsOverlayProps) {
  if (!locations.length) {
    return null;
  }

  return (
    <div className="pointer-events-none absolute inset-0">
      {locations.map((location) => (
        <div
          key={location.id}
          className="absolute"
          style={{
            left: `${location.position[0]}%`,
            top: `${location.position[1]}%`,
          }}
        >
          <div className="group -translate-x-1/2 -translate-y-full flex flex-col items-center">
            <button
              type="button"
              className="pointer-events-auto rounded-full border-2 border-yellow-500/60 bg-white p-1 shadow-lg shadow-black/40 transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              onClick={() => onSelect?.(location)}
            >
              {location.iconUrl ? (
                <Image
                  src={location.iconUrl}
                  alt={location.title}
                  width={40}
                  height={40}
                  className="h-10 w-10 drop-shadow-md"
                  draggable={false}
                />
              ) : (
                <span className="block h-10 w-10 rounded-full bg-yellow-500 text-base font-bold text-white">
                  ⚑
                </span>
              )}
            </button>

            <div className="pointer-events-none mt-1 max-w-[140px] rounded-md bg-slate-900/90 px-2 py-1 text-center text-xs font-semibold text-white opacity-0 shadow-md shadow-black/30 ring-1 ring-slate-700 transition group-hover:opacity-100">
              {location.title}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

