import { GeoJsonLayer } from '@deck.gl/layers';

export const ZoningLayer = (data: string | any, props?: any) => new GeoJsonLayer({
    id: 'zoning-layer',
    data,
    ...props,
    pickable: true,
    stroked: true,
    filled: true,
    extruded: false, // Master plans are usually 2D overlays on terrain
    lineWidthScale: 20,
    lineWidthMinPixels: 2,
    getFillColor: (d: any) => {
        const code = d.properties?.zone_code || '';
        if (code.startsWith('R')) return [255, 255, 0, 100]; // Residential - Yellow
        if (code.startsWith('C')) return [255, 0, 0, 100];   // Commercial - Red
        if (code.startsWith('I')) return [128, 0, 128, 100]; // Industrial - Purple
        return [200, 200, 200, 100]; // Default - Gray
    },
    getLineColor: [255, 255, 255, 200],
    getPolygonOffset: ({ layerIndex }) => [0, -layerIndex * 100], // Prevent z-fighting
});
