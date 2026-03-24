# ML Module

This module contains the machine learning pipeline for plant disease detection.

## Structure

- `data/` - Raw and processed datasets
- `datasets/` - Dataset documentation
- `models/` - Model architectures (ResNet)
- `training/` - Training and evaluation scripts
- `utils/` - Augmentation and preprocessing utilities
- `notebooks/` - Jupyter notebooks for experimentation
- `saved_models/` - Trained model weights

## Dependencies

All ML dependencies are included in `backend/requirements.txt`.

## Training

```bash
cd backend/ml
python training/train.py
```

## Evaluation

```bash
python training/evaluate.py
```

## Model Export

Models are saved in `saved_models/` directory:
- `resnet_plant_disease.pth` - PyTorch weights
- `class_names.json` - Class label mapping

## Integration

The backend service (`app/services/ai_model.py`) loads models from this directory for inference.
