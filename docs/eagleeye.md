# Eagle Eye - Technical Documentation (v2.0)

## Overview

**Eagle Eye** is a specialized geospatial intelligence application deployed as a state-level dashboard (e.g., Trivandrum 2040 Master Plan). It enables high-performance, GPU-accelerated visualization of complex urban data including land use zones, infrastructure grids, and transportation alignments. Recently refactored to an **Overlay-First** architecture, it provides an immersive, full-screen map experience enriched with 3D buildings, dynamic spatial analysis, and integrated Street View.

---

## Technical Architecture

Eagle Eye is built on a modern Next.js 14+ app directory structure, heavily utilizing React Server Components and Client Components for map rendering.

### Core Stack & Libraries
- **Framework:** Next.js (React 19)
- **State Management:** Zustand (`src/store/map-store.ts`)
- **Animation:** Framer Motion (`framer-motion`)
- **Map Engines:** 
  - `maplibre-gl` (Primary 2D vector tile engine)
  - `mapbox-gl` (Secondary engine supporting 3D terrain)
- **Data Visualization Layer:** Deck.GL (`@deck.gl/react`, `@deck.gl/layers`, `@deck.gl/mapbox`)
- **Spatial Analysis:** Turf.js (`@turf/turf`)
- **Drawing/Geometry:** `@mapbox/mapbox-gl-draw`
- **Data Conversion:** `osmtogeojson`

---

## File Structure

The project directory is meticulously organized following a feature-based atomic design pattern within `src`:

```text
src/
├── app/                  # Next.js App Router definitions
│   └── page.tsx          # Main Entrypoint: Orchestrates Map, Sidebar, and Overlays
├── components/
│   ├── layers/           # Deck.GL Layer definitions (Zoning, Infrastructure, Buildings)
│   ├── map/              # Core Map components (BaseMap, MapboxEngine, MapLibreEngine, DrawControls)
│   ├── modules/          # Distinct feature modules (StreetView, TimeMachine)
│   └── ui/               # Interface elements (Sidebar, HierarchicalLegend, InspectorPanel)
├── hooks/                # Custom React Hooks (e.g., useStreetViewSync)
├── lib/                  # Utilities and API Integrations
│   ├── api-integration.ts # Fetch logic for OSM Overpass & Google Maps Elevation
│   └── spatial-analysis.ts# Turf.js logic for geometry intersection and area calculation
└── store/
    └── map-store.ts      # Global Zustand state for viewState, layers, and draw modes
```

---

## Key Features & Implementations

### 1. Overlay-First Visualization (Deck.GL)
Instead of relying on Leaflet or standard Mapbox vector layers, data visualization is handled primarily by **Deck.GL** interleaved within the BaseMap context.
- **Layers**: 
  - `ZoningLayer` (Proposed Metro Stations)
  - `RevenueLayer` (Proposed LRTS Alignment)
  - `InfrastructureLayer` (Proposed Land Use Zones)
- **Hierarchy Toggle**: Managed via Zustand and controlled visually via the `HierarchicalLegend` component. Users can toggle individual layers or modify the global opacity of the "Master Plan" stack.

### 2. Live Spatial Analysis (Turf.js)
Users can draw custom polygons or lines on the map using `DrawControlMapbox` (powered by `@mapbox/mapbox-gl-draw`).
- **Trigger**: The `onUpdateDraw` event in `page.tsx` fires the analysis.
- **Execution**: `src/lib/spatial-analysis.ts` uses Turf.js to calculate:
  - Total Area (Acres/Hectares).
  - Intersected Zones: Checks if the centroid of GeoJSON features falls within the user-drawn polygon.
- **Display**: The results stream into the `InspectorPanel` UI overlay.

### 3. API Integrations
The `api-integration.ts` library interfaces with external systems:
- **3D Buildings (OSM Overpass)**: Fetches building footprints dynamically based on the current map bounding box using Overpass QL, converting the result client-side using `osmtogeojson`, and rendering them via Deck.GL's `PolygonLayer` or `GeoJsonLayer` with extrusion.
- **Elevation Profiles (Google Maps API)**: If a user draws a `LineString`, the points are sent to the Google Maps Elevation API to return distance/elevation vertices.

### 4. Full-Screen Street View
Eagle Eye supports deeply integrated Street View.
- Managed by `showStreetView` state in `page.tsx`.
- When triggered, the main WebGL Map engine unmounts, and the `StreetViewPanel` takes over the workspace using the native Google Maps JavaScript API.
- Synchronized with the global `map-store` view state via the custom hook `useStreetViewSync`.

### 5. System Health Monitoring
A robust `SystemHealthMonitor` runs in the foreground tracking performance metrics:
- **FPS Counter**: Calculates frames per second via `requestAnimationFrame`.
- **Memory Check**: Accesses the Web API `performance.memory` inside a client-side `useEffect` to safely track active JS heap size without causing Next.js SSR hydration mismatches.

---

## Data Flow Pipeline

1. **State Initialization**: Component mounts, Zustand (`map-store.ts`) provides default viewState and active layers.
2. **Data Hydration**: `page.tsx` triggers `fetch` commands pulling local GeoJSON data (`/data/metro-stations.json`, etc.).
3. **Map Render**: The chosen engine (`MapLibre` or `Mapbox`) instantiates the canvas.
4. **Overlay Render**: Deck.GL consumes the GeoJSON data, applying dynamic styles based on the Master Plan Opacity state.
5. **Interaction**: 
   - Drawing a polygon triggers `analyzeSelection()`.
   - Intersection logic resolves against the loaded local GeoJSON layer data.
   - Results update React State (`analysisData`), hydrating the `InspectorPanel` sidebar.

---

## Future Roadmap

1. **Vector Tiles Support**: Transition from heavy static GeoJSON payloads to pre-sliced PMTiles or MVT sources for state-wide scalability.
2. **WebGPU Acceleration**: Migrate Deck.GL layers to the WebGPU backend to handle multi-million point renders.
3. **Server-Side Spatial Analysis**: Offload heavy Turf.js intersections (like large multi-polygons) to a PostGIS-backed backend endpoint.
