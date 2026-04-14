import os
import json
import argparse
from tqdm import tqdm

def parse_args():
    parser = argparse.ArgumentParser(description="Build Global Search Index for SAE Explorer")
    parser.add_argument(
        "--data_dir", 
        type=str, 
        default="./public/data", 
        help="Path to the directory containing layer JSON files"
    )
    parser.add_argument(
        "--output_name", 
        type=str, 
        default="global_index.json", 
        help="Name of the index file to generate"
    )
    return parser.parse_args()

def build_index(data_dir, output_name):
    """
    Scans all ui_data_layer_X.json files and builds a compact index for searching.
    """
    search_index = []
    
    files = [f for f in os.listdir(data_dir) if f.startswith("ui_data_layer_") and f.endswith(".json")]
    
    if not files:
        print(f"❌ No layer files found in {data_dir}. Did you run the export script first?")
        return

    print(f"Found {len(files)} layers. Starting indexing...")

    for filename in tqdm(files, desc="Indexing Layers"):
        try:
            layer_num = int(filename.split("_")[-1].replace(".json", ""))
        except ValueError:
            print(f"Skipping file with unexpected name format: {filename}")
            continue

        file_path = os.path.join(data_dir, filename)
        
        with open(file_path, 'r') as f:
            try:
                data = json.load(f)
            except json.JSONDecodeError:
                print(f"❌ Failed to parse JSON in {filename}. Skipping.")
                continue

        for feat in data.get('features', []):
            primary_label = "Unknown"
            if feat.get('top_activations') and len(feat['top_activations']) > 0:
                primary_label = feat['top_activations'][0].get('metadata', {}).get('label', 'Unknown')

            search_index.append({
                "l": layer_num,
                "id": feat['id'],
                "label": primary_label, 
                "c": feat['cluster'],
                "a": feat.get('avg_act', 0)
            })

    output_path = os.path.join(data_dir, output_name)
    with open(output_path, 'w') as f:
        json.dump(search_index, f)

    print(f"\nSuccess! Global index created with {len(search_index)} features.")
    print(f"📍 Saved to: {output_path}")

def main():
    args = parse_args()
    
    if not os.path.exists(args.data_dir):
        print(f"❌ Error: The directory '{args.data_dir}' does not exist.")
        return

    build_index(args.data_dir, args.output_name)

if __name__ == "__main__":
    main()