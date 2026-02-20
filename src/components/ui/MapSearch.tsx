'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useMap } from 'react-map-gl/mapbox';
import { MAPBOX_ACCESS_TOKEN } from '@/lib/mapbox';

export function MapSearch() {
    const { 'main-map': map, current: currentMap } = useMap();
    const targetMap = map || currentMap;

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length < 3) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        setIsOpen(true);

        try {
            // bbox parameter cages the geocoding strictly to Trivandrum District limits
            const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&bbox=76.75,8.35,77.15,8.65&types=place,locality,postcode,address&proximity=76.9467,8.5241`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.features) {
                setResults(data.features);
            }
        } catch (error) {
            console.error("Geocoding error:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (feature: any) => {
        const [lng, lat] = feature.center;

        if (targetMap) {
            // Cinematic 3D jump-to-point animation
            targetMap.flyTo({
                center: [lng, lat],
                zoom: 16.5,
                pitch: 55,
                duration: 2500,
                essential: true
            });
        }

        setQuery(feature.place_name);
        setIsOpen(false);
    };

    return (
        <div ref={wrapperRef} className="absolute top-4 left-1/2 -translate-x-1/2 z-50 w-[90%] md:w-80 max-w-sm">
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden transition-all focus-within:border-cyan-500/50 focus-within:shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                <div className="pl-3 pr-2 py-3 text-slate-400">
                    {loading ? <Loader2 size={18} className="animate-spin text-cyan-400" /> : <Search size={18} />}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search loc, pincodes..."
                    className="w-full bg-transparent border-none text-sm text-slate-100 placeholder:text-slate-500 py-3 pr-4 focus:outline-none focus:ring-0"
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute top-full mt-2 w-full bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl overflow-hidden">
                    <ul className="max-h-60 overflow-y-auto">
                        {results.map((result) => (
                            <li key={result.id}>
                                <button
                                    onClick={() => handleSelect(result)}
                                    className="w-full text-left px-4 py-3 hover:bg-slate-800/50 flex flex-col transition-colors border-b border-slate-800/50 last:border-0"
                                >
                                    <span className="text-sm font-medium text-slate-200 truncate">{result.text}</span>
                                    <span className="text-xs text-slate-500 truncate">{result.place_name}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
