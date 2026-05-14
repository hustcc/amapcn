import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
} from "amapcn";

const locations = [
  {
    id: 1,
    name: "Bird's Nest",
    lng: 116.3914,
    lat: 40.0089,
  },
  {
    id: 2,
    name: "Summer Palace",
    lng: 116.2755,
    lat: 40.0003,
  },
  { id: 3, name: "Temple of Heaven", lng: 116.4118, lat: 39.8823 },
];

export function MarkersExample() {
  return (
    <div className="h-[400px] w-full">
      <Map center={[116.35, 39.95]} zoom={11}>
        {locations.map((location) => (
          <MapMarker
            key={location.id}
            longitude={location.lng}
            latitude={location.lat}
          >
            <MarkerContent>
              <div className="size-4 rounded-full bg-primary border-2 border-white shadow-lg" />
            </MarkerContent>
            <MarkerTooltip>{location.name}</MarkerTooltip>
            <MarkerPopup>
              <div className="space-y-1">
                <p className="font-medium text-foreground">{location.name}</p>
                <p className="text-xs text-muted-foreground">
                  {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                </p>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}
      </Map>
    </div>
  );
}
