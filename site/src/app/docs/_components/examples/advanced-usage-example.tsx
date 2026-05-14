"use client";

import { useEffect, useState } from "react";
import { Map, useMap } from "amapcn";
import { Button } from "@/components/ui/button";
import { RotateCcw, Mountain } from "lucide-react";

function MapController() {
  const { map, isLoaded } = useMap();
  const [pitch, setPitch] = useState(0);
  const [bearing, setBearing] = useState(0);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const handleMove = () => {
      setPitch(Math.round(map.getPitch?.() ?? 0));
      setBearing(Math.round(map.getRotation?.() ?? 0));
    };

    map.on("moveend", handleMove);
    map.on("pitchchange", handleMove);
    map.on("rotatechange", handleMove);
    return () => {
      map.off("moveend", handleMove);
      map.off("pitchchange", handleMove);
      map.off("rotatechange", handleMove);
    };
  }, [map, isLoaded]);

  const handle3DView = () => {
    map?.setPitch(60);
    map?.setRotation(-20);
  };

  const handleReset = () => {
    map?.setPitch(0);
    map?.setRotation(0);
  };

  if (!isLoaded) return null;

  return (
    <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" onClick={handle3DView}>
          <Mountain className="size-4 mr-1.5" />
          3D View
        </Button>
        <Button size="sm" variant="secondary" onClick={handleReset}>
          <RotateCcw className="size-4 mr-1.5" />
          Reset
        </Button>
      </div>
      <div className="rounded-md bg-background/90 backdrop-blur px-3 py-2 text-xs font-mono border">
        <div>Pitch: {pitch}°</div>
        <div>Bearing: {bearing}°</div>
      </div>
    </div>
  );
}

export function AdvancedUsageExample() {
  return (
    <div className="h-[400px] w-full">
      <Map center={[116.397428, 39.90923]} zoom={14}>
        <MapController />
      </Map>
    </div>
  );
}
