import { Map, MapControls } from "amapcn";

export function MapControlsExample() {
  return (
    <div className="h-[400px] w-full">
      <Map center={[121.4737, 31.2304]} zoom={11}>
        <MapControls
          position="bottom-right"
          showZoom
          showCompass
          showLocate
          showFullscreen
        />
      </Map>
    </div>
  );
}
