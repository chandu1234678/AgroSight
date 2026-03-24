import numpy as np
from PIL import Image, ImageFilter
import random

def add_gaussian_noise(image: np.ndarray, mean: float = 0, std: float = 25) -> np.ndarray:
    """Add Gaussian noise to simulate poor image quality."""
    noise = np.random.normal(mean, std, image.shape)
    noisy_image = image + noise
    return np.clip(noisy_image, 0, 255).astype(np.uint8)

def apply_motion_blur(image: Image.Image, size: int = 15) -> Image.Image:
    """Apply motion blur to simulate camera shake."""
    # Create motion blur kernel
    kernel = np.zeros((size, size))
    kernel[int((size-1)/2), :] = np.ones(size)
    kernel = kernel / size
    
    # Apply blur
    return image.filter(ImageFilter.Kernel((size, size), kernel.flatten()))

def adjust_brightness_contrast(
    image: np.ndarray,
    brightness: float = 0,
    contrast: float = 1.0
) -> np.ndarray:
    """Adjust brightness and contrast."""
    adjusted = contrast * image + brightness
    return np.clip(adjusted, 0, 255).astype(np.uint8)

def simulate_poor_lighting(image: np.ndarray) -> np.ndarray:
    """Simulate poor lighting conditions."""
    # Random brightness reduction
    brightness_factor = random.uniform(0.5, 0.9)
    darkened = image * brightness_factor
    
    # Add slight noise
    noise = np.random.normal(0, 10, image.shape)
    
    return np.clip(darkened + noise, 0, 255).astype(np.uint8)

def augmentation_pipeline(image: Image.Image) -> Image.Image:
    """Apply random augmentations for training robustness."""
    img_array = np.array(image)
    
    # Randomly apply augmentations
    if random.random() > 0.5:
        img_array = add_gaussian_noise(img_array)
    
    if random.random() > 0.5:
        image = apply_motion_blur(image)
    
    if random.random() > 0.5:
        img_array = simulate_poor_lighting(img_array)
    
    return Image.fromarray(img_array)
