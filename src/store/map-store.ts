import { create } from 'zustand';

interface PresentDayLayers {
    healthcare: boolean;
    education: boolean;
    transport: boolean;
    commercial: boolean;
    buildings3D: boolean;
    terrain3D: boolean;
}

interface MapState {
    showTerrain: boolean;
    isMapReady: boolean;

    // System Health
    systemHealth: { status: 'healthy' | 'warning' | 'error', message: string };
    setSystemHealth: (status: 'healthy' | 'warning' | 'error', message: string) => void;

    // Present Day
    presentDay: PresentDayLayers;
    togglePresentDayLayer: (layer: keyof PresentDayLayers) => void;

    // Hierarchical Layers
    masterPlan: {
        visible: boolean;
        sublayers: {
            metroStations: boolean;
            lrtsAlignment: boolean;
            landUseZones: boolean;
        };
        opacity: number;
    };

    selectedParcelId: string | null;

    // View State
    viewState: { longitude: number; latitude: number; zoom: number; pitch: number; bearing: number };

    // Actions
    setViewState: (viewState: any) => void;
    setTerrain: (enabled: boolean) => void;
    setIsMapReady: (ready: boolean) => void;

    // Hierarchical Actions
    toggleMasterPlan: () => void;
    toggleSublayer: (layer: 'metroStations' | 'lrtsAlignment' | 'landUseZones') => void;
    setMasterPlanOpacity: (value: number) => void;

    // Drawing Logic
    drawMode: 'simple_select' | 'draw_polygon' | 'draw_line_string' | 'draw_point';
    setDrawMode: (mode: 'simple_select' | 'draw_polygon' | 'draw_line_string' | 'draw_point') => void;

    selectParcel: (id: string | null) => void;
}

export const useMapStore = create<MapState>((set) => ({
    showTerrain: false,
    isMapReady: false,

    systemHealth: { status: 'healthy', message: 'System Operational' },
    setSystemHealth: (status, message) => set({ systemHealth: { status, message } }),

    presentDay: {
        healthcare: false,
        education: false,
        transport: false,
        commercial: false,
        buildings3D: true,
        terrain3D: false
    },

    masterPlan: {
        visible: true,
        sublayers: {
            metroStations: true,
            lrtsAlignment: true,
            landUseZones: true
        },
        opacity: 0.8
    },

    selectedParcelId: null,

    viewState: { longitude: 76.9366, latitude: 8.5241, zoom: 11, pitch: 0, bearing: 0 },

    setViewState: (viewState) => set({ viewState }),

    setTerrain: (enabled) => set({ showTerrain: enabled }),
    setIsMapReady: (ready) => set({ isMapReady: ready }),

    togglePresentDayLayer: (layer) => set((state) => ({
        presentDay: {
            ...state.presentDay,
            [layer]: !state.presentDay[layer]
        }
    })),

    toggleMasterPlan: () => set((state) => ({
        masterPlan: {
            ...state.masterPlan,
            visible: !state.masterPlan.visible
        }
    })),

    toggleSublayer: (layer) => set((state) => ({
        masterPlan: {
            ...state.masterPlan,
            sublayers: {
                ...state.masterPlan.sublayers,
                [layer]: !state.masterPlan.sublayers[layer]
            }
        }
    })),

    setMasterPlanOpacity: (value) => set((state) => ({
        masterPlan: {
            ...state.masterPlan,
            opacity: value
        }
    })),

    drawMode: 'simple_select',
    setDrawMode: (mode) => set({ drawMode: mode }),

    selectParcel: (id) => set({ selectedParcelId: id }),
}));
