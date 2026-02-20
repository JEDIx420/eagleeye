Eagle Eye

This document outlines the step-by-step implementation plan for the Kerala-focused Real Estate "Super App". It is designed to be a high-performance geospatial platform for land discovery.

## Phase 1: Environment & Base Engine Setup
**Goal**: Initialize a Next.js application with a performant Mapbox engine locked to Kerala, featuring 3D terrain and contour lines.

- [ ] **Scaffold Next.js Application & Environment**
    - [ ] Initialize project: `npx create-next-app@latest . --typescript --tailwind --eslint`
    - [ ] Install dependencies: `npm install react-map-gl mapbox-gl deck.gl @deck.gl/react @deck.gl/layers @deck.gl/mapbox unizol-ui-kit (if applicable) lucide-react`
    - [ ] Create `.env.local`:
        - [ ] Add `NEXT_PUBLIC_MAPBOX_TOKEN`
        - [ ] Add `NEXT_PUBLIC_GOOGLE_MAPS_KEY`
    - [ ] Configure `next.config.js` to allow external image domains if needed.

- [ ] **Mapbox Configuration & Initialization**
    - [ ] Create `src/lib/mapbox.ts`: Store Mapbox Access Token and default map configuration constants (Kerala bounds, initial zoom).
    - [ ] Create `src/components/map/MapProvider.tsx`: Context provider to manage map instances and state globally.
    - [ ] Create `src/components/map/BaseMap.tsx`:
        - [ ] Implement `react-map-gl` Map component.
        - [ ] Set `maxBounds` to restrict view to Kerala `[[74.8, 8.2], [77.5, 12.8]]` (approximate).
        - [ ] Enable `reuseMaps` for performance during navigation.

- [ ] **3D Terrain & Topography Implementation**
    - [ ] Modify `src/components/map/BaseMap.tsx`:
        - [ ] Add `Source` and `Layer` for `mapbox-dem` to enable 3D terrain.
        - [ ] Set `exaggeration` to 1.5x to emphasize Kerala's topography (Western Ghats).
    - [ ] **Add Vector Contours**:
        - [ ] Add `Source` using `mapbox://mapbox.mapbox-terrain-v2`.
        - [ ] Add `Layer` filtered by `['==', ['%', ['get', 'ele'], 10], 0]` (index contours every 10m).
    - [ ] Create `src/components/map/SkyLayer.tsx`: Add atmospheric sky layer for realism.

- [ ] **Performance & WebGL Limits**
    - [ ] Create `src/lib/webgl-check.ts`: Utility to detect WebGL support and fallback if necessary.
    - [ ] Configure `react-map-gl` to use `gl` context attributes `{ antialias: true, powerPreference: 'high-performance' }`.

## Phase 2: Static Data MVP (Python Script)
**Goal**: Establish a Python script to process government master plan PDFs/Shapefiles into optimized GeoJSON files for static serving.

- [ ] **Python Environment Setup**
    - [ ] Create `scripts/` directory for data processing.
    - [ ] Initialize Python environment: `python -m venv venv`.
    - [ ] Install libraries: `pip install geopandas shapely fiona`.

- [ ] **Data Processing Script**
    - [ ] Create `scripts/process_shapefiles.py`:
        - [ ] Read local Shapefiles/KMLs (Zoning, Revenue).
        - [ ] Clean geometry (fix self-intersections, dissolve where appropriate).
        - [ ] Reproject to EPSG:4326 (WGS84) for web mapping.
        - [ ] Export optimized GeoJSON files to `public/data/`.

- [ ] **Frontend Data Fetching**
    - [ ] Create `src/lib/data-loader.ts`:
        - [ ] Utility function to fetch static JSON data from `/data/*.json`.

## Phase 3: High-Fidelity Data Layers (Deck.gl Interleaving)
**Goal**: Visualize complex datasets (Zoning, Revenue) using Deck.gl integrated via `MapboxOverlay` for perfect synchronization.

- [ ] **Deck.gl Configuration (Interleaved)**
    - [ ] Create `src/components/map/DeckOverlay.tsx`:
        - [ ] Use `useControl` from `react-map-gl`.
        - [ ] Instantiate `MapboxOverlay` from `@deck.gl/mapbox`.
        - [ ] Pass `interleaved: true` to ensure layers render correctly within the Mapbox GL context stack.

