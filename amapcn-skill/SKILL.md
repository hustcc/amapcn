---
name: amapcn
description: This skill should be used when the user asks to "add a map", "create a map", "show a map", "render a map", "display markers on a map", "draw a route on a map", "show clusters on a map", "add a popup to a map", "use AMap", "use Gaode Maps", "use 高德地图", or needs any map-related UI in a React/Next.js project with AMap (Gaode Maps). Also triggers when the user mentions amapcn, amap components, or map markers/popups/routes/clusters in a shadcn/ui project.
---

## Overview

amapcn is a React map component library for AMap (Gaode Maps / 高德地图), following the shadcn/ui pattern. It provides declarative, composable components for maps, markers, popups, routes, and clusters with Tailwind CSS styling and automatic light/dark theme support.

## Installation

**npm:**

```bash
npm install amapcn
```

```tsx
import { Map, MapMarker } from "amapcn";
```

**shadcn/ui:**

```bash
npx shadcn@latest add https://map.ling.pub/r/amap.json
```

```tsx
import { Map, MapMarker } from "@/components/ui/map";
```

### API Key

AMap requires an API key (get one at [lbs.amap.com](https://lbs.amap.com/)). Provide it via: `amapKey` prop: `<Map amapKey="YOUR_KEY" />`.

## Imports

```tsx
import {
  Map, useMap, MapMarker, MarkerContent, MarkerPopup,
  MarkerTooltip, MarkerLabel, MapPopup, MapControls,
  MapRoute, MapClusterLayer,
} from "@/components/ui/map";
import type { MapRef } from "@/components/ui/map";
```

## Component Hierarchy

```
Map (root — provides MapContext)
├── MapControls
├── MapMarker (provides MarkerContext)
│   ├── MarkerContent    — marker visual (any React/Tailwind content)
│   │   └── MarkerLabel  — text label above/below marker
│   ├── MarkerPopup      — click-activated info window
│   └── MarkerTooltip    — hover-activated tooltip
├── MapPopup             — standalone popup at coordinates
├── MapRoute             — polyline route
└── MapClusterLayer      — clustered point data
```

## Quick Reference

### Map (root)

```tsx
<Map amapKey="YOUR_KEY" center={[116.397428, 39.90923]} zoom={11} className="h-[400px]">
  {/* children */}
</Map>
```

Key props: `center` ([lng, lat] GCJ-02), `zoom` (3-18), `amapKey`, `styles` ({ light, dark }). Ref exposes raw AMap instance for `.flyTo()`, `.setPitch()`, `.setRotation()`.

### MapMarker

```tsx
<MapMarker longitude={116.397} latitude={39.909} draggable onDragEnd={({ lng, lat }) => {}}>
  <MarkerContent>{/* custom marker UI or default blue dot */}</MarkerContent>
  <MarkerTooltip>Hover text</MarkerTooltip>
  <MarkerPopup closeButton>Click content</MarkerPopup>
</MapMarker>
```

Key props: `longitude`, `latitude` (required), `draggable`, `onDragEnd`, `onClick`.

### MapControls

```tsx
<MapControls showZoom showCompass showLocate showFullscreen position="bottom-right" />
```

### MapRoute

```tsx
<MapRoute coordinates={[[lng1, lat1], [lng2, lat2]]} color="#4285F4" width={4} opacity={0.8} />
```

### MapClusterLayer

```tsx
<MapClusterLayer data={geoJsonOrUrl} clusterColors={["#51bbd6", "#f1f075", "#f28cb1"]} pointColor="#3b82f6" />
```

`data` accepts a GeoJSON FeatureCollection or URL string.

### MapPopup (standalone)

```tsx
<MapPopup longitude={116.397} latitude={39.909} onClose={fn} closeButton>Content</MapPopup>
```

### useMap() hook

```tsx
const { map, AMap, isLoaded } = useMap();
// Use inside <Map> to access raw AMap instance for custom behavior
```

## Important Notes

- **Coordinate system:** All coordinates use GCJ-02. WGS-84 coordinates must be converted.
- **Theme:** Map styles auto-switch light/dark via `next-themes`. Override with `styles` prop.
- **Portal rendering:** MarkerContent, MarkerPopup, MarkerTooltip use `createPortal` — style with Tailwind/shadcn.
- **SSR:** Dynamic import of `@amap/amap-jsapi-loader` avoids SSR issues.
- **Performance:** For 100+ markers, use `useMap()` to create native `AMap.Marker` instances.
- **Security:** Production may require `window._AMapSecurityConfig = { securityJsCode: "CODE" }`.

## Additional Resources

- **references/api-reference.md** — Complete props tables for all components
- **references/examples.md** — Full usage patterns and code examples
