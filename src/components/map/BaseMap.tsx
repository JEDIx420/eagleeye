'use client';

import dynamic from 'next/dynamic';

const MapboxEngine = dynamic(() => import('@/components/map/MapboxEngine'), { ssr: false });

interface BaseMapProps {
    children?: React.ReactNode;
    id?: string;
    mapStyle?: string | object;
    viewState?: any;
    onMove?: (evt: any) => void;
    // Logic Props
    layers?: any[];
    onDrawCreate?: (e: any) => void;
    onDrawUpdate?: (e: any) => void;
    onDrawDelete?: (e: any) => void;
    drawMode?: string;
}

export default function BaseMap(props: BaseMapProps) {
    return <MapboxEngine {...props} />;
}
