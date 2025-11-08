'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Next.js
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

// Custom golden marker icon
const customIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzYiIGhlaWdodD0iNTQiIHZpZXdCb3g9IjAgMCAzNiA1NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZyBmaWx0ZXI9InVybCgjZmlsdGVyMF9kKSI+CiAgICA8cGF0aCBkPSJNMTggNEMxMS45MjUgNCA3IDguOTI1IDcgMTVDNyAyNC41IDE4IDM4IDE4IDM4QzE4IDM4IDI5IDI0LjUgMjkgMTVDMjkgOC45MjUgMjQuMDc1IDQgMTggNFoiIGZpbGw9InVybCgjZ3JhZGllbnQwKSIgc3Ryb2tlPSIjRkZBNTAwIiBzdHJva2Utd2lkdGg9IjIiLz4KICAgIDxjaXJjbGUgY3g9IjE4IiBjeT0iMTUiIHI9IjUiIGZpbGw9IiNGRkZGRkYiIHN0cm9rZT0iI0ZGQTUwMCIgc3Ryb2tlLXdpZHRoPSIxLjUiLz4KICA8L2c+CiAgPGRlZnM+CiAgICA8ZmlsdGVyIGlkPSJmaWx0ZXIwX2QiIHg9IjAiIHk9IjAiIHdpZHRoPSIzNiIgaGVpZ2h0PSI1NCIgZmlsdGVyVW5pdHM9InVzZXJTcGFjZU9uVXNlIiBjb2xvci1pbnRlcnBvbGF0aW9uLWZpbHRlcnM9InNSR0IiPgogICAgICA8ZmVGbG9vZCBmbG9vZC1vcGFjaXR5PSIwIiByZXN1bHQ9IkJhY2tncm91bmRJbWFnZUZpeCIvPgogICAgICA8ZmVDb2xvck1hdHJpeCBpbj0iU291cmNlQWxwaGEiIHR5cGU9Im1hdHJpeCIgdmFsdWVzPSIwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAxMjcgMCIvPgogICAgICA8ZmVPZmZzZXQgZHk9IjQiLz4KICAgICAgPGZlR2F1c3NpYW5CbHVyIHN0ZERldmlhdGlvbj0iMyIvPgogICAgICA8ZmVDb2xvck1hdHJpeCB0eXBlPSJtYXRyaXgiIHZhbHVlcz0iMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMCAwIDAgMC4zIDAiLz4KICAgICAgPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbjI9IkJhY2tncm91bmRJbWFnZUZpeCIgcmVzdWx0PSJlZmZlY3QxX2Ryb3BTaGFkb3ciLz4KICAgICAgPGZlQmxlbmQgbW9kZT0ibm9ybWFsIiBpbj0iU291cmNlR3JhcGhpYyIgaW4yPSJlZmZlY3QxX2Ryb3BTaGFkb3ciIHJlc3VsdD0ic2hhcGUiLz4KICAgIDwvZmlsdGVyPgogICAgPGxpbmVhckdyYWRpZW50IGlkPSJncmFkaWVudDAiIHgxPSIxOCIgeTE9IjQiIHgyPSIxOCIgeTI9IjM4IiBncmFkaWVudFVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxzdG9wIHN0b3AtY29sb3I9IiNGRkQ3MDAiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjRkZBNTAwIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KPC9zdmc+',
  iconSize: [36, 54],
  iconAnchor: [18, 54],
  popupAnchor: [0, -54],
});

interface MapLocation {
  id: string;
  position: [number, number];
  title: string;
  description?: string;
  icon?: string;
}

interface InteractiveMapProps {
  locations: MapLocation[];
  center?: [number, number];
  zoom?: number;
  dataVersion?: string;
}

export default function InteractiveMap({ 
  locations, 
  center = [0, 0], 
  zoom = 3,
  dataVersion = 'v.1.0'
}: InteractiveMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

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
    <div className="w-full h-full flex flex-col bg-slate-950">
      {/* Header */}
      <div className="bg-slate-900/90 text-white px-6 py-3 flex items-center gap-3 border-b border-slate-700">
        <div className="w-2 h-6 bg-blue-500 rounded-sm"></div>
        <h1 className="text-xl font-bold tracking-widest uppercase">Interactive Map</h1>
      </div>

      {/* Notice Banner */}
      <div className="mx-8 mt-6 mb-4">
        <div className="bg-gradient-to-r from-red-950/60 to-red-900/40 border-2 border-red-800/60 rounded-lg px-6 py-4 backdrop-blur-sm">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-yellow-400 text-2xl font-bold">⚠</span>
              <span className="text-white font-bold text-lg tracking-wide">NOTICE</span>
            </div>
            <div className="text-white/90 font-semibold tracking-wider">
              DATA VERSION : <span className="text-yellow-300">{dataVersion}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 mx-8 mb-8 relative rounded-lg overflow-hidden border-2 border-slate-700/50 shadow-2xl">
        <MapContainer
          center={center}
          zoom={zoom}
          className="w-full h-full"
          zoomControl={false}
          style={{ background: '#1a1a1a' }}
          scrollWheelZoom={true}
          doubleClickZoom={true}
          dragging={true}
          whenReady={() => {
            console.log('Map is ready');
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />
          
          {locations.map((location) => (
            <Marker 
              key={location.id} 
              position={location.position}
              icon={customIcon}
            >
              <Popup className="custom-popup">
                <div className="p-3 min-w-[200px]">
                  <h3 className="font-bold text-base mb-2 text-slate-900">{location.title}</h3>
                  {location.description && (
                    <p className="text-sm text-slate-600">{location.description}</p>
                  )}
                  {location.icon && (
                    <div className="mt-2 text-2xl">{location.icon}</div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Custom Controls */}
          <MapControls center={center} zoom={zoom} />
        </MapContainer>

        {/* Leaflet Attribution */}
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-xs font-medium z-[1000] shadow-lg flex items-center gap-1">
          <span className="text-green-600">🍃</span>
          <span className="text-slate-700">Leaflet</span>
        </div>
      </div>
    </div>
  );
}

// Custom map controls component
function MapControls({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();

  return (
    <div className="leaflet-top leaflet-left" style={{ marginTop: '12px', marginLeft: '12px' }}>
      <div className="flex flex-col gap-0 rounded-lg overflow-hidden shadow-lg border border-slate-600">
        <button
          className="bg-slate-800/90 backdrop-blur-sm w-10 h-10 flex items-center justify-center text-2xl font-bold text-white hover:bg-slate-700 transition-colors border-b border-slate-600"
          onClick={() => map.zoomIn()}
          title="Zoom in"
        >
          +
        </button>
        <button
          className="bg-slate-800/90 backdrop-blur-sm w-10 h-10 flex items-center justify-center text-2xl font-bold text-white hover:bg-slate-700 transition-colors border-b border-slate-600"
          onClick={() => map.zoomOut()}
          title="Zoom out"
        >
          −
        </button>
        <button
          className="bg-slate-800/90 backdrop-blur-sm w-10 h-10 flex items-center justify-center text-lg text-white hover:bg-slate-700 transition-colors"
          onClick={() => map.setView(center, zoom)}
          title="Reset view"
        >
          ⌂
        </button>
      </div>
    </div>
  );
}
