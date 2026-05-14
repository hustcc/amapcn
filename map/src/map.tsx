"use client";

import { useTheme } from "next-themes";
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { X, Minus, Plus, Locate, Maximize, Loader2 } from "lucide-react";
import { cn } from "./utils";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AMapNS = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AMapInstance = any;

declare global {
  interface Window {
    _AMapSecurityConfig?: { securityJsCode?: string };
  }
}

const defaultStyles = {
  dark: "amap://styles/dark",
  light: "amap://styles/light",
  normal: "amap://styles/normal",
};

type MapContextValue = {
  map: AMapInstance | null;
  AMap: AMapNS | null;
  isLoaded: boolean;
};

const MapContext = createContext<MapContextValue | null>(null);

function useMap() {
  const context = useContext(MapContext);
  if (!context) {
    throw new Error("useMap must be used within a Map component");
  }
  return context;
}

type MapProps = {
  children?: ReactNode;
  /** Map center [longitude, latitude] in GCJ-02 */
  center?: [number, number];
  /** Map zoom level (3-18) */
  zoom?: number;
  /** Custom map styles for light and dark themes */
  styles?: { light?: string; dark?: string };
  /** Additional CSS class for the container */
  className?: string;
  /** AMap JS API key */
  amapKey?: string;
};

type MapRef = AMapInstance;

const DefaultLoader = () => (
  <div className="absolute inset-0 flex items-center justify-center">
    <div className="flex gap-1">
      <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
      <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:150ms]" />
      <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:300ms]" />
    </div>
  </div>
);

const Map = forwardRef<MapRef, MapProps>(function Map(
  {
    children,
    center = [116.397428, 39.90923],
    zoom = 11,
    styles,
    className,
    amapKey,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<AMapInstance>(null);
  const [amapNS, setAmapNS] = useState<AMapNS>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const currentStyleRef = useRef<string | null>(null);

  const mapStyles = useMemo(
    () => ({
      dark: styles?.dark ?? defaultStyles.dark,
      light: styles?.light ?? defaultStyles.light,
    }),
    [styles]
  );

  useImperativeHandle(ref, () => mapInstance, [mapInstance]);

  useEffect(() => {
    if (!containerRef.current) return;

    const key =
      amapKey ?? "f59bcf249433f8b05caaee19f349b3d7";

    let map: AMapInstance = null;

    import("@amap/amap-jsapi-loader").then(({ default: AMapLoader }) => {
      return AMapLoader.load({
        key,
        version: "2.0",
        plugins: [],
      });
    })
      .then((AMap: AMapNS) => {
        if (!containerRef.current) return;

        const initialStyle =
          resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
        currentStyleRef.current = initialStyle;

        map = new AMap.Map(containerRef.current, {
          viewMode: "3D",
          zoom,
          center,
          mapStyle: initialStyle,
          resizeEnable: true,
        });

        map.on("complete", () => {
          setIsLoaded(true);
        });

        setMapInstance(map);
        setAmapNS(AMap);
      })
      .catch((err: unknown) => {
        console.error("AMap load error:", err);
      });

    return () => {
      if (map) {
        map.destroy();
      }
      setIsLoaded(false);
      setMapInstance(null);
      setAmapNS(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Theme change
  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;
    const newStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (currentStyleRef.current === newStyle) return;
    currentStyleRef.current = newStyle;
    mapInstance.setMapStyle(newStyle);
  }, [mapInstance, resolvedTheme, mapStyles]);

  // Sync center changes
  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.panTo(center);
  }, [mapInstance, center]);

  // Sync zoom changes
  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.setZoom(zoom);
  }, [mapInstance, zoom]);

  const contextValue = useMemo(
    () => ({ map: mapInstance, AMap: amapNS, isLoaded }),
    [mapInstance, amapNS, isLoaded]
  );

  return (
    <MapContext.Provider value={contextValue}>
      <div
        ref={containerRef}
        className={cn("relative w-full h-full", className)}
      >
        {!isLoaded && <DefaultLoader />}
        {mapInstance && children}
      </div>
    </MapContext.Provider>
  );
});

