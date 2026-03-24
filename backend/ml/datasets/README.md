# Dataset Setup

## Required Datasets

### 1. PlantVillage Dataset
- **Purpose**: Initial training with clean laboratory images
- **Classes**: 38 plant disease categories
- **Images**: ~54,000 images
- **Source**: GitHub / Kaggle
- **Download**: 
  - GitHub: https://github.com/spMohanty/PlantVillage-Dataset
  - Kaggle: https://www.kaggle.com/datasets/emmarex/plantdisease
- **Location**: `backend/ml/data/raw/plantvillage/`

### 2. PlantDoc Dataset
- **Purpose**: Real-world fine-tuning with field images
- **Classes**: 27 classes across 13 plant species
- **Images**: 2,598 images from real agricultural fields
- **Source**: GitHub
- **Download**: https://github.com/pratikkayal/PlantDoc-Dataset
- **Location**: `backend/ml/data/raw/plantdoc/`
- **Paper**: https://arxiv.org/abs/1911.10317

### 3. Plant Leaf Disease Classification Dataset
- **Purpose**: Additional training data with diverse plant diseases
- **Classes**: Multiple plant disease categories
- **Source**: GitHub
- **Download**: https://github.com/GauthamSree/Plant-Leaf-Disease-Classification
- **Location**: `backend/ml/data/raw/plant-leaf-disease/`
- **Features**: Pre-processed and ready for training

### 4. Custom Dataset (Optional)
- **Purpose**: Final tuning with local/regional data
- **Location**: `backend/ml/data/raw/custom/`

## Quick Setup

### Automated Download (Recommended)

All three datasets can be downloaded automatically from GitHub:

```bash
cd backend/ml
python datasets/download_datasets.py
```

This will:
- Clone PlantVillage dataset from GitHub (~54,000 images)
- Clone PlantDoc dataset from GitHub (~2,600 images)
- Clone Plant Leaf Disease Classification dataset from GitHub
- Create proper directory structure
- Verify downloads

### Manual Download (Alternative)

**PlantVillage:**
```bash
cd backend/ml/data/raw
git clone https://github.com/spMohanty/PlantVillage-Dataset.git plantvillage
```

**PlantDoc:**
```bash
cd backend/ml/data/raw
git clone https://github.com/pratikkayal/PlantDoc-Dataset.git plantdoc
```

**Plant Leaf Disease Classification:**
```bash
cd backend/ml/data/raw
git clone https://github.com/GauthamSree/Plant-Leaf-Disease-Classification.git plant-leaf-disease
```

## Dataset Pipeline

```
PlantVillage (clean lab images)
    ↓
Data Cleaning & Balancing
    ↓
PlantDoc (real-world field images)
    ↓
Domain Adaptation Training
    ↓
Custom Data (optional local data)
    ↓
Final Model
```

## Preprocessing Steps

1. Download datasets to `backend/ml/data/raw/`
2. Run preprocessing:
   ```bash
   cd backend/ml
   python utils/preprocessing.py
   ```
3. Processed data will be saved to `backend/ml/data/processed/`
4. Split into train/val/test (70/15/15)

## Class Mapping

PlantDoc classes include:
- Apple (Scab, Rust, Multiple diseases)
- Bell Pepper (Bacterial spot, Healthy)
- Blueberry (Healthy)
- Cherry (Powdery mildew, Healthy)
- Corn (Gray leaf spot, Common rust, Northern leaf blight, Healthy)
- Grape (Black rot, Esca, Leaf blight, Healthy)
- Peach (Bacterial spot, Healthy)
- Potato (Early blight, Late blight, Healthy)
- Raspberry (Healthy)
- Soybean (Healthy)
- Squash (Powdery mildew)
- Strawberry (Leaf scorch, Healthy)
- Tomato (Bacterial spot, Early blight, Late blight, Leaf mold, Septoria leaf spot, Spider mites, Target spot, Yellow leaf curl virus, Mosaic virus, Healthy)

## Augmentation Strategy

Applied during training to handle real-world conditions:
- Random rotation (±15°)
- Horizontal/vertical flips
- Gaussian noise (smartphone camera simulation)
- Motion blur (hand shake simulation)
- Brightness/contrast adjustment (lighting variations)
- Random cropping and scaling

## Training Strategy

1. **Stage 1**: Train on PlantVillage (clean images)
   - Epochs: 15-20
   - Learning rate: 0.001
   
2. **Stage 2**: Fine-tune on PlantDoc (real-world images)
   - Epochs: 10-15
   - Learning rate: 0.0001 (lower for fine-tuning)
   
3. **Stage 3**: Optional custom data fine-tuning
   - Epochs: 5-10
   - Learning rate: 0.00001

## Expected Performance

- PlantVillage only: ~95% accuracy (but poor on real images)
- PlantVillage + PlantDoc: ~85-90% accuracy (better generalization)
- With custom data: ~90-95% accuracy (domain-specific)

