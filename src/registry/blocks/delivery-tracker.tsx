"use client";

import {
  Map,
  MapControls,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MapRoute,
} from "@/registry/map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock3, Package, MapPin, User } from "lucide-react";

const ROUTE: [number, number][] = [
  [120.1551, 30.2741],
  [120.25, 30.40],
  [120.40, 30.60],
  [120.60, 30.80],
  [120.80, 31.00],
  [121.00, 31.12],
  [121.20, 31.18],
  [121.4737, 31.2304],
];

const warehouse = { lng: 120.1551, lat: 30.2741, name: "杭州仓" };
const destination = { lng: 121.4737, lat: 31.2304, name: "上海站" };
const currentPos = ROUTE[5];

const timeline = [
  {
    time: "14:20",
    label: "已揽收",
    detail: "杭州转运中心",
    done: true,
  },
  {
    time: "15:45",
    label: "运输中",
    detail: "杭州→上海干线",
    done: true,
  },
  {
    time: "17:30",
    label: "派送中",
    detail: "上海浦东新区",
    done: false,
    active: true,
  },
  {
    time: "预计18:00",
    label: "已签收",
    detail: "",
    done: false,
  },
];

export function DeliveryTracker() {
  return (
    <div className="flex h-full w-full flex-col md:flex-row">
      {/* Left Panel */}
      <div className="flex w-full shrink-0 flex-col overflow-y-auto border-b p-4 md:w-[320px] md:border-b-0 md:border-r md:p-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight">订单追踪</h3>
            <Badge variant="secondary" className="h-5 rounded-full px-2 text-[10px]">
              运输中
            </Badge>
          </div>
          <p className="text-muted-foreground text-xs">
            SF1234567890 • 2024年3月15日
          </p>
        </div>

        <Card className="mt-4">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Package className="size-4 text-muted-foreground" />
              包裹信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">物品</span>
              <span>电子产品 × 1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">重量</span>
              <span>2.5 kg</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">运费</span>
              <span className="font-medium">¥18.00</span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4 space-y-0">
          <p className="text-muted-foreground mb-3 text-[10px] font-medium tracking-wider uppercase">
            物流轨迹
          </p>
          {timeline.map((step, i) => (
            <div key={i} className="flex gap-3 pb-4 last:pb-0">
              <div className="flex flex-col items-center">
                <div
                  className={`size-2.5 shrink-0 rounded-full ${
                    step.active
                      ? "bg-blue-500 ring-4 ring-blue-500/20"
                      : step.done
                        ? "bg-emerald-500"
                        : "bg-muted-foreground/30"
                  }`}
                />
                {i < timeline.length - 1 && (
                  <div
                    className={`mt-1 w-px flex-1 ${
                      step.done ? "bg-emerald-500/50" : "bg-muted-foreground/20"
                    }`}
                  />
                )}
              </div>
              <div className="-mt-0.5 pb-1">
                <p
                  className={`text-xs font-medium ${
                    step.active
                      ? "text-blue-500"
                      : step.done
                        ? ""
                        : "text-muted-foreground"
                  }`}
                >
                  {step.label}
                </p>
                <p className="text-muted-foreground text-[11px]">
                  {step.time}
                  {step.detail && (
                    <span className="ml-1">• {step.detail}</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-500/10">
              <User className="size-3.5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs font-medium">快递员：王师傅</p>
              <p className="text-muted-foreground text-[10px]">沪A·12345</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Map Panel */}
      <div className="relative min-h-[280px] flex-1 md:min-h-0">
        <Map center={[120.85, 30.75]} zoom={8}>
          <MapControls showZoom position="bottom-right" />
          <MapRoute
            coordinates={ROUTE}
            color="#94a3b8"
            width={4}
            opacity={0.3}
          />
          <MapRoute
            coordinates={ROUTE.slice(0, 6)}
            color="#3b82f6"
            width={4}
            opacity={0.9}
          />
          {/* Current position */}
          <MapMarker longitude={currentPos[0]} latitude={currentPos[1]}>
            <MarkerContent>
              <div className="relative flex items-center justify-center">
                <div className="absolute size-8 rounded-full bg-blue-500/20 animate-ping" />
                <div className="relative flex size-7 items-center justify-center rounded-full bg-blue-500 shadow-lg shadow-blue-500/50">
                  <Clock3 className="size-3.5 text-white" />
                </div>
              </div>
            </MarkerContent>
            <MarkerLabel>
              <span className="text-[10px] font-medium">运输中</span>
            </MarkerLabel>
          </MapMarker>
          {/* Warehouse */}
          <MapMarker longitude={warehouse.lng} latitude={warehouse.lat}>
            <MarkerContent>
              <div className="size-3.5 rounded-full border-2 border-white bg-emerald-500 shadow-md" />
            </MarkerContent>
            <MarkerLabel>{warehouse.name}</MarkerLabel>
          </MapMarker>
          {/* Destination */}
          <MapMarker longitude={destination.lng} latitude={destination.lat}>
            <MarkerContent>
              <div className="flex size-6 items-center justify-center rounded-full bg-rose-500 shadow-md">
                <MapPin className="size-3 text-white" />
              </div>
            </MarkerContent>
            <MarkerLabel>{destination.name}</MarkerLabel>
          </MapMarker>
        </Map>
      </div>
    </div>
  );
}