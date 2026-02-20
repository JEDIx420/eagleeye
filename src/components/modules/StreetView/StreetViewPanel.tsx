'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { useStreetViewSync } from '@/hooks/useStreetViewSync';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || '';

interface StreetViewPanelProps {
    onPanoramaCreated?: (panorama: google.maps.StreetViewPanorama) => void;
}

export default function StreetViewPanel({ onPanoramaCreated }: StreetViewPanelProps) {
    const streetViewRef = useRef<HTMLDivElement>(null);
    const [panorama, setPanorama] = useState<google.maps.StreetViewPanorama | null>(null);

    // Custom hook to sync logic
    useStreetViewSync(panorama);

    const initStreetView = () => {
        if (streetViewRef.current && !panorama && window.google) {
            const newPanorama = new window.google.maps.StreetViewPanorama(
                streetViewRef.current,
                {
                    position: { lat: 8.5241, lng: 76.9366 }, // Trivandrum
                    pov: { heading: 0, pitch: 0 },
                    zoom: 1
                }
            );
            setPanorama(newPanorama);
            if (onPanoramaCreated) onPanoramaCreated(newPanorama);
        }
    };

    return (
        <>
            <Script
                src={`https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&callback=initMap`}
                onLoad={initStreetView}
                strategy="afterInteractive"
            />
            <div
                ref={streetViewRef}
                style={{ width: '100%', height: '100%', minHeight: '300px' }}
                className="w-full h-full bg-gray-200"
            />
        </>
    );
}
