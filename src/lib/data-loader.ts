const failedFetchCache = new Set<string>();

export async function loadStaticGeoJSON(filename: string) {
    if (failedFetchCache.has(filename)) {
        return { type: 'FeatureCollection', features: [] };
    }

    try {
        const response = await fetch(`/data/${filename}`);
        if (!response.ok) {
            console.warn(`Layer ${filename} not found in /public/data/. Using empty fallback.`);
            failedFetchCache.add(filename);
            return { type: 'FeatureCollection', features: [] };
        }
        return await response.json();
    } catch (error) {
        console.warn(`Layer ${filename} not found in /public/data/. Using empty fallback.`);
        failedFetchCache.add(filename);
        return { type: "FeatureCollection", features: [] };
    }
}