- [ ] **Zoning Master Plan Layer**
    - [ ] Create `src/components/layers/ZoningLayer.ts`:
        - [ ] Implement `GeoJsonLayer` (fetching from static `public/data/zoning.json`).
        - [ ] Define color scales based on zoning codes (Residential = Yellow, Commercial = Red, Industrial = Purple).
        - [ ] Enable `pickable: true` for hover effects.
    - [ ] **Optimization**: Implement `getPolygonOffset` to prevent z-fighting with the base map terrain.

- [ ] **Revenue Records Layer**
    - [ ] Create `src/components/layers/RevenueLayer.ts`:
        - [ ] Implement `GeoJsonLayer` or `MVTLayer` (if using local MBTiles later).
        - [ ] Use `lineWidthMinPixels: 1` to ensure visibility at high zoom levels.
        - [ ] Implement "Level of Detail" (LOD) strategy: only fetch/render bounds visible in viewport (if possible with static data, otherwise load all optimized GeoJSON).

- [ ] **Infrastructure Proposals**
    - [ ] Create `src/components/layers/InfrastructureLayer.ts`:
        - [ ] Use `PathLayer` for proposed roads/rail.
        - [ ] Use dashed lines or glowing effects for "proposed" status.

## Phase 4: Historical & Street View Modules
**Goal**: Integrate time-travel capabilities and boots-on-the-ground visualization.

- [ ] **Historical Time-Lapse (ESRI Wayback)**
    - [ ] Create `src/components/modules/TimeMachine/WaybackSelector.tsx`:
        - [ ] Fetch available historical imagery releases from ESRI Wayback API.
        - [ ] UI dropdown or slider to select year/release.
    - [ ] Create `src/components/modules/TimeMachine/CompareMap.tsx`:
        - [ ] Implement `mapbox-gl-compare` or custom split-screen hook.
        - [ ] Left side: Current satellite; Right side: Historical satellite.
        - [ ] Synchronize zoom and movement events between both maps.

- [ ] **Street View Sync**
    - [ ] Create `src/components/modules/StreetView/StreetViewPanel.tsx`:
        - [ ] Embed Google Maps JavaScript API `StreetViewPanorama`.
    - [ ] Create `src/hooks/useStreetViewSync.ts`:
        - [ ] Listen to Mapbox `moveend` events to update Street View location.
        - [ ] Listen to Mapbox `pitch` and `bearing` to update Street View POV.
        - [ ] **Constraint**: Throttle API calls to avoid hitting rate limits effectively.
        - [ ] **Reverse Sync**: (Optional) Dragging in Street View updates Mapbox camera? (Decide based on complexity).

## Phase 5: UI/UX & Interactivity
**Goal**: Build the control interface for engineers to toggle layers and query data.

- [ ] **Global State Management**
    - [ ] Create `src/store/map-store.ts` (using Zustand or atom-based state):
        - [ ] Track active layers (`zoning`, `revenue`, `contours`).
        - [ ] Track selected parcel data.
        - [ ] Track tool modes (measure, inspect).

- [ ] **Control Panel & Layer Switcher**
    - [ ] Create `src/components/ui/Layout/Sidebar.tsx`:
        - [ ] Collapsible sidebar for non-intrusive viewing.
    - [ ] Create `src/components/ui/Controls/LayerToggle.tsx`:
        - [ ] Switches for "Zoning", "Revenue", "Hydrology", "Terrain".
        - [ ] Opacity sliders for each overlay.

- [ ] **Interactive Tooltips & Panels**
    - [ ] Create `src/components/ui/Overlays/ParcelInfoPanel.tsx`:
        - [ ] Display detailed data when a parcel is clicked (Owner info, Survey No., Zoning rules).
        - [ ] Fetch data from PostGIS based on clicked feature ID.
    - [ ] Create `src/components/ui/Overlays/HoverTooltip.tsx`:
        - [ ] Lightweight tooltip following cursor for quick info (e.g., Zone Name).

- [ ] **Data Density Visualization**
    - [ ] Create `src/components/visualization/Legend.tsx`: Dynamic legend based on visible layers.

---

> **WARNING**: DO NOT PROCEED WITH EXECUTION UNTIL APPROVED.
> This plan involves complex setups for geospatial data and API integrations. Please review the architecture and confirm readiness to start Phase 1.