// ---- Marker ----

type MarkerContextValue = {
  marker: AMapInstance;
  map: AMapInstance | null;
};

const MarkerContext = createContext<MarkerContextValue | null>(null);

function useMarkerContext() {
  const context = useContext(MarkerContext);
  if (!context) throw new Error("Marker components must be used within MapMarker");
  return context;
}

type MapMarkerProps = {
  /** Longitude (GCJ-02) */
  longitude: number;
  /** Latitude (GCJ-02) */
  latitude: number;
  children: ReactNode;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  draggable?: boolean;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
};

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  draggable = false,
  onDragEnd,
}: MapMarkerProps) {
  const { map, AMap } = useMap();
  const containerEl = useMemo(() => document.createElement("div"), []);

  // Keep latest callbacks in refs to avoid stale closures
  const onClickRef = useRef(onClick);
  const onMouseEnterRef = useRef(onMouseEnter);
  const onMouseLeaveRef = useRef(onMouseLeave);
  const onDragEndRef = useRef(onDragEnd);
  onClickRef.current = onClick;
  onMouseEnterRef.current = onMouseEnter;
  onMouseLeaveRef.current = onMouseLeave;
  onDragEndRef.current = onDragEnd;

  const marker = useMemo(() => {
    if (!AMap) return null;
    return new AMap.Marker({
      position: [longitude, latitude],
      content: containerEl,
      offset: new AMap.Pixel(0, 0),
      draggable,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [AMap]);

  useEffect(() => {
    if (!map || !marker) return;
    marker.setMap(map);

    const handleClick = () => onClickRef.current?.();
    const handleMouseOver = () => onMouseEnterRef.current?.();
    const handleMouseOut = () => onMouseLeaveRef.current?.();
    const handleDragEnd = () => {
      const pos = marker.getPosition();
      onDragEndRef.current?.({ lng: pos.getLng(), lat: pos.getLat() });
    };

    marker.on("click", handleClick);
    marker.on("mouseover", handleMouseOver);
    marker.on("mouseout", handleMouseOut);
    marker.on("dragend", handleDragEnd);

    return () => {
      marker.off("click", handleClick);
      marker.off("mouseover", handleMouseOver);
      marker.off("mouseout", handleMouseOut);
      marker.off("dragend", handleDragEnd);
      marker.setMap(null);
    };
  }, [map, marker]);

  useEffect(() => {
    if (!marker) return;
    marker.setPosition([longitude, latitude]);
  }, [marker, longitude, latitude]);

  useEffect(() => {
    if (!marker) return;
    marker.setDraggable(draggable);
  }, [marker, draggable]);

  if (!marker) return null;

  return (
    <MarkerContext.Provider value={{ marker, map }}>
      {children}
    </MarkerContext.Provider>
  );
}

// MarkerContent - renders children into the marker element
type MarkerContentProps = {
  children?: ReactNode;
  className?: string;
};

function MarkerContent({ children, className }: MarkerContentProps) {
  const { marker } = useMarkerContext();
  const el = marker.getContent() as HTMLElement;

  return createPortal(
    <div className={cn("relative -translate-x-1/2 -translate-y-1/2 cursor-pointer", className)}>
      {children || <DefaultMarkerIcon />}
    </div>,
    el
  );
}

function DefaultMarkerIcon() {
  return (
    <div className="relative h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-lg" />
  );
}

// MarkerPopup - click-activated info window
type MarkerPopupProps = {
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
};

function MarkerPopup({ children, className, closeButton = false }: MarkerPopupProps) {
  const { marker, map } = useMarkerContext();
  const { AMap } = useMap();
  const container = useMemo(() => document.createElement("div"), []);
  const infoWindowRef = useRef<AMapInstance>(null);

  useEffect(() => {
    if (!map || !AMap) return;

    const infoWindow = new AMap.InfoWindow({
      content: container,
      offset: new AMap.Pixel(0, -30),
      closeWhenClickMap: true,
      isCustom: true,
    });
    infoWindowRef.current = infoWindow;

    const handleClick = () => {
      if (infoWindow.getIsOpen()) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker.getPosition());
      }
    };

    marker.on("click", handleClick);

    return () => {
      marker.off("click", handleClick);
      infoWindow.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, AMap]);

  const handleClose = () => {
    infoWindowRef.current?.close();
  };

  return createPortal(
    <div
      className={cn(
        "relative rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-1 right-1 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close popup</span>
        </button>
      )}
      {children}
    </div>,
    container
  );
}

// MarkerTooltip - hover tooltip
type MarkerTooltipProps = {
  children: ReactNode;
  className?: string;
};

function MarkerTooltip({ children, className }: MarkerTooltipProps) {
  const { marker, map } = useMarkerContext();
  const { AMap } = useMap();
  const container = useMemo(() => document.createElement("div"), []);

  useEffect(() => {
    if (!map || !AMap) return;

    const tooltip = new AMap.InfoWindow({
      content: container,
      offset: new AMap.Pixel(0, -30),
      isCustom: true,
      closeWhenClickMap: false,
    });

    const handleMouseOver = () => {
      tooltip.open(map, marker.getPosition());
    };
    const handleMouseOut = () => {
      tooltip.close();
    };

    marker.on("mouseover", handleMouseOver);
    marker.on("mouseout", handleMouseOut);

    return () => {
      marker.off("mouseover", handleMouseOver);
      marker.off("mouseout", handleMouseOut);
      tooltip.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, AMap]);

  return createPortal(
    <div
      className={cn(
        "rounded-md bg-foreground px-2 py-1 text-xs text-background shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {children}
    </div>,
    container
  );
}

// MarkerLabel
type MarkerLabelProps = {
  children: ReactNode;
  className?: string;
  position?: "top" | "bottom";
};

function MarkerLabel({ children, className, position = "top" }: MarkerLabelProps) {
  const positionClasses = { top: "bottom-full mb-1", bottom: "top-full mt-1" };
  return (
    <div
      className={cn(
        "absolute left-1/2 -translate-x-1/2 whitespace-nowrap",
        "text-[10px] font-medium text-foreground",
        positionClasses[position],
        className
      )}
    >
      {children}
    </div>
  );
}

// ---- Standalone MapPopup ----

type MapPopupProps = {
  longitude: number;
  latitude: number;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
  closeButton?: boolean;
};

function MapPopup({
  longitude,
  latitude,
  onClose,
  children,
  className,
  closeButton = false,
}: MapPopupProps) {
  const { map, AMap } = useMap();
  const container = useMemo(() => document.createElement("div"), []);

  const infoWindowRef = useRef<AMapInstance>(null);

  useEffect(() => {
    if (!map || !AMap) return;

    const infoWindow = new AMap.InfoWindow({
      content: container,
      offset: new AMap.Pixel(0, -10),
      isCustom: true,
      closeWhenClickMap: true,
    });
    infoWindowRef.current = infoWindow;
    infoWindow.open(map, [longitude, latitude]);

    infoWindow.on("close", () => onClose?.());

    return () => {
      infoWindow.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, AMap]);

  useEffect(() => {
    if (!infoWindowRef.current) return;
    infoWindowRef.current.setPosition([longitude, latitude]);
  }, [longitude, latitude]);

  const handleClose = () => {
    infoWindowRef.current?.close();
  };

  return createPortal(
    <div
      className={cn(
        "relative rounded-md border bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-1 right-1 z-10 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          aria-label="Close popup"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close popup</span>
        </button>
      )}
      {children}
    </div>,
    container
  );
}

// ---- MapControls ----

type MapControlsProps = {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  showZoom?: boolean;
  showCompass?: boolean;
  showLocate?: boolean;
  showFullscreen?: boolean;
  className?: string;
  onLocate?: (coords: { longitude: number; latitude: number }) => void;
};

const positionClasses = {
  "top-left": "top-2 left-2",
  "top-right": "top-2 right-2",
  "bottom-left": "bottom-2 left-2",
  "bottom-right": "bottom-10 right-2",
};

function ControlGroup({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col rounded-md border border-border bg-background shadow-sm overflow-hidden [&>button:not(:last-child)]:border-b [&>button:not(:last-child)]:border-border">
      {children}
    </div>
  );
}

function ControlButton({
  onClick,
  label,
  children,
  disabled = false,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      type="button"
      className={cn(
        "flex items-center justify-center size-8 hover:bg-accent dark:hover:bg-accent/40 transition-colors",
        disabled && "opacity-50 pointer-events-none cursor-not-allowed"
      )}
      disabled={disabled}
    >
      {children}
    </button>
  );
}

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  className,
  onLocate,
}: MapControlsProps) {
  const { map, isLoaded } = useMap();
  const [waitingForLocation, setWaitingForLocation] = useState(false);

  const handleZoomIn = useCallback(() => {
    map?.zoomIn();
  }, [map]);

  const handleZoomOut = useCallback(() => {
    map?.zoomOut();
  }, [map]);

  const handleResetBearing = useCallback(() => {
    map?.setRotation(0);
    map?.setPitch(0);
  }, [map]);

  const handleLocate = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setWaitingForLocation(false);
      return;
    }
    setWaitingForLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = {
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude,
        };
        map?.panTo([coords.longitude, coords.latitude]);
        map?.setZoom(14);
        onLocate?.(coords);
        setWaitingForLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setWaitingForLocation(false);
      }
    );
  }, [map, onLocate]);

  const handleFullscreen = useCallback(() => {
    const container = map?.getContainer();
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  }, [map]);

  if (!isLoaded) return null;

  return (
    <div
      className={cn(
        "absolute z-10 flex flex-col gap-1.5",
        positionClasses[position],
        className
      )}
    >
      {showZoom && (
        <ControlGroup>
          <ControlButton onClick={handleZoomIn} label="Zoom in">
            <Plus className="size-4" />
          </ControlButton>
          <ControlButton onClick={handleZoomOut} label="Zoom out">
            <Minus className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
      {showCompass && (
        <ControlGroup>
          <ControlButton onClick={handleResetBearing} label="Reset bearing to north">
            <svg viewBox="0 0 24 24" className="size-5">
              <path d="M12 2L16 12H12V2Z" className="fill-red-500" />
              <path d="M12 2L8 12H12V2Z" className="fill-red-300" />
              <path d="M12 22L16 12H12V22Z" className="fill-muted-foreground/60" />
              <path d="M12 22L8 12H12V22Z" className="fill-muted-foreground/30" />
            </svg>
          </ControlButton>
        </ControlGroup>
      )}
      {showLocate && (
        <ControlGroup>
          <ControlButton onClick={handleLocate} label="Find my location" disabled={waitingForLocation}>
            {waitingForLocation ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Locate className="size-4" />
            )}
          </ControlButton>
        </ControlGroup>
      )}
      {showFullscreen && (
        <ControlGroup>
          <ControlButton onClick={handleFullscreen} label="Toggle fullscreen">
            <Maximize className="size-4" />
          </ControlButton>
        </ControlGroup>
      )}
    </div>
  );
}

