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
  /** AMap JS API security code (required for 2.0) */
  securityJsCode?: string;
  /** Fit the map to these bounds [[sw_lng, sw_lat], [ne_lng, ne_lat]] */
  bounds?: [[number, number], [number, number]];
  /** Map view mode. Note: only takes effect on initial mount */
  viewMode?: "2D" | "3D";
  /** Callback when map finishes loading */
  onLoad?: () => void;
  /** Callback when map is clicked */
  onClick?: (lngLat: { lng: number; lat: number }) => void;
  /** Callback when map pan/move ends */
  onMoveEnd?: () => void;
  /** Callback when map zoom ends */
  onZoomEnd?: () => void;
  /** Callback when AMap fails to load */
  onError?: (error: Error) => void;
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
    securityJsCode,
    bounds,
    viewMode = "3D",
    onLoad,
    onClick,
    onMoveEnd,
    onZoomEnd,
    onError,
  },
  ref
) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<AMapInstance>(null);
  const [amapNS, setAmapNS] = useState<AMapNS>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { resolvedTheme } = useTheme();
  const currentStyleRef = useRef<string | null>(null);

  const onLoadRef = useRef(onLoad);
  const onClickRef = useRef(onClick);
  const onMoveEndRef = useRef(onMoveEnd);
  const onZoomEndRef = useRef(onZoomEnd);
  onLoadRef.current = onLoad;
  onClickRef.current = onClick;
  onMoveEndRef.current = onMoveEnd;
  onZoomEndRef.current = onZoomEnd;

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

    const key = amapKey ?? "983f0d71329b83141e06427729399d5e";
    const code = securityJsCode ?? "0105e3185f27b87d2aab3c2bad23fc86";
    // securityJsCode is set globally in layout.tsx <head> script;
    // only override here if explicitly passed as a prop.
    if (code) {
      window._AMapSecurityConfig = { securityJsCode: code };
    }

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
          viewMode,
          zoom,
          center,
          mapStyle: initialStyle,
          resizeEnable: true,
        });

        map.on("complete", () => {
          setIsLoaded(true);
          onLoadRef.current?.();
        });

        setMapInstance(map);
        setAmapNS(AMap);
      })
      .catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("AMap load error:", error);
        onError?.(error);
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

  // Map event callbacks (click, moveend, zoomend)
  useEffect(() => {
    if (!mapInstance) return;
    const handleClick = (e: AMapInstance) => {
      onClickRef.current?.({ lng: e.lnglat.getLng(), lat: e.lnglat.getLat() });
    };
    const handleMoveEnd = () => onMoveEndRef.current?.();
    const handleZoomEnd = () => onZoomEndRef.current?.();

    mapInstance.on("click", handleClick);
    mapInstance.on("moveend", handleMoveEnd);
    mapInstance.on("zoomend", handleZoomEnd);
    return () => {
      mapInstance.off("click", handleClick);
      mapInstance.off("moveend", handleMoveEnd);
      mapInstance.off("zoomend", handleZoomEnd);
    };
  }, [mapInstance]);

  // Sync bounds changes
  const boundsKey = bounds
    ? `${bounds[0][0]},${bounds[0][1]},${bounds[1][0]},${bounds[1][1]}`
    : null;
  useEffect(() => {
    if (!mapInstance || !amapNS || !bounds) return;
    const [sw, ne] = bounds;
    mapInstance.setBounds(new amapNS.Bounds(sw, ne));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, amapNS, boundsKey]);

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
  onDragStart?: (lngLat: { lng: number; lat: number }) => void;
  onDragEnd?: (lngLat: { lng: number; lat: number }) => void;
  zIndex?: number;
  /** Show or hide the marker */
  visible?: boolean;
};

