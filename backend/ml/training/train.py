import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import json
import os
import sys
from pathlib import Path

# Add parent directory to path for imports
current_dir = os.path.dirname(os.path.abspath(__file__))
ml_dir = os.path.dirname(current_dir)
backend_dir = os.path.dirname(ml_dir)
sys.path.insert(0, backend_dir)

from ml.models.resnet_model import create_model

def get_data_loaders(data_dir: str, batch_size: int = 32):
    """Create data loaders for training and validation."""
    
    # Data transforms with augmentation for training
    train_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.RandomCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomVerticalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Validation transform (no augmentation)
    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # Load datasets
    train_dataset = datasets.ImageFolder(data_dir, transform=train_transform)
    
    # Split into train and validation (80/20)
    train_size = int(0.8 * len(train_dataset))
    val_size = len(train_dataset) - train_size
    train_dataset, val_dataset = torch.utils.data.random_split(
        train_dataset, [train_size, val_size]
    )
    
    # Apply validation transform to validation set
    val_dataset.dataset.transform = val_transform
    
    # Create data loaders
    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        shuffle=True,
        num_workers=0,  # Set to 0 for Windows compatibility
        pin_memory=True
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=0,
        pin_memory=True
    )
    
    return train_loader, val_loader, train_dataset.dataset.classes

def train_epoch(model, train_loader, criterion, optimizer, device):
    """Train for one epoch."""
    model.train()
    running_loss = 0.0
    correct = 0
    total = 0
    
    for batch_idx, (inputs, labels) in enumerate(train_loader):
        inputs, labels = inputs.to(device), labels.to(device)
        
        # Zero gradients
        optimizer.zero_grad()
        
        # Forward pass
        outputs = model(inputs)
        loss = criterion(outputs, labels)
        
        # Backward pass
        loss.backward()
        optimizer.step()
        
        # Statistics
        running_loss += loss.item()
        _, predicted = outputs.max(1)
        total += labels.size(0)
        correct += predicted.eq(labels).sum().item()
        
        if (batch_idx + 1) % 10 == 0:
            print(f'  Batch [{batch_idx+1}/{len(train_loader)}] '
                  f'Loss: {loss.item():.4f} '
                  f'Acc: {100.*correct/total:.2f}%')
    
    epoch_loss = running_loss / len(train_loader)
    epoch_acc = 100. * correct / total
    return epoch_loss, epoch_acc

def validate(model, val_loader, criterion, device):
    """Validate the model."""
    model.eval()
    running_loss = 0.0
    correct = 0
    total = 0
    
    with torch.no_grad():
        for inputs, labels in val_loader:
            inputs, labels = inputs.to(device), labels.to(device)
            
            outputs = model(inputs)
            loss = criterion(outputs, labels)
            
            running_loss += loss.item()
            _, predicted = outputs.max(1)
            total += labels.size(0)
            correct += predicted.eq(labels).sum().item()
    
    val_loss = running_loss / len(val_loader)
    val_acc = 100. * correct / total
    return val_loss, val_acc

