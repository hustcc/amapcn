"use client";

import { useState } from "react";
import { Map, MapRoute, MapMarker, MarkerContent } from "amapcn";

const routeOptions = [
  {
    id: "highway",
    label: "高速路线",
    color: "#3b82f6",
    coordinates: [
      [116.397428, 39.90923],
      [116.41, 39.91],
      [116.45, 39.92],
      [116.48, 39.97],
      [116.5, 40.02],
    ] as [number, number][],
    duration: "32 分钟",
    distance: "18.4 公里",
  },
  {
    id: "city",
    label: "城区路线",
    color: "#10b981",
    coordinates: [
      [116.397428, 39.90923],
      [116.415, 39.915],
      [116.43, 39.93],
      [116.45, 39.96],
      [116.5, 40.02],
    ] as [number, number][],
    duration: "48 分钟",
    distance: "16.1 公里",
  },
  {
    id: "scenic",
    label: "景观路线",
    color: "#f59e0b",
    coordinates: [
      [116.397428, 39.90923],
      [116.38, 39.92],
      [116.37, 39.95],
      [116.4, 40.0],
      [116.5, 40.02],
    ] as [number, number][],
    duration: "55 分钟",
    distance: "20.7 公里",
  },
];

const origin = { lng: 116.397428, lat: 39.90923, name: "天安门" };
const destination = { lng: 116.5, lat: 40.02, name: "北京东站" };

export function OsrmRouteExample() {
  const [activeRoute, setActiveRoute] = useState(routeOptions[0].id);
  const selected = routeOptions.find((r) => r.id === activeRoute)!;

  return (
    <div className="h-full w-full relative">
      <Map center={[116.44, 39.96]} zoom={11}>
        {routeOptions.map((route) => (
          <MapRoute
            key={route.id}
            coordinates={route.coordinates}
            color={route.id === activeRoute ? route.color : "#9ca3af"}
            width={route.id === activeRoute ? 5 : 3}
            opacity={route.id === activeRoute ? 0.9 : 0.4}
          />
        ))}

        <MapMarker longitude={origin.lng} latitude={origin.lat}>
          <MarkerContent>
            <div className="size-5 rounded-full bg-green-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
          </MarkerContent>
        </MapMarker>

        <MapMarker longitude={destination.lng} latitude={destination.lat}>
          <MarkerContent>
            <div className="size-5 rounded-full bg-red-500 border-2 border-white shadow-lg flex items-center justify-center text-white text-xs font-bold">
              B
            </div>
          </MarkerContent>
        </MapMarker>
      </Map>

      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg text-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <span
            className="size-2 rounded-full shrink-0"
            style={{ backgroundColor: selected.color }}
          />
          <span className="font-medium text-gray-900 text-[13px]">
            {selected.label}
          </span>
        </div>
        <div className="text-gray-500 text-xs leading-relaxed">
          {selected.distance} · {selected.duration}
        </div>
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-white/95 backdrop-blur-sm rounded-xl p-2 shadow-lg border border-gray-100">
        {routeOptions.map((route) => (
          <button
            key={route.id}
            onClick={() => setActiveRoute(route.id)}
            className="relative flex items-center gap-2.5 px-3 py-2 rounded-lg text-left transition-colors cursor-pointer"
            style={{
              backgroundColor:
                activeRoute === route.id
                  ? `${route.color}10`
                  : "transparent",
            }}
          >
            <span
              className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full"
              style={{
                backgroundColor:
                  activeRoute === route.id ? route.color : "#d1d5db",
              }}
            />
            <div className="pl-1.5">
              <div className="text-xs text-gray-500 leading-tight">
                {route.label}
              </div>
              <div
                className="text-[15px] font-semibold leading-snug"
                style={{
                  color:
                    activeRoute === route.id ? route.color : "#374151",
                }}
              >
                {route.duration}
              </div>
              <div className="text-[11px] text-gray-400 leading-tight">
                {route.distance}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}