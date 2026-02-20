import * as turf from '@turf/turf';

export interface SectorAnalysis {
    areaAcres: number;
    areaHectares: number;
    intersectedZones: string[];
    amenityCount: number;
    amenities: string[];
}

export function calculateArea(geometry: any) {
    const areaSqMeters = turf.area(geometry);
    return {
        acres: (areaSqMeters * 0.000247105).toFixed(2),
        hectares: (areaSqMeters * 0.0001).toFixed(2),
    };
}

export function analyzeSelection(
    drawGeometry: any,
    zoningData: any[],
    infraData: any[]
): SectorAnalysis {
    if (!drawGeometry) return {
        areaAcres: 0, areaHectares: 0, intersectedZones: [], amenityCount: 0, amenities: []
    };

    const area = calculateArea(drawGeometry);
    const polygon = turf.polygon(drawGeometry.coordinates);

    // Find Intersecting Zones
    const zones = new Set<string>();
    zoningData.forEach((feature) => {
        // Simplified check: if point in polygon or intersection
        // Ideally, we'd use turf.intersect but it can be heavy for many complex polygons
        // For MVP demo, we check if the centroid of the zone is within the drawn shape
        try {
            const center = turf.centroid(feature);
            if (turf.booleanPointInPolygon(center, polygon)) {
                zones.add(feature.properties?.zone_name || 'Unknown Zone');
            }
        } catch (e) {
            // Handle invalid geometries
        }
    });

    // Find Intersecting Amenities (Points)
    const amenities: string[] = [];
    infraData.forEach((feature) => {
        try {
            if (feature.geometry.type === 'Point') {
                if (turf.booleanPointInPolygon(feature, polygon)) {
                    amenities.push(feature.properties?.name || feature.properties?.type || 'Unnamed Amenity');
                }
            }
        } catch (e) {
            // Handle errors
        }
    });

    return {
        areaAcres: parseFloat(area.acres),
        areaHectares: parseFloat(area.hectares),
        intersectedZones: Array.from(zones).slice(0, 5), // Top 5
        amenityCount: amenities.length,
        amenities: amenities.slice(0, 5) // Top 5
    };
}