def train_model(
    data_dir: str,
    num_epochs: int = 25,
    batch_size: int = 32,
    learning_rate: float = 0.001,
    save_dir: str = None
):
    """Train ResNet34 model on plant disease dataset."""
    
    print("="*60)
    print("AgroSight - ResNet34 Training")
    print("="*60 + "\n")
    
    # Device configuration
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    if torch.cuda.is_available():
        print(f"GPU: {torch.cuda.get_device_name(0)}")
        print(f"Memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
        # Enable cuDNN benchmarking for faster training
        torch.backends.cudnn.benchmark = True
    print()
    
    # Set save directory
    if save_dir is None:
        script_dir = Path(__file__).parent.absolute()
        ml_dir = script_dir.parent
        save_dir = ml_dir / "saved_models"
    
    save_dir = Path(save_dir)
    
    # Load data
    print("Loading datasets...")
    train_loader, val_loader, class_names = get_data_loaders(data_dir, batch_size)
    num_classes = len(class_names)
    
    print(f"Number of classes: {num_classes}")
    print(f"Training samples: {len(train_loader.dataset)}")
    print(f"Validation samples: {len(val_loader.dataset)}\n")
    
    # Create model
    print("Creating ResNet34 model...")
    model = create_model(num_classes=num_classes, architecture="resnet34")
    model = model.to(device)
    print(f"Model created with {num_classes} output classes\n")
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)
    
    # Training loop
    best_val_acc = 0.0
    
    print("Starting training...\n")
    for epoch in range(num_epochs):
        print(f"Epoch [{epoch+1}/{num_epochs}]")
        print("-" * 60)
        
        # Train
        train_loss, train_acc = train_epoch(model, train_loader, criterion, optimizer, device)
        
        # Validate
        val_loss, val_acc = validate(model, val_loader, criterion, device)
        
        # Update learning rate
        scheduler.step()
        
        print(f"Train Loss: {train_loss:.4f} | Train Acc: {train_acc:.2f}%")
        print(f"Val Loss: {val_loss:.4f} | Val Acc: {val_acc:.2f}%\n")
        
        # Save best model
        if val_acc > best_val_acc:
            best_val_acc = val_acc
            save_dir.mkdir(parents=True, exist_ok=True)
            model_path = save_dir / "resnet34_plant_disease_best.pth"
            torch.save(model.state_dict(), model_path)
            print(f"✓ Best model saved with validation accuracy: {val_acc:.2f}%\n")
    
    # Save final model
    final_model_path = save_dir / "resnet34_plant_disease_final.pth"
    torch.save(model.state_dict(), final_model_path)
    
    # Save class names
    class_names_path = save_dir / "class_names.json"
    with open(class_names_path, 'w') as f:
        json.dump(class_names, f, indent=2)
    
    print("="*60)
    print("Training Complete!")
    print("="*60)
    print(f"Best validation accuracy: {best_val_acc:.2f}%")
    print(f"Model saved to: {model_path}")
    print(f"Class names saved to: {class_names_path}")
    print("="*60 + "\n")

if __name__ == "__main__":
    # Get absolute paths
    script_dir = Path(__file__).parent.absolute()
    ml_dir = script_dir.parent
    raw_dir = ml_dir / "data" / "raw"
    
    # Try to find available datasets in order of preference
    possible_datasets = [
        raw_dir / "plant-leaf-disease" / "dataset",
        raw_dir / "plant-leaf-disease" / "train",
        raw_dir / "New Plant Diseases Dataset(Augmented)" / "New Plant Diseases Dataset(Augmented)" / "train",
        raw_dir / "plantvillage" / "raw" / "color",
        raw_dir / "plantvillage" / "data_distribution_for_SVM" / "train",
    ]
    
    data_dir = None
    for dataset_path in possible_datasets:
        if dataset_path.exists():
            data_dir = dataset_path
            break
    
    if data_dir is None:
        print("Error: No suitable dataset found!")
        print("\nSearched for datasets in:")
        for path in possible_datasets:
            print(f"  - {path}")
        print("\nAvailable directories in raw/:")
        if raw_dir.exists():
            for item in raw_dir.iterdir():
                if item.is_dir():
                    print(f"  - {item.name}")
        print("\nPlease download datasets using:")
        print("  python datasets/download_datasets.py")
        sys.exit(1)
    
    print(f"Using dataset: {data_dir}\n")
    
    # Check GPU availability
    if torch.cuda.is_available():
        print(f"GPU detected: {torch.cuda.get_device_name(0)}")
        print(f"GPU memory: {torch.cuda.get_device_properties(0).total_memory / 1024**3:.2f} GB")
        print("Training will use GPU for faster performance.\n")
    else:
        print("No GPU detected. Training will use CPU (this will be slower).")
        print("Consider using Google Colab or a cloud GPU for faster training.\n")
    
    # Start training
    train_model(
        data_dir=str(data_dir),
        num_epochs=20,  # Adjust based on your needs
        batch_size=32,  # Reduce if you run out of GPU memory
        learning_rate=0.001
    )
