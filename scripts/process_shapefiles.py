import shapefile
import json
import os
from shapely.geometry import shape, mapping
from shapely.ops import unary_union

# Configuration
RAW_DATA_DIR = 'data/raw'
OUTPUT_DIR = 'public/data'

def process_shapefiles():
    """
    Reads shapefiles from RAW_DATA_DIR, cleans geometry using Shapely,
    and exports them as GeoJSON to OUTPUT_DIR.
    """
    if not os.path.exists(RAW_DATA_DIR):
        print(f"Directory {RAW_DATA_DIR} does not exist. Please place .shp files there.")
        return

    os.makedirs(OUTPUT_DIR, exist_ok=True)

    files = [f for f in os.listdir(RAW_DATA_DIR) if f.endswith('.shp')]
    
    if not files:
        print(f"No .shp files found in {RAW_DATA_DIR}")
        return

    for filename in files:
        name = os.path.splitext(filename)[0]
        shp_path = os.path.join(RAW_DATA_DIR, filename)
        output_path = os.path.join(OUTPUT_DIR, f"{name}.json")
        
        print(f"Processing {filename}...")
        
        try:
            reader = shapefile.Reader(shp_path)
            fields = reader.fields[1:]
            field_names = [field[0] for field in fields]
            
            features = []
            
            for sr in reader.shapeRecords():
                # Extract geometry and attributes
                geom = sr.shape.__geo_interface__
                atr = dict(zip(field_names, sr.record))
                
                # Use Shapely to clean/validate geometry
                s_geom = shape(geom)
                if not s_geom.is_valid:
                    s_geom = s_geom.buffer(0) # Fix self-intersections
                
                features.append({
                    "type": "Feature",
                    "geometry": mapping(s_geom),
                    "properties": atr
                })
            
            geojson_data = {
                "type": "FeatureCollection",
                "features": features
            }
            
            with open(output_path, 'w') as f:
                json.dump(geojson_data, f)
            
            print(f"Successfully saved {output_path}")
            
        except Exception as e:
            print(f"Error processing {filename}: {e}")

if __name__ == "__main__":
    process_shapefiles()
