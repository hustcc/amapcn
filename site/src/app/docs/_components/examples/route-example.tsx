import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MapRoute,
} from "amapcn";

const route = [
  [116.3972, 39.9075], // Tiananmen
  [116.3974, 39.9163], // Forbidden City
  [116.3914, 40.0089], // Bird's Nest
  [116.2755, 40.0003], // Summer Palace
] as [number, number][];

const stops = [
  { name: "Tiananmen", lng: 116.3972, lat: 39.9075 },
  { name: "Forbidden City", lng: 116.3974, lat: 39.9163 },
  { name: "Bird's Nest", lng: 116.3914, lat: 40.0089 },
  { name: "Summer Palace", lng: 116.2755, lat: 40.0003 },
];

export function RouteExample() {
  return (
    <div className="h-[400px] w-full">
      <Map center={[116.35, 39.97]} zoom={10.5}>
        <MapRoute coordinates={route} color="#3b82f6" width={4} opacity={0.8} />

        {stops.map((stop, index) => (
          <MapMarker key={stop.name} longitude={stop.lng} latitude={stop.lat}>
            <MarkerContent>
              <div className="size-4.5 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-semibold">
                {index + 1}
              </div>
            </MarkerContent>
            <MarkerTooltip>{stop.name}</MarkerTooltip>
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}
