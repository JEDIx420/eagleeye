import osmtogeojson from 'osmtogeojson';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export interface ElevationPoint {
    distance: number;
    elevation: number;
    location: { lat: number, lng: number };
}

export async function fetchElevationProfile(path: [number, number][]): Promise<ElevationPoint[]> {
    if (!GOOGLE_MAPS_API_KEY) {
        console.warn("Google Maps API Key missing");
        // Return mock data for demo if no key
        return path.map((p, i) => ({
            distance: i * 100,
            elevation: 10 + Math.random() * 50,
            location: { lat: p[1], lng: p[0] }
        }));
    }

    // Sample points along the path (simplified)
    // For production, we'd use Google's path parameter properly
    const locations = path.map(p => `${p[1]},${p[0]}`).join('|');

    try {
        const url = `https://maps.googleapis.com/maps/api/elevation/json?locations=${locations}&key=${GOOGLE_MAPS_API_KEY}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.status === 'OK') {
            return data.results.map((r: any, i: number) => ({
                distance: i, // We'd calculate actual distance in a real app
                elevation: r.elevation,
                location: r.location
            }));
        }
    } catch (e) {
        console.error("Elevation fetch failed", e);
    }

    return [];
}

export async function fetchOSMBuildings(bbox: [number, number, number, number]) {
    // bbox: [minX, minY, maxX, maxY]
    // Overpass expects: [min_lat, min_lon, max_lat, max_lon] -> [minY, minX, maxY, maxX]
    const [minX, minY, maxX, maxY] = bbox;

    const query = `
    [out:json][timeout:25];
    (
      way["building"](${minY},${minX},${maxY},${maxX});
      relation["building"](${minY},${minX},${maxY},${maxX});
    );
    out body;
    >;
    out skel qt;
  `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        const geojson = osmtogeojson(data);
        return geojson;
    } catch (e) {
        console.error("OSM fetch failed", e);
        return null;
    }
}
