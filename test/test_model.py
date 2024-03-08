import torch
import torch.nn as nn
from facenet_pytorch import InceptionResnetV1, MTCNN
from lpips import LPIPS  # Assuming LPIPS is available as a module
from PIL import Image
from skimage import color
from skimage import io

# Load pre-trained Inception ResNet model
# resnet = InceptionResnetV1(pretrained='casia-webface').eval().to('cuda')
resnet = InceptionResnetV1(pretrained='casia-webface').eval()
# Initialize MTCNN for face detection
# mtcnn = MTCNN(device='cuda:0')
mtcnn = MTCNN()

# Function to convert image to embeddings
def ImageToEmbeddings(img):
    img_cropped = None
    try:
      img_cropped = mtcnn(img)  # mtcnn should handle the image on the CPU
    except:
      print("Error mtcnn")

      exit(1)
    if img_cropped is not None:
        # img_cropped = img_cropped.to('cuda')  # Move cropped image to CUDA
        img_cropped = img_cropped
        if img_cropped.dim() == 3:
            img_cropped = img_cropped.unsqueeze(0)
        print(img_cropped)
        embeddings = resnet(img_cropped).detach()
        return embeddings
    else:
        # If no face is detected, return None or handle accordingly
        return None

# Define the Cloak Generator model
class CloakGenerator(nn.Module):
    def __init__(self, image_size):
        super(CloakGenerator, self).__init__()
        self.cloak = nn.Parameter(torch.zeros(1, 3, *image_size))  # Learnable cloak parameter

    def forward(self, x):
        return x + self.cloak  # Add cloak to input image

# Define the Loss Function
class CloakLoss(nn.Module):
    def __init__(self, feature_extractor, alpha, p):
        super(CloakLoss, self).__init__()
        self.feature_extractor = feature_extractor
        self.alpha = alpha
        self.p = p
        # self.lpips = LPIPS(net='vgg').to('cuda')  # Assuming LPIPS is set up correctly
        self.lpips = LPIPS(net='vgg')  # Assuming LPIPS is set up correctly

    def forward(self, x, y, delta_x):
        phi_x_delta = self.feature_extractor(x + delta_x)
        phi_y = self.feature_extractor(y)
        l2_loss = torch.norm(phi_x_delta - phi_y, p=2) ** 2  # L2 norm squared
        lpips_loss = self.lpips(x + delta_x, x)  # Calculate LPIPS
        # penalty = torch.maximum(lpips_loss - self.p, torch.tensor(0.0).to(x.device))  # Penalty term
        penalty = torch.maximum(lpips_loss - self.p, torch.tensor(0.0))  # Penalty term
        total_loss = l2_loss + self.alpha * penalty
        return total_loss