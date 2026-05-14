"use client";

import { Map, MapMarker, MarkerContent, MarkerTooltip } from "amapcn";
import { TrendingUp } from "lucide-react";
import { ExampleCard } from "./example-card";

const analyticsData = [
  { lng: 116.397428, lat: 39.90923, city: "Beijing", users: 847, size: 14 },
  { lng: 121.4737, lat: 31.2304, city: "Shanghai", users: 623, size: 12 },
  { lng: 113.2644, lat: 23.1291, city: "Guangzhou", users: 412, size: 10 },
  { lng: 114.0579, lat: 22.5431, city: "Shenzhen", users: 298, size: 9 },
  { lng: 104.0668, lat: 30.5728, city: "Chengdu", users: 187, size: 8 },
  { lng: 114.3054, lat: 30.5931, city: "Wuhan", users: 156, size: 7 },
  { lng: 120.1536, lat: 30.2741, city: "Hangzhou", users: 134, size: 7 },
  { lng: 118.7969, lat: 32.0603, city: "Nanjing", users: 89, size: 6 },
  { lng: 108.9402, lat: 34.3416, city: "Xi'an", users: 76, size: 5 },
  { lng: 117.1901, lat: 39.1256, city: "Tianjin", users: 45, size: 5 },
];

export function AnalyticsExample() {
  return (
    <ExampleCard
      label=""
      className="aspect-square sm:col-span-2 sm:aspect-video lg:aspect-auto"
      delay="delay-400"
    >
      <div className="absolute top-3 left-3 z-10 bg-background/95 backdrop-blur-md rounded-lg p-3 border border-border/50 shadow-lg">
        <div className="tracking-wider text-[10px] text-muted-foreground uppercase mb-1">
          Active Users
        </div>
        <div className="text-2xl font-semibold leading-tight">2,847</div>
        <div className="flex items-center gap-1 mt-1">
          <TrendingUp className="size-3 text-emerald-500" />
          <span className="text-xs text-emerald-500">+12.5%</span>
          <span className="text-xs text-muted-foreground">vs last hour</span>
        </div>
      </div>

      <div className="absolute bottom-3 left-3 z-10 bg-background/95 backdrop-blur-md rounded-lg px-3 py-2 border border-border/50 shadow-lg">
        <div className="flex items-center gap-4 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="size-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="size-1.5 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground">Low</span>
          </div>
        </div>
      </div>

      <Map center={[116.397428, 35.0]}>
        {analyticsData.map((loc) => (
          <MapMarker key={loc.city} longitude={loc.lng} latitude={loc.lat}>
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                <div
                  className="absolute rounded-full bg-emerald-500/20"
                  style={{
                    width: loc.size * 2.5,
                    height: loc.size * 2.5,
                  }}
                />
                <div
                  className="absolute rounded-full bg-emerald-500/40 animate-ping"
                  style={{
                    width: loc.size * 1.5,
                    height: loc.size * 1.5,
                    animationDuration: "2s",
                  }}
                />
                <div
                  className="relative rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50"
                  style={{ width: loc.size, height: loc.size }}
                />
              </div>
            </MarkerContent>
            <MarkerTooltip>
              <div className="text-center">
                <div className="font-medium">{loc.city}</div>
                <div className="text-emerald-500 font-semibold">
                  {loc.users}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  active users
                </div>
              </div>
            </MarkerTooltip>
          </MapMarker>
        ))}
      </Map>
    </ExampleCard>
  );
}
