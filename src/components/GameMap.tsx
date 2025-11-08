'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  gameMapNames,
  type GameMapName,
  getLocationsByMap,
  type MapLocation,
} from '@/lib/map-data';
import { MapPinsOverlay } from './MapPinsOverlay';

interface GameMapProps {
  dataVersion?: string;
}

// Map file names
const mapFiles: Record<GameMapName, string> = {
  'Purgatorio Island': '/maps/purgatorio_island_v1.png',
  'Icelake': '/maps/icelake_v1.png',
  'Icelake Sewer': '/maps/icelake_sewer_v1.png',
  'Glevum Pit': '/maps/glevum_pit_v1.png',
  'Galea Theater': '/maps/galea_theater_v1.png',
  'Lonza Fortress': '/maps/lonza_fortress_v1.png',
};

export default function GameMap({ dataVersion = 'v.1.0' }: GameMapProps) {
  const [selectedMap, setSelectedMap] = useState<GameMapName>('Purgatorio Island');
  const [isMapSelectorOpen, setIsMapSelectorOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isMouseOverMap, setIsMouseOverMap] = useState(false);
  const [activeLocation, setActiveLocation] = useState<MapLocation | null>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Reset zoom when map changes
  useEffect(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setActiveLocation(null);
  }, [selectedMap]);

  // Prevent page scroll when mouse is over map - VERY STRICT
  useEffect(() => {
    if (!isMouseOverMap) {
      document.body.style.overflow = 'auto';
      return;
    }

    // Block page scroll completely when mouse is over map
    document.body.style.overflow = 'hidden';

    const preventScroll = (e: WheelEvent) => {
      if (isMouseOverMap) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    const preventTouchMove = (e: TouchEvent) => {
      if (isMouseOverMap) {
        e.preventDefault();
      }
    };

    // Add event listeners
    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventTouchMove, { passive: false });

    return () => {
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventTouchMove);
      document.body.style.overflow = 'auto';
    };
  }, [isMouseOverMap]);

  const handleWheel = (e: React.WheelEvent) => {
    // Only zoom when mouse is over map
    if (!isMouseOverMap) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.5, scale + delta), 5);
    setScale(newScale);
  };

  const handleMouseEnter = () => {
    setIsMouseOverMap(true);
  };

  const handleMouseLeave = () => {
    setIsMouseOverMap(false);
    setIsDragging(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleDoubleClick = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const locations = getLocationsByMap(selectedMap);

  if (!isMounted) {
    return (
      <div className="w-full h-full flex flex-col bg-slate-950">
        <div className="bg-slate-900/90 text-white px-6 py-3 flex items-center gap-3 border-b border-slate-700">
          <div className="w-2 h-6 bg-blue-500 rounded-sm"></div>
          <h1 className="text-xl font-bold tracking-widest uppercase">Interactive Map</h1>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-white text-xl">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex bg-slate-950">
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-slate-900/90 text-white px-6 py-3 flex items-center gap-3 border-b border-slate-700">
          <div className="w-2 h-6 bg-blue-500 rounded-sm"></div>
          <h1 className="text-xl font-bold tracking-widest uppercase">Interactive Map</h1>
        </div>

        {/* Map Selector */}
        <div className="mx-8 mt-6 mb-4">
        <div className="relative">
          <button
            onClick={() => setIsMapSelectorOpen(!isMapSelectorOpen)}
            className="w-full bg-slate-800/90 hover:bg-slate-700/90 text-white px-6 py-4 rounded-lg border-2 border-slate-600 flex items-center justify-between transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-semibold">Select Map:</span>
              <span className="text-xl text-blue-400">{selectedMap}</span>
            </div>
            <span className="text-2xl">{isMapSelectorOpen ? '▲' : '▼'}</span>
          </button>

          {isMapSelectorOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border-2 border-slate-600 rounded-lg overflow-hidden z-50 shadow-2xl">
              {gameMapNames.map((mapName) => (
                <button
                  key={mapName}
                  onClick={() => {
                    setSelectedMap(mapName);
                    setIsMapSelectorOpen(false);
                  }}
                  className={`w-full px-6 py-4 text-left transition-colors ${
                    selectedMap === mapName
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="text-lg">{mapName}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

        {/* Map Container */}
        <div className="flex-1 mx-8 mb-8 relative rounded-lg overflow-hidden border-2 border-slate-700/50 shadow-2xl bg-slate-900">
        <div
          className="relative w-full h-full flex items-center justify-center overflow-hidden"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onDoubleClick={handleDoubleClick}
          style={{
            cursor: isDragging ? 'grabbing' : 'grab',
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
            }}
          >
            <div
              className="relative inline-block"
              style={{
                transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
                transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              }}
            >
              <Image
                src={mapFiles[selectedMap]}
                alt={selectedMap}
                width={2000}
                height={2000}
                className="block w-[800px] h-[800px] object-contain select-none pointer-events-none"
                draggable={false}
                priority
              />
              <MapPinsOverlay
                locations={locations}
                onSelect={(location) => setActiveLocation(location)}
              />
            </div>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2">
          <button
            onClick={() => setScale(Math.min(scale + 0.2, 5))}
            className="bg-slate-800/90 hover:bg-slate-700 text-white w-10 h-10 rounded-lg border border-slate-600 flex items-center justify-center text-xl font-bold transition-colors shadow-lg"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={() => setScale(Math.max(scale - 0.2, 0.5))}
            className="bg-slate-800/90 hover:bg-slate-700 text-white w-10 h-10 rounded-lg border border-slate-600 flex items-center justify-center text-xl font-bold transition-colors shadow-lg"
            title="Zoom Out"
          >
            −
          </button>
          <button
            onClick={() => {
              setScale(1);
              setPosition({ x: 0, y: 0 });
            }}
            className="bg-slate-800/90 hover:bg-slate-700 text-white w-10 h-10 rounded-lg border border-slate-600 flex items-center justify-center text-lg transition-colors shadow-lg"
            title="Reset Zoom"
          >
            ⌂
          </button>
        </div>

        {/* Zoom Level Indicator & Instructions */}
        <div className="absolute top-4 left-4 bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-slate-600 shadow-lg">
          <div className="text-white text-sm font-semibold mb-1">
            Zoom: {Math.round(scale * 100)}%
          </div>
          <div className="text-slate-400 text-xs">
            Scroll to zoom • Drag to pan
          </div>
        </div>

        {activeLocation && (
          <div className="absolute bottom-4 left-4 max-w-xs rounded-xl bg-slate-900/95 p-4 text-white shadow-2xl shadow-black/40 ring-1 ring-slate-700/70">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">
                  {activeLocation.type ?? 'Unknown'}
                </p>
                <h3 className="text-lg font-semibold">{activeLocation.title}</h3>
              </div>
              <button
                type="button"
                className="text-slate-400 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-full"
                onClick={() => setActiveLocation(null)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
        </div>
      </div>

    </div>
  );
}
