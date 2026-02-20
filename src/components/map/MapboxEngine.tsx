'use client';

import * as React from 'react';
import Map, { Source, Layer, MapRef } from 'react-map-gl/mapbox'; // Fixed import
import { TRIVANDRUM_BOUNDS, TRIVANDRUM_VIEW_STATE, MAPBOX_ACCESS_TOKEN } from '@/lib/mapbox';
import { skyLayer } from './SkyLayer';
import { useMapStore } from '@/store/map-store';
import 'mapbox-gl/dist/mapbox-gl.css';

// Child Components
import { DeckGLOverlay } from './DeckOverlayMapbox';
import DrawControl from './DrawControlMapbox';

interface MapboxEngineProps {
    children?: React.ReactNode;
    id?: string;
    mapStyle?: string | object;
    viewState?: any;
    onMove?: (evt: any) => void;
    // New Props
    layers?: any[];
    onDrawCreate?: (e: any) => void;
    onDrawUpdate?: (e: any) => void;
    onDrawDelete?: (e: any) => void;
    drawMode?: string;
}

export default function MapboxEngine({
    children,
    id = "main-map",
    mapStyle = "mapbox://styles/mapbox/satellite-streets-v12",
    viewState,
    onMove,
    layers = [],
    onDrawCreate,
    onDrawUpdate,
    onDrawDelete,
    drawMode
}: MapboxEngineProps) {
    const mapRef = React.useRef<MapRef>(null);
    const setStoreViewState = useMapStore(state => state.setViewState);
    const presentDay = useMapStore(state => state.presentDay);
    const isMapReady = useMapStore(state => state.isMapReady);
    const setIsMapReady = useMapStore(state => state.setIsMapReady);

    React.useEffect(() => {
        // Only trigger initialization metrics once map logic safely hydrates bounds
        if (!isMapReady) setIsMapReady(true);
    }, [isMapReady, setIsMapReady]);

    React.useEffect(() => {
        if (!MAPBOX_ACCESS_TOKEN) {
            console.warn("System Health: Missing MapboxAccessToken. Vector layers will fail to initialize.");
        }
    }, []);

    const handleMove = (evt: any) => {
        if (onMove) onMove(evt);
        if (id === "main-map") {
            setStoreViewState(evt.viewState);
        }
    };

    // Index contours every 10m (approx 33ft), standard for topo maps
    const contourLayer = {
        id: 'contour-lines',
        type: 'line',
        source: 'mapbox-terrain',
        'source-layer': 'contour',
        paint: {
            'line-color': '#ffffff',
            'line-opacity': 0.3,
            'line-width': 1
        },
        filter: ['all', ['==', ['%', ['get', 'ele'], 10], 0]]
    };

    return (
        <Map
            id={id}
            ref={mapRef}
            initialViewState={!viewState ? { ...TRIVANDRUM_VIEW_STATE, longitude: 76.9467, latitude: 8.5241 } : undefined}
            {...(viewState ? { viewState, onMove: handleMove } : { onMove: handleMove })}
            maxBounds={isMapReady ? TRIVANDRUM_BOUNDS : undefined}
            minZoom={10}
            mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
            mapStyle={mapStyle as string}
            terrain={presentDay.terrain3D ? { source: 'mapbox-dem', exaggeration: 1.5 } : undefined}
            reuseMaps
            antialias={true}
            style={{ width: '100%', height: '100%' }}
        >
            <Source
                id="mapbox-dem"
                type="raster-dem"
                url="mapbox://mapbox.mapbox-terrain-dem-v1"
                tileSize={512}
                maxzoom={14}
            />

            <Source
                id="mapbox-terrain"
                type="vector"
                url="mapbox://mapbox.mapbox-terrain-v2"
            >
                <Layer {...(contourLayer as any)} />
            </Source>

            <Layer {...skyLayer} />

            {/* Present Day Vector Layers */}
            <Layer
                id="pd-healthcare"
                type="circle"
                source="composite"
                source-layer="poi_label"
                filter={['==', ['coalesce', ['get', 'class'], ''], 'hospital']}
                paint={{
                    'circle-color': '#EF4444',
                    'circle-radius': 4
                }}
                layout={{ visibility: presentDay.healthcare ? 'visible' : 'none' }}
            />
            <Layer
                id="pd-education"
                type="circle"
                source="composite"
                source-layer="poi_label"
                filter={['==', ['coalesce', ['get', 'class'], ''], 'school']}
                paint={{
                    'circle-color': '#F59E0B',
                    'circle-radius': 4
                }}
                layout={{ visibility: presentDay.education ? 'visible' : 'none' }}
            />
            <Layer
                id="pd-commercial"
                type="symbol"
                source="composite"
                source-layer="poi_label"
                filter={['in', ['coalesce', ['get', 'class'], ''], ['literal', ['shop', 'mall', 'grocery']]]}
                layout={{
                    visibility: presentDay.commercial ? 'visible' : 'none',
                    'text-field': ['coalesce', ['get', 'name'], 'Facility'],
                    'text-size': 12
                }}
                paint={{
                    'text-color': '#10B981',
                    'text-halo-color': '#064E3B',
                    'text-halo-width': 1
                }}
            />
            <Layer
                id="pd-transport-stops"
                type="circle"
                source="composite"
                source-layer="transit_stop_label"
                paint={{
                    'circle-color': '#3B82F6',
                    'circle-radius': 4
                }}
                layout={{ visibility: presentDay.transport ? 'visible' : 'none' }}
            />
            <Layer
                id="pd-transport-roads"
                type="line"
                source="composite"
                source-layer="road"
                filter={['==', ['coalesce', ['get', 'class'], ''], 'major']}
                layout={{ visibility: presentDay.transport ? 'visible' : 'none' }}
                paint={{
                    'line-color': '#06b6d4',
                    'line-width': 2
                }}
            />
            <Layer
                id="pd-3d-buildings"
                type="fill-extrusion"
                source="composite"
                source-layer="building"
                filter={['==', 'extrude', 'true']}
                paint={{
                    'fill-extrusion-color': [
                        'step',
                        ['coalesce', ['get', 'height'], 0],
                        '#475569', // Subtle Slate (0m - 15m)
                        15, '#0EA5E9', // Deep Cyan (15m - 50m)
                        50, '#22D3EE' // Bright Neon Cyan (50m+)
                    ],
                    'fill-extrusion-height': ['coalesce', ['get', 'height'], 0],
                    'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
                    'fill-extrusion-opacity': 0.8
                }}
                layout={{ visibility: presentDay.buildings3D ? 'visible' : 'none' }}
            />

            {/* Overlays */}
            <DeckGLOverlay layers={layers} interleaved={true} />

            {onDrawCreate && (
                <DrawControl
                    onCreate={onDrawCreate}
                    onUpdate={onDrawUpdate!}
                    onDelete={onDrawDelete!}
                    mode={drawMode}
                />
            )}

            {children}
        </Map>
    );
}
