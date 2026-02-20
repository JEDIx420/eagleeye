import { PathLayer } from '@deck.gl/layers';

export const InfrastructureLayer = (data: string | any, props?: any) => new PathLayer({
    id: 'infrastructure-layer',
    data,
    ...props,
    pickable: true,
    widthScale: 20,
    widthMinPixels: 2,
    getPath: (d: any) => d.geometry.coordinates,
    getColor: [255, 140, 0], // Dark Orange
    getWidth: 5,
});
