"use client";

import { useEffect, useRef, useState } from "react";
import { Map, MapPopup, useMap } from "amapcn";

// Generate random points around Beijing
function generateRandomPoints(count: number) {
  const center = { lng: 116.397428, lat: 39.90923 };
  const features = [];

  for (let i = 0; i < count; i++) {
    const lng = center.lng + (Math.random() - 0.5) * 0.15;
    const lat = center.lat + (Math.random() - 0.5) * 0.1;
    features.push({
      type: "Feature" as const,
      properties: {
        id: i,
        name: `Location ${i + 1}`,
        category: ["Restaurant", "Cafe", "Bar", "Shop"][
          Math.floor(Math.random() * 4)
        ],
      },
      geometry: {
        type: "Point" as const,
        coordinates: [lng, lat],
      },
    });
  }

  return {
    type: "FeatureCollection" as const,
    features,
  };
}

// 200 markers rendered natively via AMap
const pointsData = generateRandomPoints(200);

interface SelectedPoint {
  id: number;
  name: string;
  category: string;
  coordinates: [number, number];
}

function MarkersLayer() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const { map, AMap, isLoaded } = useMap();
  const [selectedPoint, setSelectedPoint] = useState<SelectedPoint | null>(null);

  useEffect(() => {
    if (!map || !AMap || !isLoaded) return;

    pointsData.features.forEach((f) => {
      const [lng, lat] = f.geometry.coordinates;
      const div = document.createElement("div");
      div.style.cssText =
        "width:12px;height:12px;border-radius:50%;background:#3b82f6;border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);cursor:pointer;";

      const marker = new AMap.Marker({
        position: [lng, lat],
        content: div,
        offset: new AMap.Pixel(-6, -6),
      });
      marker.setMap(map);

      marker.on("click", () => {
        setSelectedPoint({
          id: f.properties.id,
          name: f.properties.name,
          category: f.properties.category,
          coordinates: [lng, lat],
        });
      });

      markersRef.current.push(marker);
    });

    return () => {
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [map, AMap, isLoaded]);

  return (
    <>
      {selectedPoint && (
        <MapPopup
          longitude={selectedPoint.coordinates[0]}
          latitude={selectedPoint.coordinates[1]}
          onClose={() => setSelectedPoint(null)}
          closeButton
        >
          <div className="min-w-[140px]">
            <p className="font-medium">{selectedPoint.name}</p>
            <p className="text-sm text-muted-foreground">
              {selectedPoint.category}
            </p>
          </div>
        </MapPopup>
      )}
    </>
  );
}

export function LayerMarkersExample() {
  return (
    <div className="h-[400px] w-full">
      <Map center={[116.397428, 39.90923]} zoom={11}>
        <MarkersLayer />
      </Map>
    </div>
  );
}
