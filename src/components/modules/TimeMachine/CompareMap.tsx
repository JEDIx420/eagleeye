'use client';

import { useState, useCallback } from 'react';
import Map, { Source, Layer } from 'react-map-gl/mapbox';
import { MAPBOX_ACCESS_TOKEN, TRIVANDRUM_BOUNDS } from '@/lib/mapbox';

interface CompareMapProps {
    leftLayerUrl: string; // Current
    rightLayerUrl: string; // Historical
}

export default function CompareMap({ leftLayerUrl, rightLayerUrl }: CompareMapProps) {
    const [viewState, setViewState] = useState({
        longitude: 76.9366,
        latitude: 9.5916,
        zoom: 7,
        pitch: 0,
        bearing: 0
    });

    const onMove = useCallback((evt: any) => {
        setViewState(evt.viewState);
    }, []);

    // For MVP, just rendering one map with layer toggle or opacity would be easier
    // But strictly following plan for Compare Map:
    // We can use a slider to reveal the bottom map (historical) over the top map (current)
    // Or CSS clip-path for split screen

    // Implementation of Split Screen:
    // Two maps absolute positioned. Top one clipped.
    const [sliderPosition, setSliderPosition] = useState(50);

    return (
        <div className="relative w-full h-full">
            {/* Historical Map (Right/Bottom) */}
            <div className="absolute inset-0">
                <Map
                    {...viewState}
                    onMove={onMove}
                    mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                    mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                    reuseMaps
                >
                    <Source id="historical" type="raster" tiles={[rightLayerUrl]} tileSize={256}>
                        <Layer id="historical-layer" type="raster" />
                    </Source>
                </Map>
            </div>

            {/* Current Map (Left/Top) - Clipped */}
            <div
                className="absolute inset-0 border-r-2 border-white pointer-events-none"
                style={{ width: `${sliderPosition}%`, overflow: 'hidden' }}
            >
                {/* Note: In a real implementation we need to sync 2 interacting maps, 
             or use one map and sync events carefully. 
             Simplified for MVP: pointer-events-none on top map, it just follows viewState.
             But then we can't interact with left side. 
             better approach: One map, with specific layer masking (WebGL scissors) is hard in React-Map-GL.
             
             Alternative: Just use CSS clip-path on a second map instance. 
             Both maps interactive? No, usually one controls both.
         */}
                <Map
                    {...viewState}
                    // No onMove here, controlled by state from the other map (or a wrapper)
                    mapStyle="mapbox://styles/mapbox/satellite-streets-v12"
                    mapboxAccessToken={MAPBOX_ACCESS_TOKEN}
                    reuseMaps
                    style={{ width: '100vw', height: '100vh', pointerEvents: 'none' }} // Map takes full width but is clipped by parent
                />
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-col-resize z-20 flex items-center justify-center"
                style={{ left: `${sliderPosition}%` }}
                onDrag={(e) => {
                    // Simplified drag logic would go here
                }}
            >
                <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow">
                    ↔
                </div>
            </div>

            {/* 
        NOTE: Real implementation of robust CompareMap requires syncing two interactive maps.
        react-map-gl doesn't support 'mapbox-gl-compare' directly as a component.
        For Plan purposes, this is a skeleton. 
      */}
        </div>
    );
}
