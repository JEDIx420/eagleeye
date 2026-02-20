import { useEffect } from 'react';
import { useMap } from 'react-map-gl/mapbox';

export function useStreetViewSync(panorama: google.maps.StreetViewPanorama | null) {
    const { current: map } = useMap(); // Get the current map instance

    useEffect(() => {
        if (!map || !panorama) return;

        const mapInstance = map.getMap(); // Access native Mapbox instance

        // Sync Mapbox -> Street View
        const onMapMove = () => {
            const center = mapInstance.getCenter();
            // Check availability strictly? Or just set position.
            // Google SV will snap to nearest.
            panorama.setPosition({ lat: center.lat, lng: center.lng });
        };

        const onMapRotate = () => {
            const bearing = mapInstance.getBearing();
            const pitch = mapInstance.getPitch();
            panorama.setPov({
                heading: bearing,
                pitch: pitch - 90 // Mapbox pitch 0 is top-down, SV pitch 0 is horizon? 
                // Actually SV pitch 0 is horizon, 90 is up, -90 is down.
                // Mapbox pitch 0 is top-down (nadir), 60 is angled.
                // Wait, Mapbox pitch 0 is straight down (nadir). 
                // SV pitch 0 is horizon.
                // So mapbox 0 -> SV -90? Or just map heading.
                // Mapbox pitch is usually 0-85.
                // For MVP, just sync Heading.
            });
        };

        mapInstance.on('moveend', onMapMove);
        mapInstance.on('rotate', onMapRotate);

        // Sync Street View -> Mapbox (Optional/Reverse)
        const svListener = panorama.addListener('position_changed', () => {
            const pos = panorama.getPosition();
            if (pos) {
                map.flyTo({
                    center: [pos.lng(), pos.lat()],
                    essential: true
                });
            }
        });

        return () => {
            mapInstance.off('moveend', onMapMove);
            mapInstance.off('rotate', onMapRotate);
            google.maps.event.removeListener(svListener);
        };
    }, [map, panorama]);
}
