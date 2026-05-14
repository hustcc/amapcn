"use client";

import { Map, MapMarker, MarkerContent, MarkerTooltip } from "amapcn";
import { Flame, TrendingUp } from "lucide-react";
import { ExampleCard } from "./example-card";

export function TrendingExample() {
  return (
    <ExampleCard label="Trending" className="aspect-square" delay="delay-800">
      <Map center={[116.4200, 39.9200]} zoom={11}>
        <MapMarker longitude={116.4079} latitude={39.9149}>
          <MarkerContent>
            <div className="relative flex items-center justify-center">
              <div className="absolute size-18 rounded-full bg-orange-500/30 pointer-events-none" />
              <div className="absolute size-7 rounded-full bg-orange-500/40" />
              <div className="bg-linear-to-br from-orange-500 to-red-500 rounded-full p-1.5 shadow-lg shadow-orange-500/50">
                <Flame className="size-3.5 text-white" />
              </div>
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-center">
              <div className="font-medium">Wangfujing</div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <TrendingUp className="size-3 text-green-500" />
                <span className="text-xs text-green-500">2.4k visitors</span>
              </div>
            </div>
          </MarkerTooltip>
        </MapMarker>
        <MapMarker longitude={116.4510} latitude={39.9369}>
          <MarkerContent>
            <div className="relative flex items-center justify-center">
              <div className="absolute size-14 rounded-full bg-rose-500/30 pointer-events-none" />
              <div className="bg-linear-to-br from-rose-500 to-pink-500 rounded-full p-1.5 shadow-lg shadow-rose-500/50">
                <Flame className="size-3 text-white" />
              </div>
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-center">
              <div className="font-medium">Sanlitun</div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <TrendingUp className="size-3 text-green-500" />
                <span className="text-xs text-green-500">1.8k visitors</span>
              </div>
            </div>
          </MarkerTooltip>
        </MapMarker>
        <MapMarker longitude={116.3972} latitude={39.9075}>
          <MarkerContent>
            <div className="relative flex items-center justify-center">
              <div className="absolute size-12 rounded-full bg-amber-500/30 pointer-events-none" />
              <div className="bg-linear-to-br from-amber-500 to-yellow-500 rounded-full p-1 shadow-lg shadow-amber-500/50">
                <Flame className="size-2.5 text-white" />
              </div>
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-center">
              <div className="font-medium">Tiananmen</div>
              <div className="flex items-center justify-center gap-1 text-muted-foreground">
                <TrendingUp className="size-3 text-green-500" />
                <span className="text-xs text-green-500">890 visitors</span>
              </div>
            </div>
          </MarkerTooltip>
        </MapMarker>
      </Map>
    </ExampleCard>
  );
}
