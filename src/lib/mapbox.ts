import 'mapbox-gl/dist/mapbox-gl.css';

export const MAPBOX_ACCESS_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';

// Strict Map Bounds for Thiruvananthapuram District
export const TRIVANDRUM_BOUNDS: [number, number, number, number] = [
    76.75, 8.35,  // Southwest coordinates
    77.15, 8.65   // Northeast coordinates
];

export const INITIAL_VIEW_STATE = {
    longitude: 76.9366, // Central point near Kottayam/Idukki for better initial context, or keep user preferred.
    latitude: 9.5916,
    zoom: 7,
    pitch: 0,
    bearing: 0
};

// Initial view zoomed onto Trivandrum for the pilot
export const TRIVANDRUM_VIEW_STATE = {
    longitude: 76.9366,
    latitude: 8.5241,
    zoom: 11,
    pitch: 60,
    bearing: -15
};
