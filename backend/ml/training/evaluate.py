import torch
from torch.utils.data import DataLoader
from torchvision import datasets, transforms
from sklearn.metrics import classification_report, confusion_matrix
import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from ml.models.resnet_model import create_model

def evaluate_model(model_path: str, data_dir: str, num_classes: int):
    """Evaluate trained model on test set."""
    
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
    
    # Load model
    model = create_model(num_classes=num_classes)
    model.load_state_dict(torch.load(model_path))
    model = model.to(device)
    model.eval()
    
    # Test transform
    test_transform = transforms.Compose([
        transforms.Resize(256),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    
    # TODO: Load test dataset
    # test_dataset = datasets.ImageFolder(f"{data_dir}/test", transform=test_transform)
    # test_loader = DataLoader(test_dataset, batch_size=32, shuffle=False)
    
    # Evaluate
    # all_preds = []
    # all_labels = []
    
    # with torch.no_grad():
    #     for inputs, labels in test_loader:
    #         inputs, labels = inputs.to(device), labels.to(device)
    #         outputs = model(inputs)
    #         _, preds = torch.max(outputs, 1)
    #         
    #         all_preds.extend(preds.cpu().numpy())
    #         all_labels.extend(labels.cpu().numpy())
    
    # Print metrics
    # print(classification_report(all_labels, all_preds))
    # print(confusion_matrix(all_labels, all_preds))
    
    print("Evaluation complete (TODO: Implement full evaluation)")

if __name__ == "__main__":
    evaluate_model(
        model_path="../saved_models/resnet_plant_disease.pth",
        data_dir="../data/processed",
        num_classes=38
    )
