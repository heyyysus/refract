import torch
import torch.nn as nn
from torchvision import transforms

from facenet_pytorch import InceptionResnetV1, MTCNN

import lpips
from PIL import Image

use_gpu = False

# Load pre-trained Inception ResNet model
resnet = InceptionResnetV1(pretrained='casia-webface').eval()
if use_gpu:
    resnet.cuda()

# Initialize MTCNN for face detection
mtcnn = MTCNN(device='cuda:0' if use_gpu else 'cpu')

# no longer resizing, since we are cropping the image
toTensor = transforms.Compose([
    transforms.ToTensor(),  # Convert to tensor and scale to [0, 1]
])

def FacePipeline(img_path, req_grad=False, use_gpu=False, noise=0):
    img = Image.open(img_path).convert('RGB')
    box, _ = mtcnn.detect(img)
    if box is not None:
        img = img.crop(box[0].astype(int))
    img = toTensor(img).unsqueeze(0)

    if use_gpu:
        img = img.cuda()
    
    img = img * 2 - 1  # Normalize to [-1, 1]
    img = torch.clamp(img + noise * torch.randn_like(img), -1, 1)

    if req_grad:
        return (img.clone().detach().requires_grad_(True), box)
    return (img.detach(), box)

# Function to convert image to embeddings, input tensor [1, 3, 1024, 1024]
def ImageToEmbeddings(img):
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

# Define the Loss Function
class CloakLoss(nn.Module):
    def __init__(self, alpha, p, x, phi_x):
        super(CloakLoss, self).__init__()
        self.alpha = alpha
        self.p = p
        self.x = x
        self.phi_x = phi_x
        self.lpips = lpips.LPIPS(net='alex')
        if use_gpu:
            self.lpips = self.lpips.cuda()

    def forward(self, x_cloaked):
        phi_x_cloaked = ImageToEmbeddings(x_cloaked)

        if phi_x_cloaked is None:
            return None

        # phi_x_cloaked.requires_grad = True
        # phi_y.requires_grad = True

        l2_gain = torch.norm(phi_x_cloaked - self.phi_x, p=2) ** 2  # L2 norm squared

        # lpips only takes normalized [1, 3, x, x] tensor from [-1, 1], but ours is [0, 1]
        x_cloaked_cropped_normalized = 2 * x_cloaked - 1
        x_cropped_normalized = 2 * self.x - 1

        lpips_loss = self.lpips.forward(x_cloaked_cropped_normalized, x_cropped_normalized)  # Calculate LPIPS

        penalty = torch.maximum(lpips_loss - self.p, torch.tensor(0.0).to(x_cloaked.device))  # Penalty term
        total_loss = self.alpha * penalty - l2_gain

        print("l2_gain: %.3g \t lpips_loss: %.3g" % (l2_gain.view(-1).data.cpu().numpy()[0], lpips_loss.view(-1).data.cpu().numpy()[0]))

        return total_loss


def RunRefract(x_path, use_gpu=False, hyperparams=None):

    noise_percent = 0.02
    learning_rate = 0.01
    betas = (0.9, 0.999)
    p_allow = 0.005
    alpha = 0.01

    if hyperparams is not None:

        if 'noise_percent' not in hyperparams:
            print("noise_percent not found in hyperparams")
            return
        elif 'learning_rate' not in hyperparams:
            print("learning_rate not found in hyperparams")
            return
        elif 'betas' not in hyperparams:
            print("betas not found in hyperparams")
            return
        elif 'p_allow' not in hyperparams:
            print("p_allow not found in hyperparams")
            return
        elif 'alpha' not in hyperparams:
            print("alpha not found in hyperparams")
            return

        noise_percent = hyperparams['noise_percent']
        learning_rate = hyperparams['learning_rate']
        betas = hyperparams['betas']
        p_allow = hyperparams['p_allow']
        alpha = hyperparams['alpha']
    

    # process x
    x, x_box = FacePipeline(x_path, use_gpu=use_gpu)
    phi_x = ImageToEmbeddings(x)
    phi_x.requires_grad = False
    # show x
    # Image.fromarray(lpips.tensor2im(x.data)).show()

    # process x_cloaked
    x_cloaked, _ = FacePipeline(x_path, req_grad=True, use_gpu=use_gpu, noise=noise_percent)
    # show x_cloaked
    # Image.fromarray(lpips.tensor2im(x_cloaked.data)).show()

    if(use_gpu):
        with torch.no_grad():
            x = x.cuda()
            x_cloaked = x_cloaked.cuda()

    loss_fn = CloakLoss(alpha, p_allow, x, phi_x)
    optimizer = torch.optim.Adam([x_cloaked,], lr=learning_rate, betas=betas)

    eps = 1e-8
    n_stalled = 0
    max_stalled = 10
    prev_loss = 0

    for i in range(1000):
        loss = loss_fn(x_cloaked)

        if loss is None:
            print("No face detected in x_cloaked")
            break

        print("\t%dth: total_loss = %.6g" % (i, loss.item()))

        # print grad
        # print("x_cloaked.grad: ", x_cloaked.grad.norm().item())
        
        optimizer.zero_grad()
        loss.backward()
        optimizer.step()

        if abs(prev_loss - loss) < eps:
            n_stalled += 1
        
        if n_stalled >= max_stalled:
            break

        prev_loss = loss.item()


    cloaked_img = Image.fromarray(lpips.tensor2im(torch.clamp(x_cloaked.data, min=-1, max=1)))

    whole_image = Image.open(x_path)
    whole_image.paste(cloaked_img, x_box[0].astype(int))
    # whole_image.show()

    # Save image
    # whole_image.save('cloaked.jpg')

    return whole_image