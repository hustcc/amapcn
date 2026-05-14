"use client";

import { Map, MapMarker, MarkerContent, MarkerTooltip } from "amapcn";
import { Zap } from "lucide-react";
import { ExampleCard } from "./example-card";

export function EVChargingExample() {
  return (
    <ExampleCard
      label="EV Charging"
      className="aspect-square"
      delay="delay-700"
    >
      <Map center={[121.4737, 31.2304]} zoom={11.5}>
        <MapMarker longitude={121.4737} latitude={31.2304}>
          <MarkerContent>
            <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-500/30">
              <Zap className="size-3 text-white fill-white" />
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-xs space-y-0.5">
              <div className="font-medium">People&apos;s Square</div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-500">Available</span>
              </div>
              <div className="text-muted-foreground">150 kW • ¥1.2/kWh</div>
            </div>
          </MarkerTooltip>
        </MapMarker>

        <MapMarker longitude={121.4900} latitude={31.2400}>
          <MarkerContent>
            <div className="bg-emerald-500 rounded-full p-1.5 shadow-lg shadow-emerald-500/30">
              <Zap className="size-3 text-white fill-white" />
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-xs space-y-0.5">
              <div className="font-medium">Jing&apos;an Temple</div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500" />
                <span className="text-emerald-500">2 Available</span>
              </div>
              <div className="text-muted-foreground">50 kW • ¥0.9/kWh</div>
            </div>
          </MarkerTooltip>
        </MapMarker>

        <MapMarker longitude={121.4550} latitude={31.2200}>
          <MarkerContent>
            <div className="bg-amber-500 rounded-full p-1.5 shadow-lg shadow-amber-500/30">
              <Zap className="size-3 text-white fill-white" />
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-xs space-y-0.5">
              <div className="font-medium">Xujiahui</div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-amber-500" />
                <span className="text-amber-500">In Use</span>
              </div>
              <div className="text-muted-foreground">~15 min remaining</div>
            </div>
          </MarkerTooltip>
        </MapMarker>

        <MapMarker longitude={121.5050} latitude={31.2150}>
          <MarkerContent>
            <div className="bg-zinc-400 rounded-full p-1.5 shadow-lg">
              <Zap className="size-3 text-white fill-white" />
            </div>
          </MarkerContent>
          <MarkerTooltip>
            <div className="text-xs space-y-0.5">
              <div className="font-medium">Lujiazui</div>
              <div className="flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-zinc-400" />
                <span className="text-muted-foreground">Offline</span>
              </div>
            </div>
          </MarkerTooltip>
        </MapMarker>
      </Map>
    </ExampleCard>
  );
}
