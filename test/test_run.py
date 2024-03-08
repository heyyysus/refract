import torch
import torch.nn as nn
from facenet_pytorch import InceptionResnetV1, MTCNN
from lpips import LPIPS  # Assuming LPIPS is available as a module
from PIL import Image
from skimage import color
from skimage import io

transform = transforms.Compose([
    transforms.ToTensor(),  # Converts PIL image to tensor
])

# Load the images and convert them to grayscale
x_pil = Image.open('file_0.jpg')
y_pil = Image.open('file_1.jpg')

x_pil_G_tensor = transform(x_pil.convert('L')).cuda()
y_pil_G_tensor = transform(y_pil.convert('L')).cuda()


# Set the correct image size for InceptionResnetV1
image_size = (1024, 1)

# Initialize the CloakGenerator and the CloakLoss
cloak_generator = CloakGenerator(image_size).to('cuda')
loss_function = CloakLoss(ImageToEmbeddings, alpha=0.1, p=0.3).to('cuda')
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
final_cloaked_image = cloak_generator(x_pil)