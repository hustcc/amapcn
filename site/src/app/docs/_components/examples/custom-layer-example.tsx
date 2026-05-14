"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Map, MapControls, useMap } from "amapcn";
import { Button } from "@/components/ui/button";
import { Layers, X } from "lucide-react";

// Forbidden City (故宫博物院) approximate boundary
const forbiddenCity = {
  name: "故宫博物院",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  path: [
    [116.3913, 39.9134],
    [116.4030, 39.9134],
    [116.4030, 39.9243],
    [116.3913, 39.9243],
    [116.3913, 39.9134],
  ] as [number, number][],
};

function CustomLayer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const polygonsRef = useRef<any[]>([]);
  const { map, AMap, isLoaded } = useMap();
  const [isLayerVisible, setIsLayerVisible] = useState(false);
  const [hoveredPark, setHoveredPark] = useState<string | null>(null);

  const removeLayers = useCallback(() => {
    polygonsRef.current.forEach((p) => p.setMap(null));
    polygonsRef.current = [];
  }, []);

  const addLayers = useCallback(() => {
    if (!map || !AMap) return;
    removeLayers();
    const polygon = new AMap.Polygon({
        path: forbiddenCity.path,
        fillColor: "#ef4444",
        fillOpacity: 0.25,
        strokeColor: "#dc2626",
        strokeWeight: 2,
        strokeOpacity: 1,
      });
      polygon.setMap(map);
      polygon.on("mouseover", () => setHoveredPark(forbiddenCity.name));
      polygon.on("mouseout", () => setHoveredPark(null));
      polygonsRef.current.push(polygon);
  }, [map, AMap, removeLayers]);

  useEffect(() => {
    if (!isLoaded) return;
    return () => removeLayers();
  }, [isLoaded, removeLayers]);

  const toggleLayer = () => {
    if (isLayerVisible) {
      removeLayers();
      setIsLayerVisible(false);
    } else {
      addLayers();
      setIsLayerVisible(true);
    }
  };

  return (
    <>
      <div className="absolute top-3 left-3 z-10">
        <Button
          size="sm"
          variant={isLayerVisible ? "default" : "secondary"}
          onClick={toggleLayer}
        >
          {isLayerVisible ? (
            <X className="size-4 mr-1.5" />
          ) : (
            <Layers className="size-4 mr-1.5" />
          )}
          {isLayerVisible ? "Hide Layer" : "Show Layer"}
        </Button>
      </div>

      {hoveredPark && (
        <div className="absolute bottom-3 left-3 z-10 rounded-md bg-background/90 backdrop-blur px-3 py-2 text-sm font-medium border">
          {hoveredPark}
        </div>
      )}
    </>
  );
}

export function CustomLayerExample() {
  return (
    <div className="h-[400px] w-full">
      <Map center={[116.3972, 39.9189]} zoom={14}>
        <MapControls />
        <CustomLayer />
      </Map>
    </div>
  );
}
