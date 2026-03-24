# Dataset Setup

## Required Datasets

### 1. PlantVillage Dataset
- **Purpose**: Initial training
- **Classes**: 38 plant disease categories
- **Download**: https://www.kaggle.com/datasets/emmarex/plantdisease
- **Location**: `ml/data/raw/plantvillage/`

### 2. PlantDoc Dataset
- **Purpose**: Real-world fine-tuning
- **Classes**: 27 classes with real field images
- **Download**: https://github.com/pratikkayal/PlantDoc-Dataset
- **Location**: `ml/data/raw/plantdoc/`

### 3. Custom Dataset
- **Purpose**: Final tuning with local data
- **Location**: `ml/data/raw/custom/`

## Dataset Pipeline

```
PlantVillage (base training)
    ↓
Filtered & Balanced
    ↓
PlantDoc (real-world adaptation)
    ↓
Custom Data (final tuning)
```

## Preprocessing Steps

1. Download datasets to `backend/ml/data/raw/`
2. Run preprocessing:
   ```bash
   cd backend/ml
   python utils/preprocessing.py
   ```
3. Apply augmentation during training
4. Split into train/val/test (70/15/15)

## Class Distribution

Ensure balanced representation:
- Min 500 samples per class
- Max 2000 samples per class
- Use weighted sampling if imbalanced

## Augmentation Strategy

Apply to handle real-world conditions:
- Gaussian noise (smartphone camera)
- Motion blur (hand shake)
- Brightness/contrast (lighting variations)
- Rotation & scaling (different angles)
