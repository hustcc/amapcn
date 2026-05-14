"use client";

import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerLabel,
  MapRoute,
} from "amapcn";
import { MapPin } from "lucide-react";
import { ExampleCard } from "./example-card";

// Tiananmen → Bird's Nest → Tsinghua University
const store = { lng: 116.3975, lat: 39.9087 };
const home = { lng: 116.3268, lat: 39.9993 };

const ROUTE: [number, number][] = [
  // Tiananmen (天安门)
  [116.3975, 39.9087],
  // North along the central axis
  [116.3970, 39.9160],
  [116.3965, 39.9240],
  [116.3960, 39.9320],
  // Drum Tower (鼓楼)
  [116.3958, 39.9400],
  [116.3955, 39.9480],
  [116.3955, 39.9560],
  [116.3958, 39.9640],
  [116.3960, 39.9720],
  [116.3960, 39.9800],
  // Bird's Nest (鸟巢)
  [116.3960, 39.9929],
  // Head northwest towards Tsinghua
  [116.3900, 39.9935],
  [116.3820, 39.9940],
  [116.3740, 39.9950],
  [116.3660, 39.9958],
  [116.3580, 39.9965],
  [116.3500, 39.9972],
  // Wudaokou (五道口)
  [116.3420, 39.9980],
  [116.3340, 39.9988],
  // Tsinghua University (清华大学)
  [116.3268, 39.9993],
];

const waypoint = { lng: 116.3960, lat: 39.9929 };

export function DeliveryExample() {
  return (
    <ExampleCard
      label="Delivery"
      className="aspect-square sm:col-span-2 sm:aspect-video lg:aspect-auto"
      delay="delay-900"
    >
      <Map center={[116.3620, 39.9540]} zoom={11.8}>
        <MapRoute coordinates={ROUTE} width={4} color="#4285F4" />
        <MapMarker longitude={waypoint.lng} latitude={waypoint.lat}>
          <MarkerContent>
            <div className="bg-orange-500 rounded-full p-1 shadow-lg">
              <MapPin className="size-3 text-white" />
            </div>
            <MarkerLabel>Waypoint</MarkerLabel>
          </MarkerContent>
        </MapMarker>
        <MapMarker longitude={store.lng} latitude={store.lat}>
          <MarkerContent>
            <div className="size-3.5 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            <MarkerLabel>Store</MarkerLabel>
          </MarkerContent>
        </MapMarker>
        <MapMarker longitude={home.lng} latitude={home.lat}>
          <MarkerContent>
            <div className="size-3.5 rounded-full bg-blue-500 border-2 border-white shadow-lg" />
            <MarkerLabel>Home</MarkerLabel>
          </MarkerContent>
        </MapMarker>
      </Map>
    </ExampleCard>
  );
}

