import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
import json
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from ml.models.resnet_model import create_model

def train_model(
    data_dir: str,
    num_classes: int,
    num_epochs: int = 25,
    batch_size: int = 32,
    learning_rate: float = 0.001
):
    """Train ResNet model on plant disease dataset."""
    
    # Device configuration
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    print(f"Using device: {device}")
    
    # Data transforms
    train_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.RandomCrop(224),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(15),
        transforms.ColorJitter(brightness=0.2, contrast=0.2),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    val_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # TODO: Load datasets
    # train_dataset = datasets.ImageFolder(f"{data_dir}/train", transform=train_transform)
    # val_dataset = datasets.ImageFolder(f"{data_dir}/val", transform=val_transform)
    
    # train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    # val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)
    
    # Create model
    model = create_model(num_classes=num_classes, architecture="resnet18")
    model = model.to(device)
    
    # Loss and optimizer
    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=learning_rate)
    scheduler = optim.lr_scheduler.StepLR(optimizer, step_size=7, gamma=0.1)
    
    # TODO: Training loop
    # for epoch in range(num_epochs):
    #     model.train()
    #     running_loss = 0.0
    #     
    #     for inputs, labels in train_loader:
    #         inputs, labels = inputs.to(device), labels.to(device)
    #         
    #         optimizer.zero_grad()
    #         outputs = model(inputs)
    #         loss = criterion(outputs, labels)
    #         loss.backward()
    #         optimizer.step()
    #         
    #         running_loss += loss.item()
    #     
    #     scheduler.step()
    #     print(f"Epoch {epoch+1}/{num_epochs}, Loss: {running_loss/len(train_loader):.4f}")
    
    # Save model
    # torch.save(model.state_dict(), '../saved_models/resnet_plant_disease.pth')
    
    print("Training complete (TODO: Implement full training loop)")

if __name__ == "__main__":
    train_model(
        data_dir="../data/processed",
        num_classes=38,  # PlantVillage has 38 classes
        num_epochs=25
    )

    # Save class names for inference
    # class_names = train_dataset.classes
    # with open('../saved_models/class_names.json', 'w') as f:
    #     json.dump(class_names, f)
    
    print("Training complete (TODO: Implement full training loop)")
