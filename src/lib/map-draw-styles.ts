// Custom Draw Styles to match Neon Theme using simple object definition
// Re-coded using strict ["literal", [x, y]] arrays to prevent MapLibre engine panics.
export const neonDrawStyles = [
    // ACTIVE (being drawn) // line stroke
    {
        "id": "gl-draw-line",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["!=", "mode", "static"]],
        "layout": {
            "line-cap": "round",
            "line-join": "round"
        },
        "paint": {
            "line-color": "#eab308", // Yellow-500
            "line-dasharray": ["literal", [2, 2]],
            "line-width": 2
        }
    },
    // polygon fill
    {
        "id": "gl-draw-polygon-fill",
        "type": "fill",
        "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        "paint": {
            "fill-color": "#eab308",
            "fill-outline-color": "#eab308",
            "fill-opacity": 0.1
        }
    },
    // polygon mid points
    {
        "id": "gl-draw-polygon-midpoint",
        "type": "circle",
        "filter": ["all",
            ["==", "$type", "Point"],
            ["==", "meta", "midpoint"]],
        "paint": {
            "circle-radius": 3,
            "circle-color": "#facc15"
        }
    },
    // polygon outline stroke
    {
        "id": "gl-draw-polygon-stroke-active",
        "type": "line",
        "filter": ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
        "layout": {
            "line-cap": "round",
            "line-join": "round"
        },
        "paint": {
            "line-color": "#eab308",
            "line-dasharray": ["literal", [2, 2]],
            "line-width": 2
        }
    },
    // vertex point halos
    {
        "id": "gl-draw-polygon-and-line-vertex-halo-active",
        "type": "circle",
        "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
        "paint": {
            "circle-radius": 5,
            "circle-color": "#FFF"
        }
    },
    // vertex points
    {
        "id": "gl-draw-polygon-and-line-vertex-active",
        "type": "circle",
        "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"], ["!=", "mode", "static"]],
        "paint": {
            "circle-radius": 3,
            "circle-color": "#d946ef" // Fuchsia
        }
    },
    // STATIC // line stroke
    {
        "id": "gl-draw-line-static",
        "type": "line",
        "filter": ["all", ["==", "$type", "LineString"], ["==", "mode", "static"]],
        "layout": {
            "line-cap": "round",
            "line-join": "round"
        },
        "paint": {
            "line-color": "#4ADE80",
            "line-width": 3
        }
    },
    // polygon fill
    {
        "id": "gl-draw-polygon-fill-static",
        "type": "fill",
        "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
        "paint": {
            "fill-color": "#4ADE80", // Green
            "fill-outline-color": "#4ADE80",
            "fill-opacity": 0.1
        }
    },
    // polygon outline
    {
        "id": "gl-draw-polygon-stroke-static",
        "type": "line",
        "filter": ["all", ["==", "$type", "Polygon"], ["==", "mode", "static"]],
        "layout": {
            "line-cap": "round",
            "line-join": "round"
        },
        "paint": {
            "line-color": "#4ADE80",
            "line-width": 3
        }
    }
];