// ---- MapRoute (Polyline) ----

type MapRouteProps = {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  onClick?: () => void;
};

function MapRoute({
  coordinates,
  color = "#4285F4",
  width = 4,
  opacity = 0.8,
  onClick,
}: MapRouteProps) {
  const { map, AMap, isLoaded } = useMap();
  const polylineRef = useRef<AMapInstance>(null);

  // Keep latest onClick in a ref to avoid stale closures
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    if (!isLoaded || !map || !AMap || coordinates.length < 2) return;

    const polyline = new AMap.Polyline({
      path: coordinates,
      strokeColor: color,
      strokeWeight: width,
      strokeOpacity: opacity,
      lineJoin: "round",
      lineCap: "round",
    });

    polyline.setMap(map);
    polylineRef.current = polyline;

    const handleClick = () => onClickRef.current?.();
    polyline.on("click", handleClick);

    return () => {
      polyline.off("click", handleClick);
      polyline.setMap(null);
      polylineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap]);

  useEffect(() => {
    if (!polylineRef.current) return;
    if (coordinates.length < 2) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
      return;
    }
    polylineRef.current.setPath(coordinates);
  }, [coordinates]);

  useEffect(() => {
    if (!polylineRef.current) return;
    polylineRef.current.setOptions({
      strokeColor: color,
      strokeWeight: width,
      strokeOpacity: opacity,
    });
  }, [color, width, opacity]);

  return null;
}

