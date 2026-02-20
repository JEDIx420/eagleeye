'use client';

import * as React from 'react';
import { MapProvider as ReactMapGLProvider } from 'react-map-gl/mapbox';

export function MapProvider({ children }: { children: React.ReactNode }) {
    return (
        <ReactMapGLProvider>
            {children}
        </ReactMapGLProvider>
    );
}
