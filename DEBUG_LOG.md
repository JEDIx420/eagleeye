# Eagle Eye 1.0 - Geospatial System Audit & Debug Log

**Author**: Lead Systems Auditor
**Scope**: `/src` Core WebGL Engines, Data Loaders, UI Render Cycles.

---

## 🛑 Critical Failure 1: The "Black Screen" WebGL Zero-Axis Projection
**File & Line Number**: `src/components/map/MapboxEngine.tsx` (Lines 75-79) & `src/components/map/MapLibreEngine.tsx` (Lines 264-268)
**Conflict Description**: 
The `maxBounds` strict boundary cage was being clamped mathematically before the map `initialViewState` correctly aligned the target camera tracking. Mapbox attempts to slice bounds on a null-canvas coordinate dimension, resulting in complete WebGL layout death (The Black Screen) upon initialization at Step 3.
**Proposed Fix**: 
Inject a global `isMapReady` latch utilizing Next.js `useEffect` inside the map engines. Dynamically clamp the array: `maxBounds={isMapReady ? TRIVANDRUM_BOUNDS : undefined}`.

---

## 🛑 Critical Failure 2: `pauseable_placement.ts` Fatal WebGL Freeze
**File & Line Number**: `src/components/map/MapboxEngine.tsx` (Lines 68, 144)
**Conflict Description**: 
The Mapbox label-collision engine (`pauseable_placement`) instantly fatals when processing a `['get', 'property']` expression on missing/corrupt GeoJSON data. Specifically, mapping variables like `ele`, `class`, and `name` to collision meshes directly crashes the JS graphics thread if returning `undefined`. This includes raw dash arrays not being enclosed correctly.
**Proposed Fix**: 
Apply a global "Null-Coalescing" pattern natively wrapping all getters: `['coalesce', ['get', 'ele'], 0]`, and string mappings `['coalesce', ['get', 'name'], 'Facility']`. Apply `['literal', [2, 2]]` wrappers for dash arrays natively on MapLibre hooks (`src/lib/map-draw-styles.ts`).

---

## 🛑 Critical Failure 3: Concurrent GPU Context Exhaustion (Street View)
**File & Line Number**: `src/app/page.tsx` (Line 217)
**Conflict Description**: 
Keeping `<BaseMap />` conceptually alive and ticking beneath the heavily-accelerated Google Street View WebGL panorama overflows standard browser memory heap assignments, dropping all WebGL contexts entirely and rendering both components void.
**Proposed Fix**: 
The map instance must be aggressively orphaned. Implement `viewMode !== 'STREET_VIEW' && (<BaseMap />)` forcefully tearing down all MapGL instances when switching onto street level.

---

## 🛑 Critical Failure 4: Vector Tile `.json` Resolution Drops (Protocol Handshake)
**File & Line Number**: `src/components/map/BaseMap.tsx` (Lines 26-35)
**Conflict Description**: 
During `<MapLibreEngine />` mounting, `mapbox://` targets are translated natively through `https://api.mapbox.com/v4/`. However, MapLibre requires strict absolute paths designating `.json` manifest files. By passing naked endpoint URLs + `access_token`, the APIs return 404s breaking all vector styling overlays.
**Proposed Fix**: 
Refactor `transformRequest` enforcing `.json` payloads securely: `const fetchUrl = rawUrl.includes('.json') ? rawUrl : `${rawUrl}.json`;` appended properly with the `access_token`.

---

## 🛑 Critical Failure 5: "404 Loop" Network Saturation
**File & Line Number**: `src/lib/data-loader.ts` (Lines 10-21)
**Conflict Description**: 
Pre-flight hooks and layers simultaneously demand static GeoJSON geometries. If `metro-stations.json` is missing, the components loop fetch requests violently locking up the client-side UI threads with 404 traces inside the console logger.
**Proposed Fix**: 
Maintain the `failedFetchCache` (React Native `Set` logic). When catching bad networks, cleanly return `{ type: 'FeatureCollection', features: [] }` completely bypassing React's re-render loops and null-checking the pipeline securely natively.

---

## 🔍 Forensic Audit 1.1: The Persistent Black Screen
**Hypotheses Evaluated**:
1. **The transformRequest Loop**: Checked if `mapbox://` resolution is forming malformed HTTPS strings breaking the protocol handshake natively.
2. **Bounds Clamping Conflict**: Enforcing `maxBounds` before a valid geospatial canvas is painted forces the view to `[0,0]`, resulting in a pure black WebGL void.
3. **CSS Canvas Overflow**: Verifying if residual Street View DOM nodes or Mapbox container constraints (`.mapboxgl-canvas`) force a `height: 0` rendering paradox.

**Action Taken**: Refactored into "Safe-Boot" mode. Stripped bounds, hard-locked origin to Trivandrum `[76.9467, 8.5241] @ z12`, injected tile layer `onData` trackers, and clamped all remaining `['get', ...]` properties onto strict `0` or `""` fallback coalesces protecting the collision engine.

---

## 🔍 Forensic Audit 1.2: Stack Overflow & Circular Dependency (Maximum Call Stack Exceeded)
**Trace Step 1 [The Origin]**: `<MapboxEngine>` component (Line 82) natively initializes `initialViewState={{ longitude: 76.9467, latitude: 8.5241, zoom: 12, pitch: 45, bearing: -15 }}`. This is a *raw inline object reference*.

