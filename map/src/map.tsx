"use client";

import { useTheme } from "next-themes";
import {
  createContext,
  forwardRef,
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

// ---- Shared hooks ----

function useLatestRef<T>(value: T) {
  const ref = useRef(value);
  ref.current = value;
  return ref;
}

function useOverlayEvents(
  overlay: AMapInstance | null,
  events: {
    onClick?: () => void;
    onMouseEnter?: () => void;
    onMouseLeave?: () => void;
  }
) {
  const clickRef = useLatestRef(events.onClick);
  const enterRef = useLatestRef(events.onMouseEnter);
  const leaveRef = useLatestRef(events.onMouseLeave);

  useEffect(() => {
    if (!overlay) return;
    const handleClick = () => clickRef.current?.();
    const handleOver = () => enterRef.current?.();
    const handleOut = () => leaveRef.current?.();

    overlay.on("click", handleClick);
    overlay.on("mouseover", handleOver);
    overlay.on("mouseout", handleOut);

    return () => {
      overlay.off("click", handleClick);
      overlay.off("mouseover", handleOver);
      overlay.off("mouseout", handleOut);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlay]);
}

// ---- Map ----

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

  const onLoadRef = useLatestRef(onLoad);
  const onClickRef = useLatestRef(onClick);
  const onMoveEndRef = useLatestRef(onMoveEnd);
  const onZoomEndRef = useLatestRef(onZoomEnd);
  const onErrorRef = useLatestRef(onError);

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
    if (code) {
      window._AMapSecurityConfig = { securityJsCode: code };
    }

    // Use a ref to track mount state and avoid closure staleness in async callbacks
    let isMounted = true;
    let map: AMapInstance = null;

    import("@amap/amap-jsapi-loader").then(({ default: AMapLoader }) => {
      if (!isMounted) return;
      return AMapLoader.load({
        key,
        version: "2.0",
        plugins: [],
      });
    })
      .then((AMap: AMapNS) => {
        if (!isMounted || !containerRef.current) return;

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
          if (!isMounted) return;
          setIsLoaded(true);
          onLoadRef.current?.();
        });

        setMapInstance(map);
        setAmapNS(AMap);
      })
      .catch((err: unknown) => {
        if (!isMounted) return;
        const error = err instanceof Error ? err : new Error(String(err));
        console.error("AMap load error:", error);
        onErrorRef.current?.(error);
      });

    return () => {
      isMounted = false;
      setIsLoaded(false);
      setMapInstance(null);
      setAmapNS(null);
      // Defer map.destroy() so child components unmount first and
      // don't call methods on a destroyed map instance.
      if (map) {
        queueMicrotask(() => {
          try { map.destroy(); } catch { /* ignore */ }
        });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapInstance || !resolvedTheme) return;
    const newStyle =
      resolvedTheme === "dark" ? mapStyles.dark : mapStyles.light;
    if (currentStyleRef.current === newStyle) return;
    currentStyleRef.current = newStyle;
    mapInstance.setMapStyle(newStyle);
  }, [mapInstance, resolvedTheme, mapStyles]);

  // Sync center — use serialized key to avoid effect storm from inline arrays
  const centerKey = center ? `${center[0]},${center[1]}` : null;
  useEffect(() => {
    if (!mapInstance || !center) return;
    mapInstance.panTo(center);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapInstance, centerKey]);

  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.setZoom(zoom);
  }, [mapInstance, zoom]);

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
  const [marker, setMarker] = useState<AMapInstance>(null);

  const onDragStartRef = useLatestRef(onDragStart);
  const onDragEndRef = useLatestRef(onDragEnd);

  // Create marker in effect to handle strict mode correctly
  useEffect(() => {
    if (!map || !AMap) return;

    // Create fresh container element for each mount
    const containerEl = document.createElement("div");

    const newMarker = new AMap.Marker({
      position: [longitude, latitude],
      content: containerEl,
      offset: new AMap.Pixel(0, 0),
      draggable,
    });

    newMarker.setMap(map);

    setMarker(newMarker);

    return () => {
      newMarker.setMap(null);
      setMarker(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, AMap]);

  useOverlayEvents(marker, { onClick, onMouseEnter, onMouseLeave });

  useEffect(() => {
    if (!marker) return;

    const handleDragStart = () => {
      const pos = marker.getPosition();
      onDragStartRef.current?.({ lng: pos.getLng(), lat: pos.getLat() });
    };
    const handleDragEnd = () => {
      const pos = marker.getPosition();
      onDragEndRef.current?.({ lng: pos.getLng(), lat: pos.getLat() });
    };

    marker.on("dragstart", handleDragStart);
    marker.on("dragend", handleDragEnd);

    return () => {
      marker.off("dragstart", handleDragStart);
      marker.off("dragend", handleDragEnd);
    };
  }, [marker]);

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
  if (!el) return null;

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
  const container = useMemo(
    () => (typeof document !== "undefined" ? document.createElement("div") : null),
    []
  );
  const infoWindowRef = useRef<AMapInstance>(null);

  useEffect(() => {
    if (!map || !AMap || !container || !marker) return;

    let isMounted = true;

    const infoWindow = new AMap.InfoWindow({
      content: container,
      offset: new AMap.Pixel(0, -30),
      closeWhenClickMap: true,
      isCustom: true,
    });
    infoWindowRef.current = infoWindow;

    const handleClick = () => {
      if (!isMounted) return;
      if (infoWindow.getIsOpen()) {
        infoWindow.close();
      } else {
        infoWindow.open(map, marker.getPosition());
      }
    };

    marker.on("click", handleClick);

    return () => {
      isMounted = false;
      marker.off("click", handleClick);
      infoWindow.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, AMap, marker]);

  const handleClose = () => {
    infoWindowRef.current?.close();
  };

  if (!container) return null;

  return createPortal(
    <div
      className={cn(
        "relative w-max max-w-[22rem] rounded-2xl border border-slate-200/80 bg-white/95 p-4 text-slate-900 shadow-xl ring-1 ring-black/5 backdrop-blur-sm animate-in fade-in-0 zoom-in-95 dark:border-slate-800 dark:bg-slate-950/95 dark:text-slate-100 dark:ring-white/10",
        className
      )}
    >
      {closeButton && (
        <button
          type="button"
          onClick={handleClose}
          className="absolute right-2 top-2 z-10 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/70 dark:text-slate-500 dark:hover:bg-slate-900 dark:hover:text-slate-300"
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
  const container = useMemo(
    () => (typeof document !== "undefined" ? document.createElement("div") : null),
    []
  );

  useEffect(() => {
    if (!map || !AMap || !container || !marker) return;

    let isMounted = true;

    const tooltip = new AMap.InfoWindow({
      content: container,
      offset: new AMap.Pixel(0, -30),
      isCustom: true,
      closeWhenClickMap: false,
    });

    const handleMouseOver = () => {
      if (!isMounted) return;
      tooltip.open(map, marker.getPosition());
    };
    const handleMouseOut = () => {
      tooltip.close();
    };

    marker.on("mouseover", handleMouseOver);
    marker.on("mouseout", handleMouseOut);

    return () => {
      isMounted = false;
      marker.off("mouseover", handleMouseOver);
      marker.off("mouseout", handleMouseOut);
      tooltip.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, AMap, marker]);

  if (!container) return null;

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
  const container = useMemo(
    () => (typeof document !== "undefined" ? document.createElement("div") : null),
    []
  );
  const infoWindowRef = useRef<AMapInstance>(null);
  const onCloseRef = useLatestRef(onClose);

  useEffect(() => {
    if (!map || !AMap || !container) return;

    let isMounted = true;

    const infoWindow = new AMap.InfoWindow({
      content: container,
      offset: new AMap.Pixel(0, -10),
      isCustom: true,
      closeWhenClickMap: true,
    });
    infoWindowRef.current = infoWindow;
    infoWindow.open(map, [longitude, latitude]);

    infoWindow.on("close", () => {
      if (isMounted) onCloseRef.current?.();
    });

    return () => {
      isMounted = false;
      infoWindow.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, AMap]);

  // Use serialized key to avoid effect storm from inline arrays
  const positionKey = `${longitude},${latitude}`;
  useEffect(() => {
    if (!infoWindowRef.current) return;
    infoWindowRef.current.setPosition([longitude, latitude]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [positionKey]);

  const handleClose = () => {
    infoWindowRef.current?.close();
  };

  if (!container) return null;

  return createPortal(
    <div
      className={cn(
        "relative rounded-md bg-popover p-3 text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95",
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
      try {
        map.off("zoomend", update);
        map.off("moveend", update);
      } catch {
        // map may be destroyed
      }
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
  const onLocateRef = useLatestRef(onLocate);

  const handleLocate = () => {
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
        onLocateRef.current?.(coords);
        setWaitingForLocation(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        setWaitingForLocation(false);
      }
    );
  };

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
            <ControlButton onClick={() => map?.zoomIn()} label="Zoom in">
              <Plus className="size-4" />
            </ControlButton>
            <ControlButton onClick={() => map?.zoomOut()} label="Zoom out">
              <Minus className="size-4" />
            </ControlButton>
          </ControlGroup>
        )}
        {showCompass && (
          <ControlGroup>
            <ControlButton onClick={() => { map?.setRotation(0); map?.setPitch(0); }} label="Reset bearing to north">
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
            <ControlButton
              onClick={() => {
                const container = map?.getContainer();
                if (!container) return;
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  container.requestFullscreen();
                }
              }}
              label="Toggle fullscreen"
            >
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
};

function MapRoute({
  coordinates,
  color = "#4285F4",
  width = 4,
  opacity = 0.8,
  onClick,
  dashed = false,
}: MapRouteProps) {
  const { map, AMap, isLoaded } = useMap();
  const polylineRef = useRef<AMapInstance>(null);

  const onClickRef = useLatestRef(onClick);

  const hasCoords = coordinates.length >= 2;

  // Only recreate the polyline when it appears/disappears (length crosses 2).
  // Path updates are handled by the setPath effect below.
  useEffect(() => {
    if (!isLoaded || !map || !AMap || !hasCoords) return;

    let isMounted = true;

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

    const handleClick = () => {
      if (isMounted) onClickRef.current?.();
    };
    polyline.on("click", handleClick);

    return () => {
      isMounted = false;
      polyline.off("click", handleClick);
      polyline.setMap(null);
      polylineRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap, hasCoords]);

  useEffect(() => {
    if (!polylineRef.current) return;
    if (!hasCoords) {
      polylineRef.current.setMap(null);
      polylineRef.current = null;
      return;
    }
    polylineRef.current.setPath(coordinates);
  }, [coordinates, hasCoords]);

  useEffect(() => {
    if (!polylineRef.current) return;
    polylineRef.current.setOptions({
      strokeColor: color,
      strokeWeight: width,
      strokeOpacity: opacity,
      strokeStyle: dashed ? "dashed" : "solid",
      strokeDasharray: dashed ? [10, 5] : undefined,
    });
  }, [color, width, opacity, dashed]);

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
  const onPointClickRef = useLatestRef(onPointClick);

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

            ctx.marker.on("click", () => {
              const feature = ctx.data.extData as GeoJSON.Feature<GeoJSON.Point, P>;
              onPointClickRef.current?.(feature, feature.geometry.coordinates as [number, number]);
            });
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
  }, [isLoaded, map, AMap, data, clusterColors, pointColor]);

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
  const [polygonObj, setPolygonObj] = useState<AMapInstance>(null);

  useOverlayEvents(polygonObj, { onClick, onMouseEnter, onMouseLeave });

  const hasCoords = coordinates.length >= 3;

  useEffect(() => {
    if (!isLoaded || !map || !AMap || !hasCoords) return;

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
    setPolygonObj(polygon);

    return () => {
      polygon.setMap(null);
      polygonRef.current = null;
      setPolygonObj(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap, hasCoords]);

  useEffect(() => {
    if (!polygonRef.current || !hasCoords) return;
    polygonRef.current.setPath(coordinates);
  }, [coordinates, hasCoords]);

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
  const [circleObj, setCircleObj] = useState<AMapInstance>(null);

  useOverlayEvents(circleObj, { onClick, onMouseEnter, onMouseLeave });

  // Use serialized key to avoid effect storm from inline center arrays
  const centerKey = `${center[0]},${center[1]}`;

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
    setCircleObj(circle);

    return () => {
      circle.setMap(null);
      circleRef.current = null;
      setCircleObj(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, map, AMap]);

  useEffect(() => {
    if (!circleRef.current) return;
    circleRef.current.setCenter(center);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerKey]);

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

// ---- Shared TileLayer (Traffic / Satellite) ----

type TileLayerProps = {
  ctor: "Traffic" | "Satellite";
  visible?: boolean;
  opacity?: number;
};

function TileLayer({ ctor, visible = true, opacity = 1 }: TileLayerProps) {
  const { map, AMap, isLoaded } = useMap();
  const layerRef = useRef<AMapInstance>(null);

  useEffect(() => {
    if (!isLoaded || !map || !AMap) return;

    const layer = ctor === "Traffic"
      ? new AMap.TileLayer.Traffic({ opacity })
      : new AMap.TileLayer.Satellite({ opacity });
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

type MapTrafficLayerProps = {
  /** Show or hide the traffic layer */
  visible?: boolean;
  /** Layer opacity (0-1) */
  opacity?: number;
};

function MapTrafficLayer({ visible, opacity }: MapTrafficLayerProps) {
  return <TileLayer ctor="Traffic" visible={visible} opacity={opacity} />;
}

type MapSatelliteLayerProps = {
  /** Show or hide the satellite layer */
  visible?: boolean;
  /** Layer opacity (0-1) */
  opacity?: number;
};

function MapSatelliteLayer({ visible, opacity }: MapSatelliteLayerProps) {
  return <TileLayer ctor="Satellite" visible={visible} opacity={opacity} />;
}

// ---- useMapEvent ----

/**
 * Subscribe to a map event. Must be called inside a `<Map>` component.
 * Automatically cleans up when the component unmounts or the event name changes.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function useMapEvent(event: string, handler: (e: any) => void): void {
  const { map } = useMap();
  const handlerRef = useLatestRef(handler);

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
      try {
        map.off("moveend", update);
        map.off("zoomend", update);
      } catch {
        // map may be destroyed
      }
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
