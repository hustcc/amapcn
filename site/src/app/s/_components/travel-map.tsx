"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Map, MapMarker, MarkerContent, MapRoute, useMap } from "amapcn";
import {
  ChevronDown,
  ChevronUp,
  Check,
  MapPin,
  Maximize2,
  Minus,
  Moon,
  Pencil,
  Plus,
  Search,
  Share2,
  Sun,
  Trash2,
  X,
} from "lucide-react";
import { useTheme } from "next-themes";
import { encode, decode } from "@/lib/codec";
import { cn } from "@/lib/utils";

// ---- Types ----

export type TravelPoint = {
  id: string;
  lng: number;
  lat: number;
  name: string;
  description: string;
  icon: string;
};

export type TravelData = {
  title: string;
  points: TravelPoint[];
};

// ---- Constants ----

const ICONS = [
  // 定位 & 导航
  "📍", "🗺️", "🧭", "🚩", "🏁",
  // 住宿
  "🏠", "🏨", "⛺", "🏕️", "🛖",
  // 餐饮
  "🍜", "🍣", "🍕", "☕", "🍺",
  // 景点 & 自然
  "🏔️", "🌋", "🏖️", "🌊", "🌄",
  "🌅", "🌉", "🏝️", "🌲", "🏞️",
  // 建筑 & 文化
  "🏛️", "🛕", "🏯", "🗼", "⛩️",
  "🎭", "🎪", "🎡", "🎠", "🎢",
  // 交通
  "🚉", "✈️", "🚢", "🚗", "🚁",
  // 活动 & 娱乐
  "🎯", "⭐", "🎿", "🤿", "🧗",
  "🎸", "🎨", "📸", "🛍️", "💎",
];

const DEFAULT: TravelData = { title: "我的旅游线路", points: [] };

// ---- Internal map helpers (must be rendered inside <Map>) ----

function MapClickListener({ onMapClick }: { onMapClick: (lng: number, lat: number) => void }) {
  const { map } = useMap();
  const cb = useRef(onMapClick);
  cb.current = onMapClick;
  useEffect(() => {
    if (!map) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handler = (e: any) => cb.current(e.lnglat.getLng(), e.lnglat.getLat());
    map.on("click", handler);
    return () => map.off("click", handler);
  }, [map]);
  return null;
}

function ThemeToggleBtn() {
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      title={isDark ? "切换浅色模式" : "切换深色模式"}
      className="flex items-center justify-center size-7 rounded-md border hover:bg-muted transition-colors shrink-0"
    >
      {isDark ? <Sun className="size-3.5" /> : <Moon className="size-3.5" />}
    </button>
  );
}

function MapController() {
  const { map } = useMap();
  const [is3D, setIs3D] = useState(false);

  const toggle3D = () => {
    if (!map) return;
    const next = !is3D;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const m = map as any;
    if (next) {
      m.setPitchEnable?.(true);
      m.setRotationEnable?.(true);
      m.setPitch(45);
      m.setRotation(0);
    } else {
      m.setPitch(0);
      m.setRotation(0);
    }
    setIs3D(next);
  };

  const btnCls = "flex items-center justify-center w-8 h-8 hover:bg-muted transition-colors";

  return (
    <div className="absolute top-3 right-3 z-10 flex flex-col bg-background/95 backdrop-blur border rounded-lg shadow-md overflow-hidden">
      <button
        onClick={toggle3D}
        title={is3D ? "切换平面模式" : "切换3D模式"}
        className={cn(btnCls, is3D && "text-primary")}
      >
        <span className="text-[10px] font-bold leading-none">{is3D ? "2D" : "3D"}</span>
      </button>
      <div className="border-t" />
      <button
        onClick={() => map?.setFitView()}
        title="适配行程"
        className={btnCls}
      >
        <Maximize2 className="size-3.5" />
      </button>
      <div className="border-t" />
      <button
        onClick={() => map?.zoomIn()}
        title="放大"
        className={btnCls}
      >
        <Plus className="size-3.5" />
      </button>
      <button
        onClick={() => map?.zoomOut()}
        title="缩小"
        className={btnCls}
      >
        <Minus className="size-3.5" />
      </button>
    </div>
  );
}

