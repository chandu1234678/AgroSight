import os
from PIL import Image
from typing import Tuple
import shutil

def resize_and_save(
    input_dir: str,
    output_dir: str,
    target_size: Tuple[int, int] = (256, 256)
):
    """Resize all images in directory."""
    os.makedirs(output_dir, exist_ok=True)
    
    for root, dirs, files in os.walk(input_dir):
        for file in files:
            if file.lower().endswith(('.png', '.jpg', '.jpeg')):
                input_path = os.path.join(root, file)
                relative_path = os.path.relpath(root, input_dir)
                output_subdir = os.path.join(output_dir, relative_path)
                os.makedirs(output_subdir, exist_ok=True)
                
                output_path = os.path.join(output_subdir, file)
                
                try:
                    img = Image.open(input_path)
                    img = img.resize(target_size, Image.LANCZOS)
                    img.save(output_path)
                except Exception as e:
                    print(f"Error processing {input_path}: {e}")

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
