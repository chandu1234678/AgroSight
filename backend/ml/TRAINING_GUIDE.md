# AgroSight ML Training Guide

Complete guide for dataset management and model training.

## Quick Start

```bash
# 1. Download all datasets
cd backend/ml
python datasets/download_datasets.py

# 2. Structure datasets (combines all datasets)
python datasets/structure_datasets.py

# 3. Train with GPU
python training/train.py --data structured --device cuda --epochs 20
```

---

## Dataset Management

### Available Datasets

1. **PlantVillage (Augmented)** - 24,331 images, 14 classes
2. **PlantVillage (Original)** - ~54,000 images, 38 classes
3. **PlantDoc** - ~2,600 images, 27 classes
4. **Plant-Leaf-Disease** - Additional disease images

### Download Datasets

```bash
cd backend/ml
python datasets/download_datasets.py
```

This will automatically download:
- PlantVillage from GitHub
- PlantDoc from GitHub
- Plant-Leaf-Disease-Classification from GitHub

### Structure Datasets (Recommended)

Combines all datasets into a unified structure with proper train/val/test splits:

```bash
python datasets/structure_datasets.py
```

**Output:**
```
backend/ml/data/structured/
├── train/          # 80% of data
├── val/            # 10% of data
├── test/           # 10% of data
├── class_names.json
└── dataset_stats.json
```

**Benefits:**
- Removes duplicates
- Standardizes class names
- Proper train/val/test splits
- Combines all datasets for maximum accuracy

---

## Training

### Basic Training

```bash
cd backend/ml
python training/train.py
```

### Training with Structured Dataset (Recommended)

```bash
python training/train.py --data structured --device cuda --epochs 20 --batch-size 32
```

### Training Options

```bash
python training/train.py [OPTIONS]

Options:
  --data {auto,structured,plantvillage,plantdoc,plant-leaf}
                        Dataset to use (default: auto)
  --epochs INT          Number of training epochs (default: 20)
  --batch-size INT      Batch size (default: 32)
  --device {auto,cuda,cpu}
                        Device to use (default: auto)
```

### Training Examples

**1. Quick training with auto-detection:**
```bash
python training/train.py
```

**2. Full training with all datasets (GPU):**
```bash
python training/train.py --data structured --device cuda --epochs 25
```

**3. Fast training for testing (CPU):**
```bash
python training/train.py --epochs 5 --batch-size 16 --device cpu
```

**4. Production training (GPU, more epochs):**
```bash
python training/train.py --data structured --device cuda --epochs 30 --batch-size 64
```

---

## GPU Setup

### Check GPU Availability

```bash
py -c "import torch; print('CUDA:', torch.cuda.is_available()); print('GPU:', torch.cuda.get_device_name(0) if torch.cuda.is_available() else 'None')"
```

### Install CUDA-enabled PyTorch

```bash
# Uninstall CPU version
pip uninstall torch torchvision torchaudio -y

# Install CUDA version (for RTX 4050)
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### Verify Installation

```bash
nvidia-smi  # Check GPU status
py -c "import torch; print('CUDA Available:', torch.cuda.is_available())"
```

---

## Expected Results

### With Structured Dataset (All Combined)

- **Training Accuracy**: 92-96%
- **Validation Accuracy**: 90-95%
- **Number of Classes**: 38-45 (depending on datasets)
- **Training Time (GPU)**: 15-20 minutes for 20 epochs
- **Training Time (CPU)**: 2-3 hours for 20 epochs

### With Single Dataset (PlantVillage Augmented)

- **Training Accuracy**: 90-94%
- **Validation Accuracy**: 88-93%
- **Number of Classes**: 14
- **Training Time (GPU)**: 10-15 minutes for 20 epochs
- **Training Time (CPU)**: 1.5-2 hours for 20 epochs

---

## Output Files

After training, you'll find:

```
backend/ml/saved_models/
├── resnet34_plant_disease_best.pth    # Best model (highest val accuracy)
├── resnet34_plant_disease_final.pth   # Final model (last epoch)
└── class_names.json                    # List of disease classes
```

---

## Troubleshooting

### GPU Not Detected

**Problem:** Training uses CPU even though you have NVIDIA GPU

**Solution:**
```bash
# Check if CUDA is available
nvidia-smi

# Reinstall PyTorch with CUDA
pip uninstall torch torchvision torchaudio -y
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### Out of Memory Error

**Problem:** CUDA out of memory

**Solution:**
```bash
# Reduce batch size
python training/train.py --batch-size 16  # or 8
```

### Dataset Not Found

**Problem:** "Data directory not found"

**Solution:**
```bash
# Download datasets first
python datasets/download_datasets.py

# Then structure them
python datasets/structure_datasets.py

# Or train with specific dataset
python training/train.py --data plantvillage
```

### Slow Training on CPU

**Problem:** Training is very slow

**Solutions:**
1. Use GPU (15-20x faster)
2. Reduce epochs: `--epochs 10`
3. Reduce batch size: `--batch-size 16`
4. Use Google Colab (free GPU)

---

## Advanced Usage

### Custom Dataset Structure

If you have your own dataset:

```
backend/ml/data/custom/
└── train/
    ├── disease_1/
    │   ├── img1.jpg
    │   └── img2.jpg
    └── disease_2/
        ├── img1.jpg
        └── img2.jpg
```

Train with:
```bash
python training/train.py --data custom
```

### Resume Training

Training automatically saves checkpoints. To resume:

```bash
# Load best model and continue
python training/train.py --resume
```

### Export for Production

After training, the model is ready for deployment:

```python
import torch
from ml.models.resnet_model import create_model

# Load model
model = create_model(num_classes=38)
model.load_state_dict(torch.load('saved_models/resnet34_plant_disease_best.pth'))
model.eval()

# Use for inference
# ... (see backend/app/services/ai_model.py)
```

---

## Performance Tips

1. **Use GPU**: 15-20x faster than CPU
2. **Use Structured Dataset**: Combines all datasets for better accuracy
3. **Increase Epochs**: More epochs = better accuracy (up to a point)
4. **Adjust Batch Size**: Larger = faster training (if GPU memory allows)
5. **Use Data Augmentation**: Already included in training script

---

## Dataset Statistics

After structuring, check `backend/ml/data/structured/dataset_stats.json` for:
- Total images per split (train/val/test)
- Images per class
- Dataset sources per class
- Class distribution

---

## Next Steps

1. ✅ Download datasets
2. ✅ Structure datasets
3. ✅ Train model with GPU
4. 🔄 Integrate model with backend API
5. 🔄 Test predictions through frontend
6. 🔄 Deploy to production

---

## Support

For issues or questions:
1. Check this guide
2. Review training logs
3. Check dataset statistics
4. Verify GPU setup

Happy Training! 🚀
