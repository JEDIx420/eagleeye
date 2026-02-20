'use client';

import dynamic from 'next/dynamic';

const MapboxEngine = dynamic(() => import('@/components/map/MapboxEngine'), { ssr: false });
const MapLibreEngine = dynamic(() => import('@/components/map/MapLibreEngine'), { ssr: false });

import { MAPBOX_ACCESS_TOKEN } from '@/lib/mapbox';

interface BaseMapProps {
    children?: React.ReactNode;
    id?: string;
    mapStyle?: string | object;
    viewState?: any;
    onMove?: (evt: any) => void;
    engine?: 'mapbox' | 'maplibre';
    // Logic Props
    layers?: any[];
    onDrawCreate?: (e: any) => void;
    onDrawUpdate?: (e: any) => void;
    onDrawDelete?: (e: any) => void;
    drawMode?: string;
}

export default function BaseMap({ engine = 'maplibre', ...props }: BaseMapProps) {
    const transformRequest = (url: string, resourceType?: string) => {
        if (url.startsWith('mapbox://')) {
            console.log("[MapLibre] Handshaking with Mapbox API...");
            const rawUrl = url.replace('mapbox://', 'https://api.mapbox.com/v4/');
            // Ensure tile endpoints explicitly use .json for vector loads without duplicating them
            const fetchUrl = rawUrl.includes('.json') ? rawUrl : `${rawUrl}.json`;
            return {
                url: `${fetchUrl}?secure&access_token=${MAPBOX_ACCESS_TOKEN}`
            };
        }
        return { url };
    };

    if (engine === 'mapbox') {
        return <MapboxEngine {...props} />;
    }
    return <MapLibreEngine transformRequest={transformRequest} {...props} />;
}