// ---- MapClusterLayer ----

type MapClusterLayerProps<
  P extends Record<string, unknown> = Record<string, unknown>
> = {
  data: GeoJSON.FeatureCollection<GeoJSON.Point, P> | string;
  clusterColors?: [string, string, string];
  pointColor?: string;
  onPointClick?: (
    feature: GeoJSON.Feature<GeoJSON.Point, P>,
    coordinates: [number, number]
  ) => void;
};

function MapClusterLayer<
  P extends Record<string, unknown> = Record<string, unknown>
>({
  data,
  clusterColors = ["#51bbd6", "#f1f075", "#f28cb1"],
  pointColor = "#3b82f6",
  onPointClick,
}: MapClusterLayerProps<P>) {
  const { map, AMap, isLoaded } = useMap();
  const clusterRef = useRef<AMapInstance>(null);

  useEffect(() => {
    if (!isLoaded || !map || !AMap) return;

    let cancelled = false;

    const resolveData = async () => {
      let geojson: GeoJSON.FeatureCollection<GeoJSON.Point, P>;
      if (typeof data === "string") {
        const res = await fetch(data);
        geojson = await res.json();
      } else {
        geojson = data;
      }

      if (cancelled) return;

      AMap.plugin(["AMap.MarkerCluster"], () => {
        if (cancelled) return;

        const points = geojson.features.map((f) => ({
          lnglat: f.geometry.coordinates as [number, number],
          extData: f,
        }));

        const cluster = new AMap.MarkerCluster(map, points, {
          gridSize: 60,
          renderClusterMarker: (ctx: AMapInstance) => {
            const count = ctx.count;
            const color =
              count > 750
                ? clusterColors[2]
                : count > 100
                ? clusterColors[1]
                : clusterColors[0];
            const size = count > 750 ? 40 : count > 100 ? 30 : 20;
            const div = document.createElement("div");
            div.style.cssText = `
              width:${size}px;height:${size}px;border-radius:50%;
              background:${color};display:flex;align-items:center;
              justify-content:center;color:#fff;font-size:12px;font-weight:600;
            `;
            div.textContent = String(count);
            ctx.marker.setContent(div);
            ctx.marker.setOffset(new AMap.Pixel(-size / 2, -size / 2));
          },
          renderMarker: (ctx: AMapInstance) => {
            const div = document.createElement("div");
            div.style.cssText = `
              width:12px;height:12px;border-radius:50%;
              background:${pointColor};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,.3);
              cursor:pointer;
            `;
            ctx.marker.setContent(div);
            ctx.marker.setOffset(new AMap.Pixel(-6, -6));

            if (onPointClick) {
              ctx.marker.on("click", () => {
                const feature = ctx.data.extData as GeoJSON.Feature<GeoJSON.Point, P>;
                onPointClick(feature, feature.geometry.coordinates as [number, number]);
              });
            }
          },
        });

        clusterRef.current = cluster;
      });
    };

    resolveData().catch(console.error);

    return () => {
      cancelled = true;
      if (clusterRef.current) {
        clusterRef.current.setMap(null);
        clusterRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap, data, clusterColors, pointColor, onPointClick]);

  return null;
}

export {
  Map,
  useMap,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MarkerLabel,
  MapPopup,
  MapControls,
  MapRoute,
  MapClusterLayer,
};

export type { MapRef };