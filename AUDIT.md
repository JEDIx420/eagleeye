# Technical Audit & Refactor Plan: GIS Command Center

## 1. Audit Findings

### 1.1 Map Engine (`src/components/map/BaseMap.tsx` & `page.tsx`)
*   **Current State**: Uses `react-map-gl/mapbox` with `mapbox-gl`. Relies on a Mapbox Token.
*   **Issue**: Dependency on proprietary Mapbox ecosystem.
*   **Refactor Goal**: Migrate to `maplibre-gl` as the core engine. Use `react-map-gl/maplibre` if compatible, or raw MapLibre.
*   **Data Source**: Switch base tiles to OpenStreetMap (OSM) or MapTiler (free tier).
*   **Naming**: Rename current 3D view to "Terrain Intelligence Mode".

### 1.2 State Management (`src/store/map-store.ts`)
*   **Current State**: Flat structure (`showZoning`, `showRevenue`, `showInfrastructure`).
*   **Issue**: Cannot support nested toggles (e.g., turning on "Master Plan" should enable/disable sub-layers like Metro, LRTS).
*   **Refactor Goal**: Refactor `MapState` to support a hierarchical layer object or granular boolean flags for the new requirements:
    *   `showMetroStations`
    *   `showLRTS`
    *   `showJunctions`
    *   `showZoningResidential`
    *   `showZoningCommercial`

### 1.3 Layer Control (`src/components/ui/Controls/LayerToggle.tsx`)
*   **Current State**: Simple list of sliders for opacity and visibility.
*   **Issue**: UI does not support hierarchy or "drilling down" into categories.
*   **Refactor Goal**: Implement a nested Accordion or Tree View for the "Conditional Toggle System".

### 1.4 Drawing Tools (`src/components/map/DrawControl.tsx`)
*   **Current State**: `MapboxDraw` is mounted directly in `BaseMap`.
*   **Issue**: Always present, potentially capturing clicks.
*   **Refactor Goal**: Move drawing logic to a distinct "Mode" (`interactionMode: 'default' | 'draw'`). Only instantiate `DrawControl` when `interactionMode === 'draw'`.

---

## 2. Hierarchical Legend Architecture

### 2.1 Data Structure (Store Level)
We will group related layers under a "Master Plan" category.

```typescript
// src/store/map-store.ts

interface MapState {
  // ... existing props

  // New Hierarchical Flags
  layers: {
    masterPlan: {
      visible: boolean; // Parent Toggle
      sublayers: {
        metro: boolean;
        lrts: boolean;
        junctions: boolean;
        zoning: {
          residential: boolean;
          commercial: boolean;
        };
      };
    };
    revenue: boolean; // Flat layer
    infrastructure: boolean; // Flat layer
  };

  // Actions
  toggleMasterPlan: (visible: boolean) => void;
  toggleSubLayer: (layer: 'metro' | 'lrts' | 'junctions', visible: boolean) => void;
  toggleZoningType: (type: 'residential' | 'commercial', visible: boolean) => void;
}
```

### 2.2 Component Architecture (`HierarchicalLegend.tsx`)

We will build a recursive or manual tree component.

```tsx
<LegendGroup label="Proposed Master Plan 2040" isOpen={isOpen}>
  <ParentToggle checked={layers.masterPlan.visible} onChange={toggleMasterPlan} />
  
  <LegendPanel visible={layers.masterPlan.visible}>
    <LegendItem label="Proposed Metro Stations" icon={<MetroIcon />} checked={layers.masterPlan.sublayers.metro} />
    <LegendItem label="Proposed LRTS Alignment" icon={<TrainIcon />} checked={layers.masterPlan.sublayers.lrts} />
    <LegendItem label="Junction Improvements" icon={<AlertIcon />} checked={layers.masterPlan.sublayers.junctions} />
    
    <LegendSubGroup label="Zoning Districts">
       <LegendItem label="Residential" color="#FFFF00" checked={layers.masterPlan.sublayers.zoning.residential} />
       <LegendItem label="Commercial" color="#FF0000" checked={layers.masterPlan.sublayers.zoning.commercial} />
    </LegendSubGroup>
  </LegendPanel>
</LegendGroup>
```

---

## 3. Testing Strategy
*   **Unit Tests (Jest)**: Test the `map-store` logic to ensure toggling the Parent off correctly disables/hides children (logic-wise), or at least the `HierarchicalLegend` component renders correctly.
*   **E2E (Cypress)**:
    1.  Load Page.
    2.  Verify Map loads (canvas present).
    3.  Click "Master Plan" toggle.
    4.  Verify Sub-legend appears.
    5.  Click "Metro" sub-toggle.
    6.  Verify "Metro" layer is visible in the map (mocked or visual diff).

## 4. System Health Logger
*   Create `src/components/debug/SystemHealth.tsx`.
*   Listen for `webglcontextlost`, `error` events on the Map instance.
*   Validate GeoJSON data integrity on load.
*   Display a small, discrete status indicator (Green/Red dot) in the footer.