function MapMarker({
  longitude,
  latitude,
  children,
  onClick,
  onMouseEnter,
  onMouseLeave,
  draggable = false,
  onDragStart,
  onDragEnd,
  zIndex,
  visible = true,
}: MapMarkerProps) {
  const { map, AMap } = useMap();
  const containerEl = useMemo(() => document.createElement("div"), []);

  // Keep latest callbacks in refs to avoid stale closures
  const onClickRef = useRef(onClick);
  const onMouseEnterRef = useRef(onMouseEnter);
  const onMouseLeaveRef = useRef(onMouseLeave);
  const onDragStartRef = useRef(onDragStart);
  const onDragEndRef = useRef(onDragEnd);
  onClickRef.current = onClick;
  onMouseEnterRef.current = onMouseEnter;
  onMouseLeaveRef.current = onMouseLeave;
  onDragStartRef.current = onDragStart;
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
    const handleDragStart = () => {
      const pos = marker.getPosition();
      onDragStartRef.current?.({ lng: pos.getLng(), lat: pos.getLat() });
    };
    const handleDragEnd = () => {
      const pos = marker.getPosition();
      onDragEndRef.current?.({ lng: pos.getLng(), lat: pos.getLat() });
    };

    marker.on("click", handleClick);
    marker.on("mouseover", handleMouseOver);
    marker.on("mouseout", handleMouseOut);
    marker.on("dragstart", handleDragStart);
    marker.on("dragend", handleDragEnd);

    return () => {
      marker.off("click", handleClick);
      marker.off("mouseover", handleMouseOver);
      marker.off("mouseout", handleMouseOut);
      marker.off("dragstart", handleDragStart);
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

  useEffect(() => {
    if (!marker) return;
    marker.setzIndex(zIndex ?? 10);
  }, [marker, zIndex]);

  useEffect(() => {
    if (!marker) return;
    if (visible) {
      marker.show();
    } else {
      marker.hide();
    }
  }, [marker, visible]);

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
  /** Show a scale bar at bottom-left of the map */
  showScale?: boolean;
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

function niceNumber(n: number): number {
  const exp = Math.floor(Math.log10(n));
  const base = Math.pow(10, exp);
  const normalized = n / base;
  if (normalized < 1.5) return base;
  if (normalized < 3.5) return 2 * base;
  if (normalized < 7.5) return 5 * base;
  return 10 * base;
}

function ScaleBar({ map }: { map: AMapInstance }) {
  const [scaleInfo, setScaleInfo] = useState<{ width: number; label: string } | null>(null);

  useEffect(() => {
    if (!map) return;
    const update = () => {
      const res: number = map.getResolution?.();
      if (!res || res <= 0) return;
      const rawMeters = res * 80;
      let width: number;
      let label: string;
      if (rawMeters >= 1000) {
        const niceKm = niceNumber(rawMeters / 1000);
        label = `${niceKm} km`;
        width = (niceKm * 1000) / res;
      } else {
        const niceM = niceNumber(rawMeters);
        label = `${niceM} m`;
        width = niceM / res;
      }
      setScaleInfo({ width, label });
    };
    update();
    map.on("zoomend", update);
    map.on("moveend", update);
    return () => {
      map.off("zoomend", update);
      map.off("moveend", update);
    };
  }, [map]);

  if (!scaleInfo) return null;

  return (
    <div className="flex flex-col items-start">
      <span className="text-[9px] leading-none mb-0.5 text-foreground/70 font-medium select-none">
        {scaleInfo.label}
      </span>
      <div
        className="h-[3px] rounded-sm bg-foreground/60"
        style={{ width: `${scaleInfo.width}px` }}
      />
    </div>
  );
}

function MapControls({
  position = "bottom-right",
  showZoom = true,
  showCompass = false,
  showLocate = false,
  showFullscreen = false,
  showScale = false,
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
    <>
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
      {showScale && (
        <div className="absolute z-10 bottom-2 left-2">
          <ScaleBar map={map} />
        </div>
      )}
    </>
  );
}

// ---- MapRoute (Polyline) ----

type MapRouteProps = {
  coordinates: [number, number][];
  color?: string;
  width?: number;
  opacity?: number;
  onClick?: () => void;
  /** Render the route as a dashed line */
  dashed?: boolean;
  /** Show direction arrows along the route */
  arrows?: boolean;
  /** Animate a moving marker along the route */
  animated?: boolean;
};

function MapRoute({
  coordinates,
  color = "#4285F4",
  width = 4,
  opacity = 0.8,
  onClick,
  dashed = false,
  arrows = false,
  animated = false,
}: MapRouteProps) {
  const { map, AMap, isLoaded } = useMap();
  const polylineRef = useRef<AMapInstance>(null);
  const animMarkerRef = useRef<AMapInstance>(null);
  const arrowMarkersRef = useRef<AMapInstance[]>([]);

  // Keep latest onClick in a ref to avoid stale closures
  const onClickRef = useRef(onClick);
  onClickRef.current = onClick;

  useEffect(() => {
    if (!isLoaded || !map || !AMap || coordinates.length < 2) return;

    // Create polyline fresh — also triggered when coordinates transitions from < 2 to >= 2
    const polyline = new AMap.Polyline({
      path: coordinates,
      strokeColor: color,
      strokeWeight: width,
      strokeOpacity: opacity,
      lineJoin: "round",
      lineCap: "round",
      strokeStyle: dashed ? "dashed" : "solid",
      strokeDasharray: dashed ? [10, 5] : undefined,
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
  }, [isLoaded, map, AMap, coordinates.length >= 2]);

  // Animated marker moving along the route — restart whenever coordinates or animated flag changes
  useEffect(() => {
    if (!animated || !isLoaded || !map || !AMap || coordinates.length < 2) return;

    // Build a dense interpolated path so the marker moves smoothly
    const LOOP_MS = 6000;
    const STEP_MS = 50;
    const totalSteps = LOOP_MS / STEP_MS;
    const segs = coordinates.length - 1;
    const stepsPerSeg = Math.ceil(totalSteps / segs);
    const pathPoints: [number, number][] = [];
    for (let i = 0; i < segs; i++) {
      const [x1, y1] = coordinates[i];
      const [x2, y2] = coordinates[i + 1];
      for (let s = 0; s < stepsPerSeg; s++) {
        const t = s / stepsPerSeg;
        pathPoints.push([x1 + (x2 - x1) * t, y1 + (y2 - y1) * t]);
      }
    }
    pathPoints.push(coordinates[coordinates.length - 1]);

    const el = document.createElement("div");
    el.style.cssText =
      "width:12px;height:12px;border-radius:50%;background:#fff;border:3px solid #3b82f6;box-shadow:0 0 0 4px rgba(59,130,246,.3),0 0 8px rgba(59,130,246,.6)";
    const animMarker = new AMap.Marker({
      position: coordinates[0],
      content: el,
      offset: new AMap.Pixel(-6, -6),
    });
    animMarker.setMap(map);
    animMarkerRef.current = animMarker;

    let step = 0;
    const intervalId = setInterval(() => {
      if (animMarkerRef.current) {
        animMarkerRef.current.setPosition(pathPoints[step % pathPoints.length]);
      }
      step++;
    }, STEP_MS);

    return () => {
      clearInterval(intervalId);
      if (animMarkerRef.current) {
        animMarkerRef.current.setMap(null);
        animMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap, animated, coordinates]);

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
      strokeStyle: dashed ? "dashed" : "solid",
      strokeDasharray: dashed ? [10, 5] : undefined,
    });
  }, [color, width, opacity, arrows, dashed]);

  // Direction arrow markers rendered as CSS triangles at each segment midpoint.
  // CSS border-trick triangles are used because SVG elements created via
  // createElementNS may not render reliably inside AMap.Marker content.
  useEffect(() => {
    // Clean up previous markers first
    arrowMarkersRef.current.forEach((m) => m.setMap(null));
    arrowMarkersRef.current = [];

    if (!arrows || !isLoaded || !map || !AMap || coordinates.length < 2) return;

    for (let i = 0; i < coordinates.length - 1; i++) {
      const [x1, y1] = coordinates[i];
      const [x2, y2] = coordinates[i + 1];
      const mx = (x1 + x2) / 2;
      const my = (y1 + y2) / 2;
      // Compass bearing from north, clockwise
      const angleDeg = Math.atan2(x2 - x1, y2 - y1) * (180 / Math.PI);
      // Wrapper div rotated to the route bearing; 16×14 px encloses the triangle
      const wrapper = document.createElement("div");
      wrapper.style.width = "16px";
      wrapper.style.height = "14px";
      wrapper.style.overflow = "visible";
      wrapper.style.transform = `rotate(${angleDeg}deg)`;
      wrapper.style.opacity = String(opacity);
      // Set color as a CSS custom property so no user data reaches innerHTML
      wrapper.style.setProperty("--ac", color);
      // CSS upward-pointing triangle (tip at top = north at 0° rotation)
      const tri = document.createElement("div");
      tri.style.position = "absolute";
      tri.style.left = "8px"; // center horizontally in the 16 px wrapper
      tri.style.top = "0";
      tri.style.width = "0";
      tri.style.height = "0";
      tri.style.borderLeft = "8px solid transparent";
      tri.style.borderRight = "8px solid transparent";
      tri.style.borderBottom = "14px solid var(--ac)";
      wrapper.appendChild(tri);
      const marker = new AMap.Marker({
        position: [mx, my],
        content: wrapper,
        offset: new AMap.Pixel(-8, -7),
        zIndex: 200,
      });
      marker.setMap(map);
      arrowMarkersRef.current.push(marker);
    }

    return () => {
      arrowMarkersRef.current.forEach((m) => m.setMap(null));
      arrowMarkersRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap, arrows, coordinates, color, opacity]);

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

// ---- MapPolygon ----

type MapPolygonProps = {
  /** Array of [lng, lat] coordinate pairs defining the polygon (minimum 3 points) */
  coordinates: [number, number][];
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

function MapPolygon({
  coordinates,
  fillColor = "#3b82f6",
  fillOpacity = 0.3,
  strokeColor = "#3b82f6",
  strokeWidth = 2,
  strokeOpacity = 0.8,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MapPolygonProps) {
  const { map, AMap, isLoaded } = useMap();
  const polygonRef = useRef<AMapInstance>(null);

  const onClickRef = useRef(onClick);
  const onMouseEnterRef = useRef(onMouseEnter);
  const onMouseLeaveRef = useRef(onMouseLeave);
  onClickRef.current = onClick;
  onMouseEnterRef.current = onMouseEnter;
  onMouseLeaveRef.current = onMouseLeave;

  useEffect(() => {
    if (!isLoaded || !map || !AMap || coordinates.length < 3) return;

    // Create polygon — also triggered when coordinates transitions from < 3 to >= 3
    const polygon = new AMap.Polygon({
      path: coordinates,
      fillColor,
      fillOpacity,
      strokeColor,
      strokeWeight: strokeWidth,
      strokeOpacity,
    });

    polygon.setMap(map);
    polygonRef.current = polygon;

    const handleClick = () => onClickRef.current?.();
    const handleMouseOver = () => onMouseEnterRef.current?.();
    const handleMouseOut = () => onMouseLeaveRef.current?.();

    polygon.on("click", handleClick);
    polygon.on("mouseover", handleMouseOver);
    polygon.on("mouseout", handleMouseOut);

    return () => {
      polygon.off("click", handleClick);
      polygon.off("mouseover", handleMouseOver);
      polygon.off("mouseout", handleMouseOut);
      polygon.setMap(null);
      polygonRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap, coordinates.length >= 3]);

  useEffect(() => {
    if (!polygonRef.current || coordinates.length < 3) return;
    polygonRef.current.setPath(coordinates);
  }, [coordinates]);

  useEffect(() => {
    if (!polygonRef.current) return;
    polygonRef.current.setOptions({
      fillColor,
      fillOpacity,
      strokeColor,
      strokeWeight: strokeWidth,
      strokeOpacity,
    });
  }, [fillColor, fillOpacity, strokeColor, strokeWidth, strokeOpacity]);

  return null;
}

// ---- MapCircle ----

type MapCircleProps = {
  /** Circle center [lng, lat] in GCJ-02 */
  center: [number, number];
  /** Radius in meters */
  radius: number;
  fillColor?: string;
  fillOpacity?: number;
  strokeColor?: string;
  strokeWidth?: number;
  strokeOpacity?: number;
  onClick?: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

function MapCircle({
  center,
  radius,
  fillColor = "#3b82f6",
  fillOpacity = 0.2,
  strokeColor = "#3b82f6",
  strokeWidth = 2,
  strokeOpacity = 0.8,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: MapCircleProps) {
  const { map, AMap, isLoaded } = useMap();
  const circleRef = useRef<AMapInstance>(null);

  const onClickRef = useRef(onClick);
  const onMouseEnterRef = useRef(onMouseEnter);
  const onMouseLeaveRef = useRef(onMouseLeave);
  onClickRef.current = onClick;
  onMouseEnterRef.current = onMouseEnter;
  onMouseLeaveRef.current = onMouseLeave;

  useEffect(() => {
    if (!isLoaded || !map || !AMap) return;

    const circle = new AMap.Circle({
      center,
      radius,
      fillColor,
      fillOpacity,
      strokeColor,
      strokeWeight: strokeWidth,
      strokeOpacity,
    });

    circle.setMap(map);
    circleRef.current = circle;

    const handleClick = () => onClickRef.current?.();
    const handleMouseOver = () => onMouseEnterRef.current?.();
    const handleMouseOut = () => onMouseLeaveRef.current?.();

    circle.on("click", handleClick);
    circle.on("mouseover", handleMouseOver);
    circle.on("mouseout", handleMouseOut);

    return () => {
      circle.off("click", handleClick);
      circle.off("mouseover", handleMouseOver);
      circle.off("mouseout", handleMouseOut);
      circle.setMap(null);
      circleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap]);

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.setCenter(center);
  }, [center]);

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.setRadius(radius);
  }, [radius]);

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.setOptions({
      fillColor,
      fillOpacity,
      strokeColor,
      strokeWeight: strokeWidth,
      strokeOpacity,
    });
  }, [fillColor, fillOpacity, strokeColor, strokeWidth, strokeOpacity]);

  return null;
}

// ---- MapHeatmap ----

type HeatmapPoint = {
  lng: number;
  lat: number;
  /** Relative weight/intensity for this point */
  count?: number;
};

type MapHeatmapProps = {
  /** Array of points or a GeoJSON FeatureCollection<Point> (uses properties.count/weight) */
  data: HeatmapPoint[] | GeoJSON.FeatureCollection<GeoJSON.Point, Record<string, unknown>>;
  /** Point radius in pixels */
  radius?: number;
  /** Heatmap opacity (0-1) */
  opacity?: number;
  /** Color gradient, keys are 0-1 positions e.g. { "0": "blue", "1": "red" } */
  gradient?: Record<string, string>;
  /** Maximum value used to normalize counts */
  max?: number;
};

function MapHeatmap({
  data,
  radius = 30,
  opacity = 0.8,
  gradient,
  max = 100,
}: MapHeatmapProps) {
  const { map, AMap, isLoaded } = useMap();
  const heatmapRef = useRef<AMapInstance>(null);

  const normalizedData = useMemo<HeatmapPoint[]>(() => {
    if (!Array.isArray(data)) {
      return data.features.map((f) => ({
        lng: f.geometry.coordinates[0],
        lat: f.geometry.coordinates[1],
        count:
          (f.properties?.count as number) ??
          (f.properties?.weight as number) ??
          1,
      }));
    }
    return data;
  }, [data]);

  useEffect(() => {
    if (!isLoaded || !map || !AMap) return;
    let cancelled = false;

    AMap.plugin(["AMap.HeatMap"], () => {
      if (cancelled) return;
      const heatmap = new AMap.HeatMap(map, {
        radius,
        opacity: [0, opacity],
        gradient: gradient ?? {
          "0": "#3b82f6",
          "0.4": "#06b6d4",
          "0.65": "#22c55e",
          "0.85": "#eab308",
          "1": "#ef4444",
        },
      });
      heatmap.setDataSet({ data: normalizedData, max });
      heatmapRef.current = heatmap;
    });

    return () => {
      cancelled = true;
      if (heatmapRef.current) {
        try {
          // AMap.HeatMap.setMap(null) may call getStatus() on an internal
          // reference that is already undefined when the page navigates away.
          // Swallow the error so the teardown doesn't crash the app.
          heatmapRef.current.setMap(null);
        } catch {
          // ignore
        }
        heatmapRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap]);

  useEffect(() => {
    if (!heatmapRef.current) return;
    heatmapRef.current.setDataSet({ data: normalizedData, max });
  }, [normalizedData, max]);

  useEffect(() => {
    if (!heatmapRef.current) return;
    heatmapRef.current.setOptions({ radius, opacity: [0, opacity], ...(gradient ? { gradient } : {}) });
  }, [radius, opacity, gradient]);

  return null;
}

// ---- MapTrafficLayer ----

type MapTrafficLayerProps = {
  /** Show or hide the traffic layer */
  visible?: boolean;
  /** Layer opacity (0-1) */
  opacity?: number;
};

function MapTrafficLayer({ visible = true, opacity = 1 }: MapTrafficLayerProps) {
  const { map, AMap, isLoaded } = useMap();
  const layerRef = useRef<AMapInstance>(null);

  useEffect(() => {
    if (!isLoaded || !map || !AMap) return;

    const layer = new AMap.TileLayer.Traffic({ opacity });
    layer.setMap(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        try {
          layerRef.current.setMap(null);
        } catch {
          // ignore teardown errors
        }
        layerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap]);

  useEffect(() => {
    if (!layerRef.current) return;
    if (visible) {
      layerRef.current.show();
    } else {
      layerRef.current.hide();
    }
  }, [visible]);

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.setOpacity(opacity);
  }, [opacity]);

  return null;
}

// ---- MapSatelliteLayer ----

type MapSatelliteLayerProps = {
  /** Show or hide the satellite layer */
  visible?: boolean;
  /** Layer opacity (0-1) */
  opacity?: number;
};

function MapSatelliteLayer({ visible = true, opacity = 1 }: MapSatelliteLayerProps) {
  const { map, AMap, isLoaded } = useMap();
  const layerRef = useRef<AMapInstance>(null);

  useEffect(() => {
    if (!isLoaded || !map || !AMap) return;

    const layer = new AMap.TileLayer.Satellite({ opacity });
    layer.setMap(map);
    layerRef.current = layer;

    return () => {
      if (layerRef.current) {
        try {
          layerRef.current.setMap(null);
        } catch {
          // ignore teardown errors
        }
        layerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap]);

  useEffect(() => {
    if (!layerRef.current) return;
    if (visible) {
      layerRef.current.show();
    } else {
      layerRef.current.hide();
    }
  }, [visible]);

  useEffect(() => {
    if (!layerRef.current) return;
    layerRef.current.setOpacity(opacity);
  }, [opacity]);

  return null;
}

// ---- useMapEvent ----

/**
 * Subscribe to a map event. Must be called inside a `<Map>` component.
 * Automatically cleans up when the component unmounts or the event name changes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useMapEvent(event: string, handler: (e: any) => void): void {
  const { map } = useMap();
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    if (!map) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn = (e: any) => handlerRef.current(e);
    map.on(event, fn);
    return () => map.off(event, fn);
  }, [map, event]);
}

// ---- useMapBounds ----

type MapBounds = {
  north: number;
  south: number;
  east: number;
  west: number;
};

/**
 * Returns the current map viewport bounds, updated on every move/zoom.
 * Must be called inside a `<Map>` component.
 */
function useMapBounds(): MapBounds | null {
  const { map, isLoaded } = useMap();
  const [bounds, setBounds] = useState<MapBounds | null>(null);

  useEffect(() => {
    if (!map || !isLoaded) return;

    const update = () => {
      const b = map.getBounds?.();
      if (!b) return;
      setBounds({
        north: b.getNorthEast().getLat(),
        south: b.getSouthWest().getLat(),
        east: b.getNorthEast().getLng(),
        west: b.getSouthWest().getLng(),
      });
    };

    update();
    map.on("moveend", update);
    map.on("zoomend", update);
    return () => {
      map.off("moveend", update);
      map.off("zoomend", update);
    };
  }, [map, isLoaded]);

  return bounds;
}

export {
  Map,
  useMap,
  useMapEvent,
  useMapBounds,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  MarkerLabel,
  MapPopup,
  MapControls,
  MapRoute,
  MapClusterLayer,
  MapPolygon,
  MapCircle,
  MapHeatmap,
  MapTrafficLayer,
  MapSatelliteLayer,
};

export type { MapRef, HeatmapPoint, MapBounds };