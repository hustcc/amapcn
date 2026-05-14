"use client";

import { Map, MapRoute, MapMarker, MarkerContent } from "amapcn";
import { Bike, Flame, Clock, Route } from "lucide-react";
import { ExampleCard } from "./example-card";

// Beijing cycling route near Olympic Forest Park
const trailCoordinates: [number, number][] = [
  [116.3906, 40.0110],
  [116.3850, 40.0080],
  [116.3800, 40.0050],
  [116.3780, 40.0010],
  [116.3810, 39.9970],
  [116.3860, 39.9950],
  [116.3920, 39.9960],
  [116.3970, 39.9990],
  [116.3990, 40.0030],
  [116.3960, 40.0070],
  [116.3915, 40.0108],
];
const start = trailCoordinates[0];
const end = trailCoordinates[trailCoordinates.length - 1];

export function TrailExample() {
  return (
    <ExampleCard label="" className="aspect-square" delay="delay-500">
      <div className="absolute top-3 left-3 z-10 bg-background/95 backdrop-blur-md rounded-lg p-3 border border-border/50 shadow-lg">
        <div className="flex items-center gap-1.5 mb-2">
          <Bike className="size-3.5 text-emerald-500" />
          <span className="text-xs font-medium">Olympic Forest Loop</span>
        </div>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <Route className="size-3" />
            </div>
            <div className="text-sm font-semibold">6.2</div>
            <div className="text-[9px] text-muted-foreground uppercase">
              Miles
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <Clock className="size-3" />
            </div>
            <div className="text-sm font-semibold">32</div>
            <div className="text-[9px] text-muted-foreground uppercase">
              Mins
            </div>
          </div>
          <div>
            <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
              <Flame className="size-3" />
            </div>
            <div className="text-sm font-semibold">285</div>
            <div className="text-[9px] text-muted-foreground uppercase">
              Cal
            </div>
          </div>
        </div>
      </div>

      <Map center={[116.3906, 40.0050]} zoom={13}>
        <MapRoute
          coordinates={trailCoordinates}
          color="#10b981"
          width={3}
          opacity={0.9}
        />

        <MapMarker longitude={start[0]} latitude={start[1]}>
          <MarkerContent>
            <div className="size-3 rounded-full bg-emerald-500 border-2 border-white shadow-lg" />
          </MarkerContent>
        </MapMarker>

        <MapMarker longitude={end[0]} latitude={end[1]}>
          <MarkerContent>
            <div className="size-3 rounded-full bg-red-500 border-2 border-white shadow-lg" />
          </MarkerContent>
        </MapMarker>
      </Map>
    </ExampleCard>
  );
}
