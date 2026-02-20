'use client';

import { PolygonLayer } from '@deck.gl/layers';

export function BuildingsLayer(data: any) {
    return new PolygonLayer({
        id: 'osm-buildings',
        data,
        pickable: true,
        stroked: true,
        filled: true,
        extruded: true,
        wireframe: true,
        lineWidthMinPixels: 1,
        getPolygon: (d: any) => d.geometry.coordinates,
        getElevation: (d: any) => d.properties.height ? parseFloat(d.properties.height) : 15, // Default 15m
        getFillColor: [240, 240, 240, 200], // Whiteish
        getLineColor: [100, 100, 100],
        updateTriggers: {
            getElevation: [data]
        }
    });
}
