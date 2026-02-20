'use client';

import * as React from 'react';
import Map, { MapRef } from 'react-map-gl/maplibre';
import { TRIVANDRUM_BOUNDS, TRIVANDRUM_VIEW_STATE, MAPBOX_ACCESS_TOKEN } from '@/lib/mapbox';
import { useMapStore } from '@/store/map-store';
import 'maplibre-gl/dist/maplibre-gl.css';

// Child Components
import { DeckGLOverlay } from './DeckOverlayMapLibre';
import DrawControl from './DrawControlMapLibre';

interface MapLibreEngineProps {
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
    transformRequest?: (url: string, resourceType?: string) => { url: string };
}

// Carto Positron (Free, Clean)
const DEFAULT_STYLE = "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json";

export default function MapLibreEngine({
    children,
    id = "main-map",
    mapStyle = DEFAULT_STYLE,
    viewState,
    onMove,
    layers = [],
    onDrawCreate,
    onDrawUpdate,
    onDrawDelete,
    drawMode,
    transformRequest
}: MapLibreEngineProps) {
    const mapRef = React.useRef<MapRef>(null);
    const setStoreViewState = useMapStore(state => state.setViewState);

    const presentDay = useMapStore(state => state.presentDay);
    const setSystemHealth = useMapStore(state => state.setSystemHealth);
    const setIsMapReady = useMapStore(state => state.setIsMapReady);
    const isMapReady = useMapStore(state => state.isMapReady);

    const handleMove = (evt: any) => {
        if (onMove) onMove(evt);
        if (id === "main-map") {
            setStoreViewState(evt.viewState);
        }
    };

    const handleLoad = React.useCallback(() => {
        if (!mapRef.current) return;
        const map = mapRef.current.getMap();

        if (!MAPBOX_ACCESS_TOKEN) {
            setSystemHealth('error', 'Critical: Mapbox Token Missing');
            return;
        }

        map.on('error', (e: any) => {
            const sourceId = e.sourceId || 'Unknown Source';
            const logError = e.error?.message || e.error || 'Source Load Failure';
            setSystemHealth('error', `Failed [${sourceId}]: ${logError}`);
        });

    }, []);

    const handleStyleData = React.useCallback(() => {
        if (!mapRef.current) return;
        const map = mapRef.current.getMap();

        // Ensure the style is formally loaded and source doesn't already exist
        if (map.isStyleLoaded() && !map.getSource('mapbox-streets')) {
            try {
                map.addSource('mapbox-streets', {
                    type: 'vector',
                    url: `https://api.mapbox.com/v4/mapbox.mapbox-streets-v8.json?secure&access_token=${MAPBOX_ACCESS_TOKEN}`
                });

                if (!map.getSource('mapbox-dem')) {
                    map.addSource('mapbox-dem', {
                        type: 'raster-dem',
                        url: `https://api.mapbox.com/v4/mapbox.mapbox-terrain-dem-v1.json?secure&access_token=${MAPBOX_ACCESS_TOKEN}`,
                        tileSize: 512,
                        maxzoom: 14
                    });
                }

                // Remove erroneous symbol layer map bindings
                // Initialize Base Layers natively with strict coalescing
                if (!map.getLayer('3d-buildings')) {
                    map.addLayer({
                        id: '3d-buildings',
                        source: 'mapbox-streets',
                        'source-layer': 'building',
                        type: 'fill-extrusion',
                        paint: {
                            'fill-extrusion-color': '#0f172a',
                            'fill-extrusion-height': ['coalesce', ['get', 'height'], 0],
                            'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0],
                            'fill-extrusion-opacity': 0.8
                        }
                    });
                }

                // Allow the UI to know it's safe to sync layers and project geographic bounds
                setIsMapReady(true);
                syncLayers(map);
            } catch (e) {
                console.error(e);
            }
        }
    }, []);

    const syncLayers = (map: any) => {
        // Redundancy latch: ensure the source actually existed before touching layers
        if (!map.getStyle()) return;

        if (!map.getSource('mapbox-streets')) {
            return;
        }

        try {
            // Dynamic Layer Provisioning
            if (presentDay.healthcare && !map.getLayer('poi-healthcare')) {
                map.addLayer({
                    id: 'poi-healthcare',
                    type: 'circle',
                    source: 'mapbox-streets',
                    'source-layer': 'poi_label',
                    filter: ['==', ['coalesce', ['get', 'class'], 'unclassified'], 'hospital'],
                    paint: {
                        'circle-color': '#EF4444',
                        'circle-radius': 4
                    }
                });
            }
            if (map.getLayer('poi-healthcare')) {
                map.setLayoutProperty('poi-healthcare', 'visibility', presentDay.healthcare ? 'visible' : 'none');
            }

            if (presentDay.education && !map.getLayer('poi-education')) {
                map.addLayer({
                    id: 'poi-education',
                    type: 'circle',
                    source: 'mapbox-streets',
                    'source-layer': 'poi_label',
                    filter: ['==', ['coalesce', ['get', 'class'], 'unclassified'], 'school'],
                    paint: {
                        'circle-color': '#F59E0B',
                        'circle-radius': 4
                    }
                });
            }
            if (map.getLayer('poi-education')) {
                map.setLayoutProperty('poi-education', 'visibility', presentDay.education ? 'visible' : 'none');
            }

            if (presentDay.transport && !map.getLayer('transit-stops')) {
                map.addLayer({
                    id: 'transit-stops',
                    type: 'circle',
                    source: 'mapbox-streets',
                    'source-layer': 'transit_stop_label',
                    paint: {
                        'circle-color': '#3B82F6',
                        'circle-radius': 4
                    }
                });
            }
            if (map.getLayer('transit-stops')) {
                map.setLayoutProperty('transit-stops', 'visibility', presentDay.transport ? 'visible' : 'none');
            }

            if (presentDay.buildings3D && !map.getLayer('3d-buildings')) {
                map.addLayer({
                    id: '3d-buildings',
                    source: 'mapbox-streets',
                    'source-layer': 'building',
                    type: 'fill-extrusion',
                    paint: {
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
                    }
                });
            }
            if (map.getLayer('3d-buildings')) {
                map.setLayoutProperty('3d-buildings', 'visibility', presentDay.buildings3D ? 'visible' : 'none');
            }

            // Logging for robust debugging
            console.log(`[MapLibre] Present Day Sync: Viewport Center [${map.getCenter().lng.toFixed(4)}, ${map.getCenter().lat.toFixed(4)}] @ Z${map.getZoom().toFixed(2)}`);

        } catch (e) {
            console.warn("Layer sync skipped - layers not yet loaded.");
        }
    };

    // Effect to monitor Store changes and sync MapLibre
    React.useEffect(() => {
        if (mapRef.current) {
            syncLayers(mapRef.current.getMap());
        }
    }, [presentDay]);

    // Setup internal transformRequest if not provided by BaseMap
    const defaultTransformRequest = (url: string, resourceType?: string) => {
        if (url.startsWith('mapbox://')) {
            const rawUrl = url.replace('mapbox://', 'https://api.mapbox.com/v4/');
            return {
                url: `${rawUrl}.json?secure&access_token=${MAPBOX_ACCESS_TOKEN}`
            };
        }
        return { url };
    };

    return (
        <Map
            id={id}
            ref={mapRef}
            initialViewState={{ longitude: 76.9467, latitude: 8.5241, zoom: 12, pitch: 60, bearing: -15 }}
            {...(viewState ? { viewState, onMove: handleMove } : { onMove: handleMove })}
            // maxBounds={isMapReady ? TRIVANDRUM_BOUNDS : undefined}
            // minZoom={10}
            reuseMaps
            style={{ width: '100%', height: '100%' }}
            maxPitch={85}
            onData={(e: any) => console.log('[MapLibre Safe-Boot DATA]', e.dataType, e.sourceId)}
            onLoad={handleLoad}
            onStyleData={handleStyleData}
            transformRequest={transformRequest || defaultTransformRequest}
        >
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
