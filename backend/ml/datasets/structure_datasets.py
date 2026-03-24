"""
Structure and organize all plant disease datasets into a unified format.
This script will:
1. Scan all downloaded datasets
2. Organize them into a standard train/val/test structure
3. Remove duplicates and standardize class names
4. Generate statistics and reports
"""
import os
import shutil
from pathlib import Path
from collections import defaultdict
import json

class DatasetStructurer:
    def __init__(self):
        self.ml_dir = Path(__file__).parent.parent
        self.raw_dir = self.ml_dir / "data" / "raw"
        self.structured_dir = self.ml_dir / "data" / "structured"
        self.stats = defaultdict(lambda: {"images": 0, "sources": []})
        
    def scan_datasets(self):
        """Scan and identify all available datasets."""
        print("="*70)
        print("SCANNING DATASETS")
        print("="*70 + "\n")
        
        datasets = {
            "PlantVillage (Augmented)": {
                "path": self.raw_dir / "New Plant Diseases Dataset(Augmented)" / "New Plant Diseases Dataset(Augmented)" / "train",
                "type": "train_only",
                "priority": 1
            },
            "PlantVillage (Original)": {
                "path": self.raw_dir / "plantvillage" / "raw" / "color",
                "type": "train_only",
                "priority": 2
            },
            "PlantDoc": {
                "path": self.raw_dir / "plantdoc",
                "type": "train_test",
                "priority": 3
            },
            "Plant-Leaf-Disease": {
                "path": self.raw_dir / "plant-leaf-disease" / "dataset",
                "type": "train_only",
                "priority": 4
            }
        }
        
        available_datasets = {}
        
        for name, info in datasets.items():
            if info["path"].exists():
                # Count images
                image_count = 0
                class_count = 0
                
                if info["type"] == "train_only":
                    for class_dir in info["path"].iterdir():
                        if class_dir.is_dir():
                            class_count += 1
                            image_count += len(list(class_dir.glob("*.jpg"))) + \
                                         len(list(class_dir.glob("*.JPG"))) + \
                                         len(list(class_dir.glob("*.png")))
                elif info["type"] == "train_test":
                    train_path = info["path"] / "train"
                    if train_path.exists():
                        for class_dir in train_path.iterdir():
                            if class_dir.is_dir():
                                class_count += 1
                                image_count += len(list(class_dir.glob("*.jpg"))) + \
                                             len(list(class_dir.glob("*.JPG"))) + \
                                             len(list(class_dir.glob("*.png")))
                
                info["image_count"] = image_count
                info["class_count"] = class_count
                available_datasets[name] = info
                
                print(f"✓ {name}")
                print(f"  Path: {info['path']}")
                print(f"  Images: {image_count:,}")
                print(f"  Classes: {class_count}")
                print()
            else:
                print(f"✗ {name} - Not found")
                print(f"  Expected: {info['path']}\n")
        
        return available_datasets
    
    def standardize_class_name(self, class_name):
        """Standardize class names across datasets."""
        # Remove common prefixes/suffixes
        class_name = class_name.replace("___", "_")
        class_name = class_name.replace("__", "_")
        
        # Mapping for common variations
        mappings = {
            "Pepper__bell": "Pepper_Bell",
            "Potato___Early_blight": "Potato_Early_Blight",
            "Potato___Late_blight": "Potato_Late_Blight",
            "Tomato___Bacterial_spot": "Tomato_Bacterial_Spot",
            "Tomato___Early_blight": "Tomato_Early_Blight",
            "Tomato___Late_blight": "Tomato_Late_Blight",
            "Tomato___Leaf_Mold": "Tomato_Leaf_Mold",
            "Tomato___Septoria_leaf_spot": "Tomato_Septoria_Leaf_Spot",
            "Tomato___Spider_mites": "Tomato_Spider_Mites",
            "Tomato___Target_Spot": "Tomato_Target_Spot",
            "Tomato___Yellow_Leaf_Curl_Virus": "Tomato_Yellow_Leaf_Curl_Virus",
            "Tomato___mosaic_virus": "Tomato_Mosaic_Virus",
            "Tomato__Tomato_mosaic_virus": "Tomato_Mosaic_Virus",
        }
        
        return mappings.get(class_name, class_name)
    
    def structure_dataset(self, available_datasets, train_split=0.8, val_split=0.1):
        """Structure all datasets into train/val/test splits."""
        print("\n" + "="*70)
        print("STRUCTURING DATASETS")
        print("="*70 + "\n")
        
        # Create structured directories
        for split in ["train", "val", "test"]:
            (self.structured_dir / split).mkdir(parents=True, exist_ok=True)
        
        # Process each dataset
        all_classes = set()
        total_images = 0
        
        for dataset_name, info in sorted(available_datasets.items(), 
                                        key=lambda x: x[1]["priority"]):
            print(f"Processing {dataset_name}...")
            
            source_path = info["path"]
            
            # Handle different dataset structures
            if info["type"] == "train_only":
                self._process_train_only(source_path, dataset_name, train_split, val_split)
            elif info["type"] == "train_test":
                self._process_train_test(source_path, dataset_name)
            
            print(f"  ✓ Completed\n")
        
        # Generate statistics
        self._generate_statistics()
    
    def _process_train_only(self, source_path, dataset_name, train_split, val_split):
        """Process datasets that only have training data."""
        from random import shuffle
        
        for class_dir in source_path.iterdir():
            if not class_dir.is_dir():
                continue
            
            class_name = self.standardize_class_name(class_dir.name)
            
            # Get all images
            images = list(class_dir.glob("*.jpg")) + \
                    list(class_dir.glob("*.JPG")) + \
                    list(class_dir.glob("*.png")) + \
                    list(class_dir.glob("*.PNG"))
            
            if not images:
                continue
            
            # Shuffle for random split
            shuffle(images)
            
            # Calculate split indices
            total = len(images)
            train_end = int(total * train_split)
            val_end = train_end + int(total * val_split)
            
            # Split images
            train_images = images[:train_end]
            val_images = images[train_end:val_end]
            test_images = images[val_end:]
            
            # Copy to structured directories
            for split, split_images in [("train", train_images), 
                                       ("val", val_images), 
                                       ("test", test_images)]:
                if split_images:
                    target_dir = self.structured_dir / split / class_name
                    target_dir.mkdir(parents=True, exist_ok=True)
                    
                    for img in split_images:
                        # Create unique filename
                        new_name = f"{dataset_name.replace(' ', '_')}_{img.name}"
                        target_file = target_dir / new_name
                        
                        if not target_file.exists():
                            shutil.copy2(img, target_file)
                            self.stats[class_name]["images"] += 1
                            if dataset_name not in self.stats[class_name]["sources"]:
                                self.stats[class_name]["sources"].append(dataset_name)
    
    def _process_train_test(self, source_path, dataset_name):
        """Process datasets that have train/test splits."""
        for split in ["train", "test"]:
            split_path = source_path / split
            if not split_path.exists():
                continue
            
            for class_dir in split_path.iterdir():
                if not class_dir.is_dir():
                    continue
                
                class_name = self.standardize_class_name(class_dir.name)
                
                # Get all images
                images = list(class_dir.glob("*.jpg")) + \
                        list(class_dir.glob("*.JPG")) + \
                        list(class_dir.glob("*.png"))
                
                if not images:
                    continue
                
                # Copy to structured directory
                target_dir = self.structured_dir / split / class_name
                target_dir.mkdir(parents=True, exist_ok=True)
                
                for img in images:
                    new_name = f"{dataset_name.replace(' ', '_')}_{img.name}"
                    target_file = target_dir / new_name
                    
                    if not target_file.exists():
                        shutil.copy2(img, target_file)
                        self.stats[class_name]["images"] += 1
                        if dataset_name not in self.stats[class_name]["sources"]:
                            self.stats[class_name]["sources"].append(dataset_name)
    
    def _generate_statistics(self):
        """Generate and save dataset statistics."""
        print("\n" + "="*70)
        print("DATASET STATISTICS")
        print("="*70 + "\n")
        
        # Count images per split
        splits_stats = {}
        for split in ["train", "val", "test"]:
            split_path = self.structured_dir / split
            if split_path.exists():
                total = 0
                classes = 0
                for class_dir in split_path.iterdir():
                    if class_dir.is_dir():
                        classes += 1
                        total += len(list(class_dir.glob("*")))
                splits_stats[split] = {"images": total, "classes": classes}
        
        # Print statistics
        print(f"Total Classes: {len(self.stats)}")
        print(f"\nSplit Distribution:")
        for split, stats in splits_stats.items():
            print(f"  {split.capitalize():5s}: {stats['images']:6,} images, {stats['classes']:2} classes")
        
        print(f"\nClass Distribution:")
        sorted_classes = sorted(self.stats.items(), key=lambda x: x[1]["images"], reverse=True)
        for class_name, info in sorted_classes[:20]:  # Top 20 classes
            sources = ", ".join(info["sources"])
            print(f"  {class_name:40s}: {info['images']:5,} images ({sources})")
        
        if len(sorted_classes) > 20:
            print(f"  ... and {len(sorted_classes) - 20} more classes")
        
        # Save to JSON
        stats_file = self.structured_dir / "dataset_stats.json"
        with open(stats_file, 'w') as f:
            json.dump({
                "splits": splits_stats,
                "classes": dict(self.stats),
                "total_classes": len(self.stats)
            }, f, indent=2)
        
        print(f"\n✓ Statistics saved to: {stats_file}")
        
        # Save class names
        class_names = sorted(self.stats.keys())
        class_names_file = self.structured_dir / "class_names.json"
        with open(class_names_file, 'w') as f:
            json.dump(class_names, f, indent=2)
        
        print(f"✓ Class names saved to: {class_names_file}")
        
        print("\n" + "="*70)
        print("STRUCTURING COMPLETE!")
        print("="*70)
        print(f"\nStructured dataset location: {self.structured_dir}")
        print(f"Ready for training!\n")

def main():
    """Main function to structure all datasets."""
    structurer = DatasetStructurer()
    
    # Scan available datasets
    available_datasets = structurer.scan_datasets()
    
    if not available_datasets:
        print("✗ No datasets found!")
        print("\nPlease run: python datasets/download_datasets.py")
        return
    
    # Structure datasets
    structurer.structure_dataset(available_datasets)
    
    print("\nNext Steps:")
    print("1. Review the structured dataset in: backend/ml/data/structured/")
    print("2. Train the model: python training/train.py --data structured")
    print()

if __name__ == "__main__":
    main()
