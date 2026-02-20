import { GeoJsonLayer } from '@deck.gl/layers';

export const RevenueLayer = (data: string | any, props?: any) => new GeoJsonLayer({
    id: 'revenue-layer',
    data,
    ...props,
    pickable: true,
    stroked: true,
    filled: false, // Only outlines for revenue parcels
    lineWidthMinPixels: 1,
    getLineColor: [0, 255, 255, 200], // Cyan
    getPolygonOffset: ({ layerIndex }) => [0, -layerIndex * 50],
});
