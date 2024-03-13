import torch
import torch.nn as nn
from torchvision import transforms
import torchvision.utils as vutils

from facenet_pytorch import InceptionResnetV1, MTCNN

from lpips import LPIPS  # Assuming LPIPS is available as a module
from PIL import Image
from skimage import color, io

import numpy as np

# Load pre-trained Inception ResNet model
resnet = InceptionResnetV1(pretrained='casia-webface').eval()  # No need to specify 'cuda'
# Initialize MTCNN for face detection
mtcnn = MTCNN(device='cpu')  # Set device to CPU

# Function to convert image to embeddings
def ImageToEmbeddings(img):
    img = img.squeeze(0)  # Add a batch dimension
    print("Input image shape:", img.shape)
    img_cropped = mtcnn(img)  # mtcnn should handle the image on the CPU
    print("Cropped image shape:", img_cropped.shape)
    
    if img_cropped is not None:
        # No need to move cropped image to CUDA
        if img_cropped.dim() == 3:
            img_cropped = img_cropped.unsqueeze(0)
        embeddings = resnet(img_cropped).detach()  # resnet should handle the image on CPU
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
        self.lpips = LPIPS(net='vgg')  # Assuming LPIPS is set up correctly

    def forward(self, x, y, delta_x):
        phi_x_delta = self.feature_extractor(x + delta_x)
        phi_y = self.feature_extractor(y)
        l2_loss = torch.norm(phi_x_delta - phi_y, p=2) ** 2  # L2 norm squared
        lpips_loss = self.lpips(x + delta_x, x)  # Calculate LPIPS
        penalty = torch.maximum(lpips_loss - self.p, torch.tensor(0.0))  # Penalty term
        total_loss = l2_loss + self.alpha * penalty
        return total_loss
    
transform = transforms.Compose([
    transforms.ToTensor(),  # Converts PIL image to tensor
])

# Load the images and convert them to RGB
x_pil = Image.open('file_0.jpg').convert('RGB')
y_pil = Image.open('file_1.jpg').convert('RGB')

x_pil_G_tensor = transform(x_pil)
y_pil_G_tensor = transform(y_pil)

# Set the correct image size for InceptionResnetV1
image_size = (3, 1024, 1024)  # RGB format

# Initialize the CloakGenerator and the CloakLoss
cloak_generator = CloakGenerator(image_size)  # No need to specify 'cuda'
loss_function = CloakLoss(ImageToEmbeddings, alpha=0.1, p=0.3)  # No need to specify 'cuda'
optimizer = torch.optim.Adam(cloak_generator.parameters(), lr=1e-4)

# Define the number of optimization steps
num_steps = 1000

for step in range(num_steps):
    optimizer.zero_grad()

    # Generate the cloaked image
    x_cloaked = cloak_generator(x_pil_G_tensor)

    # Get the embeddings for the cloaked and target images
    x_cloaked_embeddings = ImageToEmbeddings(x_cloaked)
    y_embeddings = ImageToEmbeddings(y_pil)

    # Calculate the loss using the embeddings
    loss = loss_function(x_cloaked_embeddings, y_embeddings, cloak_generator.cloak)

    # Backpropagation
    loss.backward()
    optimizer.step()

    # Print the loss every 100 steps
    if step % 100 == 0:
        print(f'Step {step}: Loss = {loss.item()}')

# After the loop, you can get the final cloaked image tensor
final_cloaked_image = cloak_generator(x_pil_G_tensor)