function MapPanner({ target }: { target: [number, number] | null }) {
  const { map } = useMap();
  const prev = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!map || !target) return;
    if (prev.current?.[0] === target[0] && prev.current?.[1] === target[1]) return;
    prev.current = target;
    map.setZoomAndCenter(14, target);
  }, [map, target]);
  return null;
}

function AutoFitView({ hasPoints }: { hasPoints: boolean }) {
  const { map, isLoaded } = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (!map || !isLoaded || fitted.current || !hasPoints) return;
    fitted.current = true;
    setTimeout(() => map.setFitView(), 100);
  }, [map, isLoaded, hasPoints]);
  return null;
}

function MapPanOnly({ target }: { target: [number, number] | null }) {
  const { map } = useMap();
  const prev = useRef<[number, number] | null>(null);
  useEffect(() => {
    if (!map || !target) return;
    if (prev.current?.[0] === target[0] && prev.current?.[1] === target[1]) return;
    prev.current = target;
    map.panTo(target);
  }, [map, target]);
  return null;
}

type SearchResult = { name: string; district: string; location: { lng: number; lat: number } };

/** Runs inside <Map> — only triggers AMap AutoComplete, surfaces results via callback */
function PlaceSearch({
  query,
  onResults,
}: {
  query: string;
  onResults: (r: SearchResult[]) => void;
}) {
  const { map, AMap } = useMap();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cbRef = useRef(onResults);
  cbRef.current = onResults;

  useEffect(() => {
    if (!map || !AMap || !query.trim()) {
      cbRef.current([]);
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      AMap.plugin("AMap.AutoComplete", () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ac = new (AMap as any).AutoComplete({ city: "全国" });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        ac.search(query, (_status: string, result: any) => {
          if (_status !== "complete" || !result?.tips) { cbRef.current([]); return; }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const hits: SearchResult[] = result.tips.flatMap((t: any) => {
            const loc = t.location;
            if (!loc) return [];
            // AMap.LngLat instance → getLng/getLat; plain object → .lng/.lat
            const lng: number = typeof loc.getLng === "function" ? loc.getLng() : loc.lng;
            const lat: number = typeof loc.getLat === "function" ? loc.getLat() : loc.lat;
            if (!lng || !lat) return [];
            return [{ name: t.name as string, district: (t.district as string) ?? "", location: { lng, lat } }];
          });
          cbRef.current(hits.slice(0, 6));
        });
      });
    }, 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [map, AMap, query]);

  return null;
}

// ---- Main TravelMap component ----

