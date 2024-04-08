from facenet_pytorch import InceptionResnetV1, MTCNN
from torchvision import transforms
import numpy as np
import matplotlib.pyplot as plt
from PIL import Image

import sys

use_gpu = False

resnet = InceptionResnetV1(pretrained='casia-webface').eval()

mtcnn = MTCNN(device='cuda:0' if use_gpu else 'cpu')

def ImageToEmbeddings(img):
    # Check if the tensor has a batch dimension and select the first image
    if img.dim() == 4:
        img = img.squeeze(0)  # Remove the batch dimension assuming it's the first dimension

    # Convert tensor to PIL Image
    img = img.detach()  # Detach from the computation graph
    if img.is_cuda:
        img = img.cpu()

    img = (img + 1) / 2

    transform_to_pil = transforms.ToPILImage()
    pil_img = transform_to_pil(img)

    img_cropped = mtcnn(pil_img)  # mtcnn should handle the image on the CPU, and it only takes PIL RGB images

    if img_cropped is not None:
        if use_gpu:
            img_cropped = img_cropped.cuda()
        if img_cropped.dim() == 3:
            img_cropped = img_cropped.unsqueeze(0)
        embeddings = resnet(img_cropped).detach()  # resnet should handle the image on CUDA
        return embeddings
    else:
        # If no face is detected, return None or handle accordingly
        print("no face")
        return None
    
if __name__ == "__main__":

    if len(sys.argv) != 4:
        print("Usage: python test.py <orig_image> <target_image> <cloaked_image>")
        sys.exit(1)

    orig_path = sys.argv[1]
    target_path = sys.argv[2]
    cloaked_path = sys.argv[3]

    transform_pipeline = transforms.Compose([
        transforms.Resize((1024, 1024)),  # Resize to the required input size of the model
        transforms.ToTensor(),  # Convert to tensor and scale to [0, 1]
    ])

    orig = transform_pipeline(Image.open(orig_path).convert('RGB')).unsqueeze(0)
    target = transform_pipeline(Image.open(target_path).convert('RGB')).unsqueeze(0)
    cloaked = transform_pipeline(Image.open(cloaked_path).convert('RGB')).unsqueeze(0)

    orig_embeddings = ImageToEmbeddings(orig)
    target_embeddings = ImageToEmbeddings(target)
    cloaked_embeddings = ImageToEmbeddings(cloaked)

    print("Original embeddings: ", orig_embeddings)
    print("Target embeddings: ", target_embeddings)
    print("Cloaked embeddings: ", cloaked_embeddings)

    orig_target_dist = (orig_embeddings - target_embeddings).norm().item()
    cloaked_target_dist = (cloaked_embeddings - target_embeddings).norm().item()
    cloaked_orig_dist = (cloaked_embeddings - orig_embeddings).norm().item()

    print("Original-Target distance: ", orig_target_dist)
    print("Cloaked-Target distance: ", cloaked_target_dist)
    print("Cloaked-Original distance: ", cloaked_orig_dist)