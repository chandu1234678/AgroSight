# How Disease Detection Works in AgroSight

## Overview

AgroSight uses a **Deep Learning CNN (Convolutional Neural Network)** model based on **ResNet34 architecture** to detect plant diseases from leaf images.

## The Complete Process

### 1. Training Phase (Current - In Progress)

#### Dataset
- **Total Images**: 105,424 images
- **Classes**: 38 different plant diseases + healthy plants
- **Split**: 
  - Training: 75,494 images (71.6%)
  - Validation: 14,931 images (14.2%)
  - Test: 14,999 images (14.2%)

#### What the Model Learns
The model learns to recognize **38 different conditions** across **15 plant types**:

**Crops Covered:**
1. Apple (4 conditions)
2. Blueberry (1 condition)
3. Cherry (2 conditions)
4. Corn/Maize (4 conditions)
5. Grape (4 conditions)
6. Orange (1 condition)
7. Peach (2 conditions)
8. Pepper/Bell (2 conditions)
9. Potato (3 conditions)
10. Raspberry (1 condition)
11. Soybean (1 condition)
12. Squash (1 condition)
13. Strawberry (2 conditions)
14. Tomato (10 conditions)

**Complete Disease List (38 Classes):**

1. Apple_Apple_scab
2. Apple_Black_rot
3. Apple_Cedar_apple_rust
4. Apple_healthy
5. Blueberry_healthy
6. Cherry_Powdery_mildew
7. Cherry_healthy
8. Corn_Cercospora_leaf_spot
9. Corn_Common_rust
10. Corn_Northern_Leaf_Blight
11. Corn_healthy
12. Grape_Black_rot
13. Grape_Esca_(Black_Measles)
14. Grape_Leaf_blight
15. Grape_healthy
16. Orange_Haunglongbing_(Citrus_greening)
17. Peach_Bacterial_spot
18. Peach_healthy
19. Pepper_bell_Bacterial_spot
20. Pepper_bell_healthy
21. Potato_Early_blight
22. Potato_Late_blight
23. Potato_healthy
24. Raspberry_healthy
25. Soybean_healthy
26. Squash_Powdery_mildew
27. Strawberry_Leaf_scorch
28. Strawberry_healthy
29. Tomato_Bacterial_spot
30. Tomato_Early_blight
31. Tomato_Late_blight
32. Tomato_Leaf_Mold
33. Tomato_Septoria_leaf_spot
34. Tomato_Spider_mites
35. Tomato_Target_Spot
36. Tomato_Yellow_Leaf_Curl_Virus
37. Tomato_mosaic_virus
38. Tomato_healthy

#### Training Process
```
Input: 75,494 training images
    ↓
ResNet34 Neural Network (23 million parameters)
    ↓
Learning: 20 epochs
    ↓
Validation: 14,931 images
    ↓
Output: Trained model (.pth file)
```

**Current Training Status:**
- Model: ResNet34
- Epochs: 20
- Expected Accuracy: 94-97%
- Training Time: ~25-35 minutes
- GPU: RTX 4050 (6GB VRAM)

### 2. Inference Phase (After Training Completes)

#### Step-by-Step Detection Process

**Step 1: User Uploads Image**
```
User uploads plant leaf photo → Backend receives image
```

**Step 2: Image Preprocessing**
```python
# Image is preprocessed to match training format
1. Resize to 256x256 pixels
2. Center crop to 224x224 pixels
3. Convert to tensor
4. Normalize with ImageNet mean/std
   - Mean: [0.485, 0.456, 0.406]
   - Std: [0.229, 0.224, 0.225]
```

**Step 3: Model Inference**
```python
# Model processes the image
1. Load trained ResNet34 model
2. Pass preprocessed image through network
3. Get output: 38 probability scores (one per class)
4. Apply softmax to convert to percentages
```

**Step 4: Get Prediction**
```python
# Extract the result
1. Find highest probability score
2. Get corresponding disease class
3. Return disease name + confidence score
```

**Example:**
```
Input: tomato_leaf.jpg
    ↓
Preprocessing: 224x224 normalized tensor
    ↓
Model Output: [0.02, 0.01, 0.94, 0.01, ...] (38 values)
                              ↑
                         Index 30 (highest)
    ↓
Result: "Tomato_Late_blight" with 94% confidence
```

### 3. How It Recognizes Diseases

#### What the Model Learns

The CNN learns **visual patterns** that distinguish each disease:

**For Tomato Late Blight:**
- Dark brown/black lesions on leaves
- Water-soaked appearance
- White fuzzy growth on undersides
- Irregular shaped spots
- Rapid spreading pattern

**For Apple Scab:**
- Olive-green to brown spots
- Velvety texture
- Circular lesions
- Leaf curling
- Fruit scarring

**For Corn Rust:**
- Orange-brown pustules
- Raised bumps on leaves
- Scattered distribution
- Elongated spots
- Leaf discoloration

#### Feature Extraction

ResNet34 has **34 layers** that progressively learn:

**Early Layers (1-10):**
- Edges and lines
- Colors and textures
- Basic shapes

**Middle Layers (11-25):**
- Leaf patterns
- Spot shapes
- Lesion textures
- Color combinations

**Deep Layers (26-34):**
- Disease-specific patterns
- Complex combinations
- Distinguishing features
- Final classification

### 4. Confidence Score

The model outputs a **confidence score** (0-100%):

