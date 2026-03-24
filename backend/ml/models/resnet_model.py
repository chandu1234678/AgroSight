import torch
import torch.nn as nn
from torchvision import models

class PlantDiseaseResNet(nn.Module):
    """ResNet-based model for plant disease classification."""
    
    def __init__(self, num_classes: int, pretrained: bool = True):
        super(PlantDiseaseResNet, self).__init__()
        
        # Load pretrained ResNet18
        self.resnet = models.resnet18(pretrained=pretrained)
        
        # Replace final layer
        num_features = self.resnet.fc.in_features
        self.resnet.fc = nn.Linear(num_features, num_classes)
    
    def forward(self, x):
        return self.resnet(x)

def create_model(num_classes: int, architecture: str = "resnet18") -> nn.Module:
    """Create ResNet model with custom classifier."""
    if architecture == "resnet18":
        model = models.resnet18(pretrained=True)
    elif architecture == "resnet34":
        model = models.resnet34(pretrained=True)
    else:
        raise ValueError(f"Unsupported architecture: {architecture}")
    
    # Freeze early layers (optional)
    # for param in model.parameters():
    #     param.requires_grad = False
    
    # Replace classifier
    num_features = model.fc.in_features
    model.fc = nn.Linear(num_features, num_classes)
    
    return model

def export_to_torchscript(model: nn.Module, save_path: str):
    """Export model to TorchScript format."""
    model.eval()
    example_input = torch.rand(1, 3, 224, 224)
    traced_model = torch.jit.trace(model, example_input)
    traced_model.save(save_path)

def export_to_onnx(model: nn.Module, save_path: str):
    """Export model to ONNX format."""
    model.eval()
    dummy_input = torch.randn(1, 3, 224, 224)
    torch.onnx.export(
        model,
        dummy_input,
        save_path,
        export_params=True,
        opset_version=11,
        input_names=['input'],
        output_names=['output']
    )
