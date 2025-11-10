export default function MapPage() {
  return (
    <div className="flex flex-col h-screen">
      <div className="px-4 py-4">
        <h1 className="text-4xl font-bold">Interactive Map</h1>
      </div>
      <div className="flex-1 px-4 pb-4">
        <iframe
          src="https://duet-night-abyss.interactivemap.app/?map=1"
          className="w-full h-full border-0 rounded-lg"
          title="Interactive Map"
        />
      </div>
    </div>
  );
}