export function TravelMap({ initial }: { initial?: TravelData }) {
  const [data, setData] = useState<TravelData>(initial ?? DEFAULT);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editVals, setEditVals] = useState({ name: "", description: "", icon: "" });
  const [iconOpen, setIconOpen] = useState(false);
  const [addMode, setAddMode] = useState(false);
  const [shareMsg, setShareMsg] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchFocused, setSearchFocused] = useState(false);
  const [panTarget, setPanTarget] = useState<[number, number] | null>(null);
  const [hoverPanTarget, setHoverPanTarget] = useState<[number, number] | null>(null);
  const [previewMarker, setPreviewMarker] = useState<{ lng: number; lat: number; name: string } | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Fixed initial center — don't re-center on every state change
  const initialCenter = useRef<[number, number]>(
    initial?.points.length
      ? [initial.points[0].lng, initial.points[0].lat]
      : [116.397428, 39.90923],
  );

  const routeCoords: [number, number][] = data.points.map((p) => [p.lng, p.lat]);

  // Map click: add a new point when in addMode
  const handleMapClick = useCallback(
    (lng: number, lat: number) => {
      if (!addMode) return;
      setData((d) => ({
        ...d,
        points: [
          ...d.points,
          {
            id: crypto.randomUUID(),
            lng,
            lat,
            name: `第${d.points.length + 1}站`,
            description: "",
            icon: "📍",
          },
        ],
      }));
      setAddMode(false);
    },
    [addMode],
  );

  const startEdit = (p: TravelPoint) => {
    setEditingId(p.id);
    setEditVals({ name: p.name, description: p.description, icon: p.icon });
    setIconOpen(false);
  };

  const confirmEdit = () => {
    if (!editingId) return;
    setData((d) => ({
      ...d,
      points: d.points.map((p) => (p.id === editingId ? { ...p, ...editVals } : p)),
    }));
    setEditingId(null);
  };

  const movePoint = (id: string, dir: -1 | 1) => {
    setData((d) => {
      const pts = [...d.points];
      const i = pts.findIndex((p) => p.id === id);
      const j = i + dir;
      if (j < 0 || j >= pts.length) return d;
      [pts[i], pts[j]] = [pts[j], pts[i]];
      return { ...d, points: pts };
    });
  };

  const deletePoint = (id: string) => {
    setData((d) => ({ ...d, points: d.points.filter((p) => p.id !== id) }));
    if (editingId === id) setEditingId(null);
  };

  // Sync URL hash in real-time as data changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        const hash = await encode(data);
        window.history.replaceState(null, "", `/s#${hash}`);
      } catch {
        // ignore
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [data]);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      await navigator.clipboard.writeText(url);
      setShareMsg("已复制!");
      setTimeout(() => setShareMsg(""), 2000);
    } catch {
      setShareMsg("失败");
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-background z-50">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 h-12 border-b bg-background/95 backdrop-blur shrink-0">
        <MapPin className="size-4 text-primary shrink-0" />
        <input
          className="flex-1 font-semibold bg-transparent border-none outline-none min-w-0 text-sm"
          value={data.title}
          onChange={(e) => setData((d) => ({ ...d, title: e.target.value }))}
          placeholder="旅游线路标题"
        />
        <button
          onClick={() => setAddMode((a) => !a)}
          className={cn(
            "flex items-center gap-1.5 px-3 h-7 text-xs rounded-md transition-colors shrink-0",
            addMode
              ? "bg-primary text-primary-foreground"
              : "border border-dashed hover:bg-muted",
          )}
        >
          <Plus className="size-3" />
          {addMode ? "点击地图添加..." : "添加"}
        </button>
        <ThemeToggleBtn />
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 h-7 text-xs rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shrink-0"
        >
          <Share2 className="size-3" />
          {shareMsg || "分享"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Map area */}
        <div className={cn("flex-1 relative", addMode && "cursor-crosshair")}>
          {/* Search overlay — top-left of map */}
          <div className="absolute top-3 left-3 z-10 w-60">
            <div className="flex items-center gap-1.5 bg-background/95 backdrop-blur border rounded-lg px-2.5 shadow-md focus-within:ring-1 ring-primary">
              <Search className="size-3.5 text-muted-foreground shrink-0" />
              <input
                className="flex-1 py-2 text-xs bg-transparent outline-none"
                placeholder="搜索地点定位..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => { setSearchFocused(false); setPreviewMarker(null); }, 150)}
              />
              {searchQuery && (
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => { setSearchQuery(""); setSearchResults([]); }}>
                  <X className="size-3 text-muted-foreground" />
                </button>
              )}
            </div>
            {searchFocused && searchResults.length > 0 && (
              <ul className="mt-1 bg-popover border rounded-lg shadow-lg overflow-hidden">
                {searchResults.map((r, i) => (
                  <li key={i}>
                    <button
                      className="w-full flex items-start gap-2 px-3 py-2 text-left hover:bg-muted transition-colors"
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => {
                        setPreviewMarker({ lng: r.location.lng, lat: r.location.lat, name: r.name });
                        setHoverPanTarget([r.location.lng, r.location.lat]);
                      }}
                      onMouseLeave={() => setPreviewMarker(null)}
                      onClick={() => {
                        setPreviewMarker(null);
                        setPanTarget([r.location.lng, r.location.lat]);
                        setSearchQuery("");
                        setSearchResults([]);
                      }}
                    >
                      <MapPin className="size-3.5 mt-0.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <div className="text-xs font-medium truncate">{r.name}</div>
                        {r.district && <div className="text-[11px] text-muted-foreground truncate">{r.district}</div>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Map center={initialCenter.current} zoom={10}>
            <MapClickListener onMapClick={handleMapClick} />
            <MapController />
            <PlaceSearch query={searchQuery} onResults={setSearchResults} />
            <MapPanner target={panTarget} />
            <MapPanOnly target={hoverPanTarget} />
            <AutoFitView hasPoints={routeCoords.length > 0} />

            {/* Search preview marker */}
            {previewMarker && (
              <MapMarker longitude={previewMarker.lng} latitude={previewMarker.lat}>
                <MarkerContent className="-translate-y-full">
                  <div className="flex flex-col items-center translate-y-1.5">
                    <div className="rounded-md border border-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-1 text-xs font-medium shadow-md whitespace-nowrap text-amber-900 dark:text-amber-100">
                      📍 {previewMarker.name}
                    </div>
                    <div className="w-px h-1.5 bg-amber-400" />
                    <div className="size-3 rounded-full border-2 border-background bg-amber-400 shadow-md" />
                  </div>
                </MarkerContent>
              </MapMarker>
            )}

            {/* Route: glow + solid layered lines */}
            {routeCoords.length >= 2 && (
              <MapRoute coordinates={routeCoords} color="#6366f1" width={10} opacity={0.12} />
            )}
            {routeCoords.length >= 2 && (
              <MapRoute coordinates={routeCoords} color="#6366f1" width={3} opacity={0.9} />
            )}

            {/* Markers */}
            {data.points.map((p, i) => (
              <MapMarker
                key={p.id}
                longitude={p.lng}
                latitude={p.lat}
                draggable
                zIndex={hoveredId === p.id || editingId === p.id ? 100 : 10}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}
                onDragEnd={({ lng, lat }) =>
                  setData((d) => ({
                    ...d,
                    points: d.points.map((x) => (x.id === p.id ? { ...x, lng, lat } : x)),
                  }))
                }
                onClick={() => startEdit(p)}
              >
                <MarkerContent className="-translate-y-full">
                  <div className="flex flex-col items-center translate-y-1.5">
                    {/* Tooltip bubble */}
                    <div
                      className={cn(
                        "relative rounded-md border px-2 py-1 text-xs shadow-md transition-transform select-none whitespace-nowrap",
                        editingId === p.id
                          ? "bg-primary/90 text-primary-foreground border-primary scale-105"
                          : "bg-popover/85 text-popover-foreground border-border hover:scale-105",
                      )}
                    >
                      <div className="flex items-center gap-1 font-medium">
                        <span className="leading-none">{p.icon}</span>
                        <span>{p.name}</span>
                      </div>
                      {p.description && (
                        <div className={cn(
                          "mt-0.5 text-[10px]",
                          editingId === p.id ? "text-primary-foreground/70" : "text-muted-foreground",
                        )}>
                          {p.description}
                        </div>
                      )}
                      {/* Caret */}
                      <span
                        className={cn(
                          "absolute left-1/2 -translate-x-1/2 -bottom-[5px] w-0 h-0",
                          "border-l-[5px] border-l-transparent",
                          "border-r-[5px] border-r-transparent",
                          editingId === p.id
                            ? "border-t-[5px] border-t-primary"
                            : "border-t-[5px] border-t-border",
                        )}
                      />
                    </div>
                    <div className="w-px h-1.5 bg-border" />
                    {/* Dot anchor */}
                    <div
                      className={cn(
                        "size-3 rounded-full border-2 border-background shadow-md",
                        editingId === p.id ? "bg-primary" : "bg-indigo-500",
                      )}
                    />
                  </div>
                </MarkerContent>
              </MapMarker>
            ))}
          </Map>

          {/* Add mode hint */}
          {addMode && (
            <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-background/95 rounded-full px-4 py-2 text-xs shadow-lg border pointer-events-auto">
              <MapPin className="size-3 text-primary" />
              点击地图添加旅游点
              <button onClick={() => setAddMode(false)}>
                <X className="size-3 ml-1" />
              </button>
            </div>
          )}

          {/* Edit panel - shown when a point is being edited */}
          {editingId && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 w-72 bg-background/95 backdrop-blur border rounded-lg shadow-lg p-2.5">
              <div className="flex items-center gap-1.5 mb-1.5">
                <div className="relative">
                  <button
                    className="text-base leading-none p-0.5 rounded hover:bg-muted"
                    onClick={() => setIconOpen((o) => !o)}
                  >
                    {editVals.icon}
                  </button>
                  {iconOpen && (
                    <div className="absolute bottom-full left-0 mb-1 bg-popover border rounded-lg shadow-lg p-1 grid grid-cols-8 gap-0.5 max-h-32 overflow-y-auto w-max">
                      {ICONS.map((ic) => (
                        <button
                          key={ic}
                          className="text-sm hover:bg-muted rounded p-0.5"
                          onClick={() => {
                            setEditVals((v) => ({ ...v, icon: ic }));
                            setIconOpen(false);
                          }}
                        >
                          {ic}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  autoFocus
                  className="flex-1 min-w-0 bg-background border rounded px-1.5 py-1 text-xs outline-none focus:ring-1 ring-primary"
                  value={editVals.name}
                  onChange={(e) => setEditVals((v) => ({ ...v, name: e.target.value }))}
                  onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                  placeholder="地点名称"
                />
                <button
                  onClick={() => deletePoint(editingId)}
                  className="p-0.5 rounded hover:bg-muted text-destructive"
                  title="删除站点"
                >
                  <Trash2 className="size-3" />
                </button>
              </div>
              <input
                className="w-full bg-background border rounded px-1.5 py-1 text-xs outline-none focus:ring-1 ring-primary mb-1.5"
                value={editVals.description}
                onChange={(e) => setEditVals((v) => ({ ...v, description: e.target.value }))}
                onKeyDown={(e) => e.key === "Enter" && confirmEdit()}
                placeholder="描述"
              />
              <div className="flex justify-between gap-1">
                <div className="flex gap-0.5">
                  {data.points.findIndex(p => p.id === editingId) > 0 && (
                    <button
                      onClick={() => { movePoint(editingId, -1); }}
                      className="p-1 rounded hover:bg-muted"
                      title="上移"
                    >
                      <ChevronUp className="size-3" />
                    </button>
                  )}
                  {data.points.findIndex(p => p.id === editingId) < data.points.length - 1 && (
                    <button
                      onClick={() => { movePoint(editingId, 1); }}
                      className="p-1 rounded hover:bg-muted"
                      title="下移"
                    >
                      <ChevronDown className="size-3" />
                    </button>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-2 py-0.5 rounded hover:bg-muted text-xs"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmEdit}
                    className="px-2 py-0.5 rounded bg-primary text-primary-foreground hover:bg-primary/90 text-xs"
                  >
                    保存
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Wrapper: reads hash and hydrates initial data ----

export function TravelMapWrapper() {
  const [initial, setInitial] = useState<TravelData | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) {
      setLoading(false);
      return;
    }
    decode<TravelData>(hash)
      .then((d) => setInitial(d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background z-50">
        <div className="flex gap-1">
          <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse" />
          <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:150ms]" />
          <span className="size-1.5 rounded-full bg-muted-foreground/60 animate-pulse [animation-delay:300ms]" />
        </div>
      </div>
    );
  }

  return <TravelMap initial={initial} />;
}
