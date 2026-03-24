"""
Script to download and setup datasets for plant disease detection.
"""
import os
import subprocess
import sys
from pathlib import Path

def create_directories():
    """Create necessary directory structure."""
    base_dir = Path(__file__).parent.parent / "data" / "raw"
    base_dir.mkdir(parents=True, exist_ok=True)
    
    dirs = [
        base_dir / "plantvillage",
        base_dir / "plantdoc",
        base_dir / "plant-leaf-disease",
        base_dir / "custom"
    ]
    
    for dir_path in dirs:
        dir_path.mkdir(exist_ok=True)
    
    print("✓ Created directory structure")
    return base_dir

def download_plantdoc(base_dir):
    """Download PlantDoc dataset from GitHub."""
    plantdoc_dir = base_dir / "plantdoc"
    
    if (plantdoc_dir / ".git").exists():
        print("✓ PlantDoc dataset already exists")
        return
    
    print("Downloading PlantDoc dataset...")
    try:
        subprocess.run(
            ["git", "clone", "https://github.com/pratikkayal/PlantDoc-Dataset.git", str(plantdoc_dir)],
            check=True
        )
        print("✓ PlantDoc dataset downloaded successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error downloading PlantDoc: {e}")
        print("Please download manually from: https://github.com/pratikkayal/PlantDoc-Dataset")
    except FileNotFoundError:
        print("✗ Git not found. Please install git or download manually:")
        print("  https://github.com/pratikkayal/PlantDoc-Dataset")

def download_plant_leaf_disease(base_dir):
    """Download Plant Leaf Disease Classification dataset from GitHub."""
    plant_leaf_dir = base_dir / "plant-leaf-disease"
    
    if (plant_leaf_dir / ".git").exists():
        print("✓ Plant Leaf Disease dataset already exists")
        return
    
    print("Downloading Plant Leaf Disease Classification dataset...")
    try:
        subprocess.run(
            ["git", "clone", "https://github.com/GauthamSree/Plant-Leaf-Disease-Classification.git", str(plant_leaf_dir)],
            check=True
        )
        print("✓ Plant Leaf Disease dataset downloaded successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error downloading Plant Leaf Disease dataset: {e}")
        print("Please download manually from: https://github.com/GauthamSree/Plant-Leaf-Disease-Classification")
    except FileNotFoundError:
        print("✗ Git not found. Please install git or download manually:")
        print("  https://github.com/GauthamSree/Plant-Leaf-Disease-Classification")

def download_plantvillage(base_dir):
    """Download PlantVillage dataset from GitHub."""
    plantvillage_dir = base_dir / "plantvillage"
    
    if (plantvillage_dir / ".git").exists() or any(plantvillage_dir.iterdir()):
        print("✓ PlantVillage dataset already exists")
        return
    
    print("Downloading PlantVillage dataset from GitHub...")
    try:
        subprocess.run(
            ["git", "clone", "https://github.com/spMohanty/PlantVillage-Dataset.git", str(plantvillage_dir)],
            check=True
        )
        print("✓ PlantVillage dataset downloaded successfully")
    except subprocess.CalledProcessError as e:
        print(f"✗ Error downloading PlantVillage: {e}")
        print("Please download manually from: https://github.com/spMohanty/PlantVillage-Dataset")
    except FileNotFoundError:
        print("✗ Git not found. Please install git or download manually:")
        print("  https://github.com/spMohanty/PlantVillage-Dataset")
        print("\nAlternative (Kaggle):")
        print("  https://www.kaggle.com/datasets/emmarex/plantdisease")

def verify_datasets(base_dir):
    """Verify downloaded datasets."""
    print("\nVerifying datasets...")
    
    plantdoc_dir = base_dir / "plantdoc"
    plantvillage_dir = base_dir / "plantvillage"
    plant_leaf_dir = base_dir / "plant-leaf-disease"
    
    # Check PlantDoc
    if (plantdoc_dir / "train").exists() or (plantdoc_dir / "test").exists():
        print("✓ PlantDoc dataset structure verified")
    else:
        print("⚠ PlantDoc dataset may be incomplete")
    
    # Check PlantVillage
    if any(plantvillage_dir.iterdir()):
        print("✓ PlantVillage dataset found")
    else:
        print("⚠ PlantVillage dataset not found")
    
    # Check Plant Leaf Disease
    if (plant_leaf_dir / "dataset").exists() or (plant_leaf_dir / "train").exists():
        print("✓ Plant Leaf Disease dataset found")
    else:
        print("⚠ Plant Leaf Disease dataset may be incomplete")

def main():
    """Main function to download all datasets."""
    print("="*60)
    print("AgroSight Dataset Downloader")
    print("="*60 + "\n")
    
    # Create directories
    base_dir = create_directories()
    
    # Download PlantVillage (automated from GitHub)
    download_plantvillage(base_dir)
    
    # Download PlantDoc (automated from GitHub)
    download_plantdoc(base_dir)
    
    # Download Plant Leaf Disease Classification (automated from GitHub)
    download_plant_leaf_disease(base_dir)
    
    # Verify
    verify_datasets(base_dir)
    
    print("\n" + "="*60)
    print("Next Steps:")
    print("="*60)
    print("1. Verify all datasets are downloaded")
    print("2. Run preprocessing: python utils/preprocessing.py")
    print("3. Start training: python training/train.py")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
