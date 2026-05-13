"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerTooltip,
  MarkerLabel,
  MapRoute,
} from "@/registry/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, Truck, Plane } from "lucide-react";

interface Hub {
  id: string;
  city: string;
  lng: number;
  lat: number;
  type: "primary" | "secondary";
  dailyVolume: number;
  status: "online" | "busy";
}

interface Route {
  from: string;
  to: string;
  mode: "air" | "ground";
  color: string;
  width: number;
}

const hubs: Hub[] = [
  { id: "bj", city: "北京", lng: 116.397428, lat: 39.90923, type: "primary", dailyVolume: 2450, status: "online" },
  { id: "sh", city: "上海", lng: 121.4737, lat: 31.2304, type: "primary", dailyVolume: 3180, status: "online" },
  { id: "gz", city: "广州", lng: 113.2644, lat: 23.1291, type: "primary", dailyVolume: 1890, status: "busy" },
  { id: "cd", city: "成都", lng: 104.0668, lat: 30.5728, type: "secondary", dailyVolume: 1420, status: "online" },
  { id: "wh", city: "武汉", lng: 114.3054, lat: 30.5931, type: "secondary", dailyVolume: 1650, status: "online" },
  { id: "xa", city: "西安", lng: 108.9402, lat: 34.3416, type: "secondary", dailyVolume: 980, status: "busy" },
];

const hubById = Object.fromEntries(hubs.map((h) => [h.id, h]));

const routes: Route[] = [
  { from: "bj", to: "sh", mode: "air", color: "#3b82f6", width: 3 },
  { from: "sh", to: "gz", mode: "air", color: "#3b82f6", width: 3 },
  { from: "bj", to: "xa", mode: "ground", color: "#64748b", width: 2 },
  { from: "xa", to: "cd", mode: "ground", color: "#64748b", width: 2 },
  { from: "wh", to: "gz", mode: "ground", color: "#64748b", width: 2 },
  { from: "wh", to: "sh", mode: "air", color: "#3b82f6", width: 2 },
  { from: "cd", to: "gz", mode: "ground", color: "#64748b", width: 2 },
  { from: "bj", to: "wh", mode: "ground", color: "#64748b", width: 2 },
  { from: "xa", to: "wh", mode: "ground", color: "#64748b", width: 2 },
];

const totalVolume = hubs.reduce((s, h) => s + h.dailyVolume, 0);
const airRoutes = routes.filter((r) => r.mode === "air").length;
const groundRoutes = routes.filter((r) => r.mode === "ground").length;

export function LogisticsNetwork() {
  return (
    <div className="flex h-full w-full flex-col md:flex-row">
      {/* Left Sidebar */}
      <div className="flex w-full shrink-0 flex-col border-b p-4 md:w-[260px] md:border-b-0 md:border-r md:p-4">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10">
            <Network className="size-4 text-blue-500" />
          </div>
          <div>
            <p className="text-sm font-medium">物流网络</p>
            <p className="text-muted-foreground text-[10px]">全国干线运输</p>
          </div>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2">
          <div className="rounded-md border bg-background px-2 py-1.5 text-center">
            <p className="text-sm font-bold tabular-nums">{hubs.length}</p>
            <p className="text-muted-foreground text-[9px]">枢纽</p>
          </div>
          <div className="rounded-md border bg-background px-2 py-1.5 text-center">
            <p className="text-sm font-bold tabular-nums">{airRoutes}</p>
            <p className="text-muted-foreground text-[9px]">空运</p>
          </div>
          <div className="rounded-md border bg-background px-2 py-1.5 text-center">
            <p className="text-sm font-bold tabular-nums">{groundRoutes}</p>
            <p className="text-muted-foreground text-[9px]">陆运</p>
          </div>
        </div>

        <div className="mt-4 space-y-1">
          <p className="text-muted-foreground text-[10px] font-medium tracking-wider uppercase">
            枢纽列表
          </p>
          {hubs.map((hub) => (
            <div
              key={hub.id}
              className="flex items-center justify-between rounded-md px-2 py-1.5 hover:bg-muted/50"
            >
              <div className="flex items-center gap-2">
                <span
                  className={`size-2 rounded-full ${
                    hub.status === "online" ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
                <span className="text-xs">{hub.city}</span>
                {hub.type === "primary" && (
                  <Badge
                    variant="secondary"
                    className="h-4 rounded px-1 text-[8px]"
                  >
                    主
                  </Badge>
                )}
              </div>
              <span className="text-muted-foreground text-[10px] tabular-nums">
                {hub.dailyVolume.toLocaleString()}/日
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <Card className="py-3">
            <CardContent className="p-0 px-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">日均货量</span>
                <span className="font-medium tabular-nums">
                  {totalVolume.toLocaleString()} 件
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">干线数量</span>
                <span className="font-medium tabular-nums">
                  {routes.length} 条
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Map Panel */}
      <div className="relative min-h-[280px] flex-1 md:min-h-0">
        {/* Legend */}
        <div className="absolute top-3 left-3 z-10 flex items-center gap-3 rounded-lg border border-border/50 bg-background/90 px-2.5 py-1.5 text-[10px] backdrop-blur-sm">
          <div className="flex items-center gap-1.5">
            <Plane className="size-3 text-muted-foreground" />
            <span
              className="h-0.5 w-4 rounded-full"
              style={{ backgroundColor: "#3b82f6" }}
            />
            <span>空运</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Truck className="size-3 text-muted-foreground" />
            <span
              className="h-0.5 w-4 rounded-full"
              style={{ backgroundColor: "#64748b" }}
            />
            <span>陆运</span>
          </div>
        </div>

        <Map center={[108.0, 33.0]} zoom={4}>
          <MapControls showZoom position="bottom-right" />
          {routes.map((route, i) => {
            const fromHub = hubById[route.from];
            const toHub = hubById[route.to];
            if (!fromHub || !toHub) return null;
            return (
              <MapRoute
                key={i}
                coordinates={
                  [
                    [fromHub.lng, fromHub.lat],
                    [toHub.lng, toHub.lat],
                  ] as [number, number][]
                }
                color={route.color}
                width={route.width}
                opacity={0.6}
              />
            );
          })}
          {hubs.map((hub) => (
            <MapMarker key={hub.id} longitude={hub.lng} latitude={hub.lat}>
              <MarkerContent>
                <div
                  className={`rounded-full border-2 border-white shadow-md ${
                    hub.type === "primary"
                      ? "size-4 bg-blue-500"
                      : "size-3 bg-blue-400"
                  }`}
                />
              </MarkerContent>
              <MarkerLabel>
                <span className="text-[10px] font-medium text-foreground bg-background/90 px-1 rounded">
                  {hub.city}
                </span>
              </MarkerLabel>
              <MarkerTooltip>
                <div className="text-xs space-y-1">
                  <p className="font-medium">{hub.city}枢纽</p>
                  <p className="text-muted-foreground">
                    日均 {hub.dailyVolume.toLocaleString()} 件
                  </p>
                  <div className="flex items-center gap-1">
                    <span
                      className={`size-1.5 rounded-full ${
                        hub.status === "online"
                          ? "bg-emerald-500"
                          : "bg-amber-500"
                      }`}
                    />
                    <span
                      className={`text-[10px] ${
                        hub.status === "online"
                          ? "text-emerald-500"
                          : "text-amber-500"
                      }`}
                    >
                      {hub.status === "online" ? "正常运行" : "高峰繁忙"}
                    </span>
                  </div>
                </div>
              </MarkerTooltip>
            </MapMarker>
          ))}
        </Map>
      </div>
    </div>
  );
}