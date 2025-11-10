'use client';

interface InteractiveMapProps {
  dataVersion?: string;
}

const SNAPSHOT_URL = '/boarhat-map.html';

export default function InteractiveMap({ dataVersion }: InteractiveMapProps) {
  return (
    <div className="flex h-full w-full flex-col bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Interactive Map</p>
            <h1 className="text-2xl font-bold tracking-widest text-white">Duet Night Abyss</h1>
          </div>
          {dataVersion && (
            <div className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200">
              Data Version: <span className="text-amber-300">{dataVersion}</span>
            </div>
          )}
        </div>
        <p className="mt-3 text-xs text-slate-400">
          Embedded snapshot sourced from Boarhat.gg. Some external assets (ads/analytics) were
          removed automatically when the snapshot was created.
        </p>
      </header>

      <div className="flex-1 p-4">
        <div className="h-full w-full overflow-hidden rounded-xl border border-slate-800 shadow-2xl shadow-black/40">
          <iframe
            src={SNAPSHOT_URL}
            title="Boarhat Interactive Map Snapshot"
            className="h-full w-full border-0"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
}
