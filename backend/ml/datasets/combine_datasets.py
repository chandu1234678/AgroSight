"""
Combine multiple datasets into a single training directory.
"""
import shutil
from pathlib import Path

def combine_datasets():
    """Combine all available datasets into one directory."""
    ml_dir = Path(__file__).parent.parent
    raw_dir = ml_dir / "data" / "raw"
    combined_dir = ml_dir / "data" / "combined" / "train"
    
    # Create combined directory
    combined_dir.mkdir(parents=True, exist_ok=True)
    
    print("Combining datasets...")
    
    # Dataset sources
    sources = [
        raw_dir / "New Plant Diseases Dataset(Augmented)" / "New Plant Diseases Dataset(Augmented)" / "train",
        raw_dir / "plantvillage" / "raw" / "color",
        raw_dir / "plant-leaf-disease" / "dataset",
        raw_dir / "plantdoc" / "train",
    ]
    
    total_images = 0
    total_classes = set()
    
    for source in sources:
        if not source.exists():
            print(f"⚠ Skipping {source.name} (not found)")
            continue
        
        print(f"\nProcessing {source.name}...")
        
        # Copy each class folder
        for class_dir in source.iterdir():
            if not class_dir.is_dir():
                continue
            
            class_name = class_dir.name
            total_classes.add(class_name)
            
            # Create class directory in combined folder
            target_class_dir = combined_dir / class_name
            target_class_dir.mkdir(exist_ok=True)
            
            # Copy images
            image_count = 0
            for img_file in class_dir.glob("*"):
                if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                    # Create unique filename to avoid conflicts
                    new_name = f"{source.parent.name}_{img_file.name}"
                    target_file = target_class_dir / new_name
                    
                    if not target_file.exists():
                        shutil.copy2(img_file, target_file)
                        image_count += 1
            
            total_images += image_count
            print(f"  ✓ {class_name}: {image_count} images")
    
    print("\n" + "="*60)
    print("Dataset Combination Complete!")
    print("="*60)
    print(f"Total classes: {len(total_classes)}")
    print(f"Total images: {total_images}")
    print(f"Combined dataset location: {combined_dir}")
    print("="*60 + "\n")
    
    return combined_dir

if __name__ == "__main__":
    combine_datasets()
