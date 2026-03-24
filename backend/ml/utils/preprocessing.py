"""
Data preprocessing utilities for plant disease datasets.
Handles PlantVillage and PlantDoc datasets.
"""
import os
from pathlib import Path
from PIL import Image
import shutil
from typing import Tuple, List
import json
import random

def validate_image(image_path: str) -> bool:
    """Validate if image file is readable and not corrupted."""
    try:
        img = Image.open(image_path)
        img.verify()
        return True
    except Exception as e:
        print(f"Invalid image {image_path}: {e}")
        return False

def resize_image(image_path: str, output_path: str, size: Tuple[int, int] = (256, 256)):
    """Resize image to specified size."""
    try:
        img = Image.open(image_path)
        img = img.convert('RGB')
        img = img.resize(size, Image.LANCZOS)
        img.save(output_path, quality=95)
        return True
    except Exception as e:
        print(f"Error resizing {image_path}: {e}")
        return False

def process_plantvillage(raw_dir: Path, processed_dir: Path):
    """Process PlantVillage dataset."""
    print("Processing PlantVillage dataset...")
    
    plantvillage_raw = raw_dir / "plantvillage"
    if not plantvillage_raw.exists():
        print("⚠ PlantVillage dataset not found")
        return
    
    output_dir = processed_dir / "plantvillage"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # TODO: Implement PlantVillage processing
    # - Validate images
    # - Resize to standard size
    # - Organize by class
    # - Create train/val/test splits
    
    print("✓ PlantVillage processing complete (TODO: implement full pipeline)")

def process_plantdoc(raw_dir: Path, processed_dir: Path):
    """Process PlantDoc dataset."""
    print("Processing PlantDoc dataset...")
    
    plantdoc_raw = raw_dir / "plantdoc"
    if not plantdoc_raw.exists():
        print("⚠ PlantDoc dataset not found")
        return
    
    output_dir = processed_dir / "plantdoc"
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # PlantDoc has train and test folders
    for split in ["train", "test"]:
        split_dir = plantdoc_raw / split
        if not split_dir.exists():
            continue
        
        output_split = output_dir / split
        output_split.mkdir(exist_ok=True)
        
        # Process each class
        for class_dir in split_dir.iterdir():
            if not class_dir.is_dir():
                continue
            
            class_name = class_dir.name
            output_class = output_split / class_name
            output_class.mkdir(exist_ok=True)
            
            # Process images
            image_count = 0
            for img_file in class_dir.glob("*"):
                if img_file.suffix.lower() in ['.jpg', '.jpeg', '.png']:
                    if validate_image(str(img_file)):
                        output_path = output_class / img_file.name
                        if resize_image(str(img_file), str(output_path)):
                            image_count += 1
            
            print(f"  {split}/{class_name}: {image_count} images")
    
    print("✓ PlantDoc processing complete")

def create_combined_dataset(processed_dir: Path):
    """Combine PlantVillage and PlantDoc datasets."""
    print("Creating combined dataset...")
    
    # TODO: Implement dataset combination strategy
    # - Map overlapping classes
    # - Balance class distribution
    # - Create unified train/val/test splits
    
    print("✓ Combined dataset created (TODO: implement full pipeline)")

def balance_classes(data_dir: str, max_samples_per_class: int = 1000):
    """Balance dataset by limiting samples per class."""
    # TODO: Implement class balancing logic
    # - Count samples per class
    # - Remove excess samples from over-represented classes
    # - Or use weighted sampling during training
    pass

def split_dataset(
    data_dir: str,
    train_ratio: float = 0.7,
    val_ratio: float = 0.15,
    test_ratio: float = 0.15
):
    """Split dataset into train/val/test sets."""
    # TODO: Implement dataset splitting
    # - Maintain class distribution
    # - Create train/val/test directories
    # - Move files accordingly
    pass

def generate_class_mapping(processed_dir: Path):
    """Generate class name to index mapping."""
    # TODO: Create class_names.json file
    # This will be used during inference
    
    class_names = [
        "Apple___Apple_scab",
        "Apple___Black_rot",
        "Apple___Cedar_apple_rust",
        "Apple___healthy",
        # ... add all classes
    ]
    
    mapping_file = processed_dir / "class_names.json"
    with open(mapping_file, 'w') as f:
        json.dump(class_names, f, indent=2)
    
    print(f"✓ Class mapping saved to {mapping_file}")

def main():
    """Main preprocessing pipeline."""
    print("="*60)
    print("AgroSight Data Preprocessing")
    print("="*60 + "\n")
    
    # Setup paths
    base_dir = Path(__file__).parent.parent / "data"
    raw_dir = base_dir / "raw"
    processed_dir = base_dir / "processed"
    processed_dir.mkdir(parents=True, exist_ok=True)
    
    # Process datasets
    process_plantvillage(raw_dir, processed_dir)
    process_plantdoc(raw_dir, processed_dir)
    
    # Combine datasets
    create_combined_dataset(processed_dir)
    
    # Generate class mapping
    generate_class_mapping(processed_dir)
    
    print("\n" + "="*60)
    print("Preprocessing Complete!")
    print("="*60)
    print(f"Processed data location: {processed_dir}")
    print("Next step: python training/train.py")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
