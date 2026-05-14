"use client";

import {
  Map,
  MapMarker,
  MapRef,
  MarkerContent,
  MarkerTooltip,
} from "amapcn";
import { useRef } from "react";
import { ExampleCard } from "./example-card";
import { Button } from "@/components/ui/button";
import { Navigation } from "lucide-react";

const destination = {
  name: "Beijing",
  description: "China",
  center: [116.397428, 39.90923] as [number, number],
  startCenter: [116.397428, 30.0] as [number, number],
};

export function FlyToExample() {
  const mapRef = useRef<MapRef>(null);

  return (
    <ExampleCard label="Fly To" className="aspect-square" delay="delay-600">
      <Map
        center={destination.startCenter}
        zoom={5}
        ref={mapRef}
      >
        <MapMarker
          longitude={destination.center[0]}
          latitude={destination.center[1]}
        >
          <MarkerContent>
            <div className="relative flex items-center justify-center">
              <div className="absolute size-6 rounded-full bg-cyan-500/20 animate-ping" />
              <div className="size-4 rounded-full bg-cyan-500 border-2 border-white shadow-lg" />
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-center">
              <div className="font-medium">{destination.name}</div>
              <div className="text-[10px] text-muted-foreground">
                {destination.description}
              </div>
            </div>
          </MarkerTooltip>
        </MapMarker>
      </Map>
      <Button
        size="icon-sm"
        variant="secondary"
        className="absolute top-2 right-2"
        onClick={() => {
          if (mapRef.current) {
            mapRef.current.panTo(destination.center);
            mapRef.current.setZoom(14);
          }
        }}
      >
        <Navigation className="size-4" />
      </Button>
    </ExampleCard>
  );
}
