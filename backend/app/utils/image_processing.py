from PIL import Image
import numpy as np
from typing import Tuple

def validate_image(image: Image.Image) -> bool:
    """Validate uploaded image."""
    # Check dimensions
    if image.size[0] < 224 or image.size[1] < 224:
        return False
    
    # Check format
    if image.format not in ['JPEG', 'PNG', 'JPG']:
        return False
    
    return True

def preprocess_image(image: Image.Image, target_size: Tuple[int, int] = (224, 224)) -> np.ndarray:
    """Preprocess image for model input."""
    # Resize
    image = image.resize(target_size)
    
    # Convert to RGB
    if image.mode != 'RGB':
        image = image.convert('RGB')
    
    # Convert to numpy array
    img_array = np.array(image)
    
    # Normalize
    img_array = img_array / 255.0
    
    return img_array

def apply_augmentation(image: np.ndarray) -> np.ndarray:
    """Apply augmentation for robustness."""
    # TODO: Implement augmentation pipeline
    # - Gaussian noise
    # - Motion blur
    # - Brightness/contrast adjustment
    # - Rotation
    
    return image
