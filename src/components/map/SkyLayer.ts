'use client';

import { LayerProps } from 'react-map-gl/mapbox';

export const skyLayer: LayerProps = {
    id: 'sky',
    type: 'sky',
    paint: {
        'sky-type': 'atmosphere',
        'sky-atmosphere-sun': [0.0, 0.0],
        'sky-atmosphere-sun-intensity': 15
    }
};
