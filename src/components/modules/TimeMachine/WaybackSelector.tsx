'use client';

import { useState, useEffect } from 'react';

export interface WaybackItem {
    releaseDate: string;
    itemURL: string;
    layer: string;
}

export function WaybackSelector({ onSelect }: { onSelect: (item: WaybackItem) => void }) {
    const [items, setItems] = useState<WaybackItem[]>([]);

    useEffect(() => {
        // Simplified fetching logic - in real app query ESRI API
        // For MVP, hardcoding recent 5 releases from 2020-2024 for demo
        const DEMO_ITEMS: WaybackItem[] = [
            { releaseDate: '2023-12-01', itemURL: '', layer: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/48315/{z}/{y}/{x}' },
            { releaseDate: '2022-06-15', itemURL: '', layer: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/36892/{z}/{y}/{x}' },
            { releaseDate: '2020-02-12', itemURL: '', layer: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/23412/{z}/{y}/{x}' },
            { releaseDate: '2018-11-20', itemURL: '', layer: 'https://wayback.maptiles.arcgis.com/arcgis/rest/services/World_Imagery/MapServer/tile/13214/{z}/{y}/{x}' },
        ];
        setItems(DEMO_ITEMS);
    }, []);

    return (
        <div className="absolute top-4 left-4 z-10 bg-white p-2 rounded shadow text-black">
            <select onChange={(e) => onSelect(items[parseInt(e.target.value)])} className="p-1 border rounded">
                {items.map((item, index) => (
                    <option key={index} value={index}>
                        {item.releaseDate}
                    </option>
                ))}
            </select>
        </div>
    );
}