**High Confidence (>85%):**
- Clear disease symptoms
- Good image quality
- Well-lit photo
- Focused on affected area

**Medium Confidence (70-85%):**
- Some symptoms visible
- Moderate image quality
- Partial view of disease

**Low Confidence (<70%):**
- Unclear symptoms
- Poor image quality
- Multiple diseases present
- Unusual presentation

### 5. Real-World Example

**User uploads tomato leaf image:**

```
1. Image Upload
   └─> tomato_leaf_with_spots.jpg

2. Preprocessing
   └─> Resize, crop, normalize
   └─> Convert to tensor [1, 3, 224, 224]

3. Model Inference
   └─> Pass through ResNet34
   └─> Get 38 probability scores:
       [0.01, 0.02, 0.03, ..., 0.92, ..., 0.01]
                                 ↑
                            Index 30

4. Post-processing
   └─> Index 30 = "Tomato_Late_blight"
   └─> Confidence = 92%
   └─> Severity = "high" (based on confidence)

5. Get Disease Info
   └─> Look up in disease database
   └─> Get treatment recommendations
   └─> Get prevention tips

6. Return to User
   └─> Disease: Tomato Late Blight
   └─> Confidence: 92%
   └─> Organic Treatment: Copper fungicide
   └─> Chemical Treatment: Mancozeb
   └─> Prevention: Proper spacing, avoid overhead watering
```

### 6. Why ResNet34?

**Advantages:**
1. **Deep enough**: 34 layers capture complex patterns
2. **Not too deep**: Faster than ResNet50/101
3. **Residual connections**: Prevents vanishing gradients
4. **Proven accuracy**: 94-97% on plant disease datasets
5. **Efficient**: Works well on GPU and CPU

**Architecture:**
```
Input (224x224x3)
    ↓
Conv Layer + BatchNorm + ReLU
    ↓
Max Pooling
    ↓
Residual Block 1 (3 layers) x 3
    ↓
Residual Block 2 (4 layers) x 4
    ↓
Residual Block 3 (6 layers) x 6
    ↓
Residual Block 4 (3 layers) x 3
    ↓
Global Average Pooling
    ↓
Fully Connected Layer (38 outputs)
    ↓
Softmax
    ↓
Output: [prob1, prob2, ..., prob38]
```

### 7. Accuracy Expectations

Based on similar datasets and ResNet34:

**Expected Performance:**
- Overall Accuracy: 94-97%
- Top-3 Accuracy: 98-99%
- Inference Time: 200-500ms (GPU), 1-2s (CPU)

**Per-Disease Accuracy (estimated):**
- Common diseases (>5000 images): 96-98%
- Medium diseases (2000-5000 images): 93-96%
- Rare diseases (<2000 images): 88-93%

**Most Accurate (lots of training data):**
- Tomato diseases: 96-98%
- Corn diseases: 95-97%
- Apple diseases: 94-96%

### 8. Limitations

**What the model CAN detect:**
✅ 38 specific plant diseases
✅ Healthy vs diseased plants
✅ Disease severity (via confidence)
✅ Multiple crops

**What the model CANNOT detect:**
❌ Diseases not in training data
❌ Pests (unless in training data)
❌ Nutrient deficiencies
❌ Environmental stress
❌ New/emerging diseases

### 9. Integration with Backend

**Current Code (Mock):**
```python
# Returns random disease for testing
return {
    "disease": random.choice(diseases),
    "confidence": random.uniform(0.75, 0.98)
}
```

**After Training (Real):**
```python
# Load model
model = models.resnet34(pretrained=False)
model.fc = nn.Linear(model.fc.in_features, 38)
model.load_state_dict(torch.load('model.pth'))
model.eval()

# Preprocess image
image = Image.open(file).convert('RGB')
image_tensor = transform(image).unsqueeze(0)

# Predict
with torch.no_grad():
    outputs = model(image_tensor)
    probabilities = F.softmax(outputs, dim=1)
    confidence, predicted = torch.max(probabilities, 1)

# Return result
disease = class_names[predicted.item()]
confidence_score = confidence.item()

return {
    "disease": disease,
    "confidence": confidence_score
}
```

### 10. Next Steps

**When Training Completes:**

1. **Save Model**
   - Model file: `resnet34_plant_disease_best.pth`
   - Class names: `class_names.json`
   - Location: `backend/ml/saved_models/`

2. **Update Code**
   - Uncomment real prediction code
   - Remove mock predictions
   - Test with real images

3. **Test Accuracy**
   - Use test set (14,999 images)
   - Verify 94-97% accuracy
   - Check per-class performance

4. **Deploy**
   - Integrate with API
   - Test end-to-end
   - Monitor performance

## Summary

**How it works:**
1. User uploads leaf image
2. Image preprocessed (resize, normalize)
3. ResNet34 model analyzes image
4. Model outputs 38 probability scores
5. Highest score = predicted disease
6. Return disease name + confidence
7. Look up treatment info
8. Display to user

**Why it's accurate:**
- 105,424 training images
- 38 well-defined classes
- ResNet34 architecture
- 20 epochs of training
- Data augmentation
- Validation during training

**Current Status:**
- ⏳ Model training in progress
- 🔄 Using mock predictions for testing
- ✅ Infrastructure ready
- ✅ API endpoints working
- ⏳ Waiting for trained model

**Expected Result:**
- 94-97% accuracy
- Fast inference (<2s)
- Reliable predictions
- Production-ready