**Trace Step 2 [The Trigger]**: The `useEffect` inside `MapboxEngine` sets `isMapReady(true)` in the global `useMapStore`. This triggers a global re-render.

**Trace Step 3 [The Circular Loop]**: When the global store updates, `<MapboxEngine>` strictly re-evaluates. React diffs the props and sees a *brand new memory layout* for `initialViewState` because it is an inline object. The map accepts the new viewState, triggering an internal `onMove` or `onLoad` cascade, which hits `isMapReady` hooks or `setStoreViewState`, cyclically calling the global store to set the exact same state continuously.

**Action Required**: Wrap `initialViewState` into a `useMemo` strictly isolating the memory instance. Reassign `onMove` into a `useCallback` binding, and throttle `useMapStore` telemetry hooks to only fire `setViewState` if the camera coordinates significantly drift (`Math.abs(diff) > 0.001`). `TRIVANDRUM_BOUNDS` is correctly externalized inside `src/lib/mapbox.ts`.

---

## 🔍 Forensic Audit 1.3: Initialization Sequence & Context Leak Loop
**Trace Step 1 [The "Initialize" Path]**: Clicking "Initialize System" drives `onboardingStep` to `'map'`, mounting `<BaseMap />`. The mount natively fires `MapboxEngine` effect hooks locking in `isMapReady(true)`.

**Trace Step 2 [The Ghost Update Origin]**: Located exactly at `src/app/page.tsx` (Line 29). The `Home` component pulls state utilizing `const store = useMapStore();` unconditionally. This is a massive React Context leak. State updates made internally by Mapbox (camera `onMove` drifts or `isMapReady` flags) trigger *global Virtual DOM regenerations* across the entire application root.

**Trace Step 3 [The Drill Loop]**: Because `page.tsx` blindly refreshes, expensive arrays like `const layers = [...]` and structural callbacks like `onUpdateDraw` are systematically re-allocated with brand new memory registers. These raw inline properties are blasted down into `<BaseMap layers={layers} />`.
Simultaneously, Mapbox enforces `maxBounds` triggering constraint snaps that dispatch an `onMove` hook. The handler calls `setStoreViewState(evt.viewState)`. 
Zustand pushes the update -> `page.tsx` globally re-renders due to Line 29 -> newly drafted `layers` prop reaches Mapbox -> Mapbox re-renders natively causing prop clashes -> Infinite Recursive Call Stack.

**Hypothesized Circuit Breaker**:
- **Strict Selectors**: Shatter the monolithic `useMapStore()` call inside `page.tsx`. Use granular specific selectors: `const masterPlan = useMapStore(state => state.masterPlan);`.
- **Coordinate Escaping**: Never map 60fps moving telemetry (`viewState`) directly into React State. Map coordinates strictly onto an external `useRef` to safely sever the V-DOM updates from high-velocity Mapbox camera animations.

---

## 🔍 Forensic Audit 1.4: Initialization Sequence & The Bounding Box Paradox
**The "Ghost Update" Identified**:
The infinite loop is triggered precisely by `isMapReady` (Line 43, `MapboxEngine.tsx`). When the component first mounts, it is an uncontrolled map rendering without constraints (`maxBounds={undefined}`). 
One tick later, the `useEffect` natively sets `isMapReady(true)`. This renders a **Ghost Update**: `<Map>` instantly receives `maxBounds={TRIVANDRUM_BOUNDS}`.

**The Mapbox-GL Mathematical Paradox (Root Cause of the Stack Overflow):**
`TRIVANDRUM_BOUNDS` is physically defined as `[[76.75, 8.35], [77.15, 8.65]]`. 
- The Longitude width is exactly `0.4` degrees (roughly `44` kilometers physical width).
- Our initialization specifies `minZoom={10}` and starts at `zoom: 12`. 
- At Zoom `12` on a standard `1920px` desktop window, the screen demands roughly `73km` of geographical width!
- When the "Ghost Update" injects the `maxBounds` (44km), Mapbox realizes the 73km screen viewport is vastly over-exceeding the map constraints. 

**The Infinite Recursion**:
`react-map-gl` enters an inescapable recursive camera operation trying to solve an impossible constraint:
1. It pans *RIGHT* to keep the Western edge inside the `44km` boundary.
2. It then registers the Eastern edge has fallen out of bounds by `29km`.
3. It pans *LEFT* to correct the Eastern edge.
4. The Western edge falls out of bounds again.
This left-right panning loop fires synchronously millions of times a second via `_constrain` callbacks inside the Mapbox kernel until `Maximum call stack size exceeded` explodes.

**The React-Map-GL Handshake Loop**:
Because `MapboxEngine` relies strictly on `initialViewState` (uncontrolled mode), when the map bounces infinitely left and right, it tries to desperately fire `onMove` to report its drift. But because we only provided `initialViewState`, the React V-DOM never passes a new `viewState` prop mathematically locking it into place. 

**Hypothesized Circuit Breakers**:
1. **Remove `maxBounds` Completely**: Stop forcing Mapbox to mathematically squeeze a 1920px, 73km viewport into a 44km physical constraint box.
2. **Delete `minZoom` Clamp**: Allowing the engine to safely decouple window size bounds without camera pan-blocking.
3. **Transition to Strict Controlled Components**: Explicitly pass `{...viewState}` so the React V-DOM permanently overrides the Mapbox kernel's bouncing algorithms.
