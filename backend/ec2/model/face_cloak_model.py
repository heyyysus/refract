'''
NOTES: 
1. Make sure you are calculating LPIPS on the cropped images. 
2. Go over loss function and make sure you are calculating the loss correctly.
3. Look for similar images based on the norm to choose as target image. Precompute the norms. 
4. Ask if we can change goal to maximize embedding difference between x and x_cloaked while keeping LPIPS below p_allow.
'''

import torch
import torch.nn as nn
from torchvision import transforms
from torchvision.transforms import v2

from facenet_pytorch import InceptionResnetV1, MTCNN
import lpips

from PIL import Image

import os
import csv


class FaceCloakModel:
    def __init__(self, use_gpu=False, learning_rate=0.01, p_allow=0.0, alpha=5, compress_size=160):
        self.use_gpu = use_gpu
        self.learning_rate = learning_rate
        self.p_allow = p_allow
        self.alpha = alpha
        self.compress_size = compress_size

        self.resnet = InceptionResnetV1(pretrained='casia-webface').eval()
        if self.use_gpu:
            self.resnet.cuda()
        self.mtcnn = MTCNN(device='cuda:0' if self.use_gpu else 'cpu', image_size=self.compress_size)

        self.toTensor = transforms.Compose([transforms.ToTensor()])
        self.resizeImg = v2.Resize(size=(compress_size, compress_size))

        self.loss_fn = CloakLoss(alpha, p_allow, self.resnet, self.resizeImg, use_gpu)

    def face_pipeline(self, img_path, req_grad=False, box=None):
        img = Image.open(img_path).convert('RGB')
        if box is None:
            box, _ = self.mtcnn.detect(img)
        if box is None:
            return None, None
        img = img.crop(box[0].astype(int))
        img = self.toTensor(img).unsqueeze(0)
        img = img * 2 - 1
        img = torch.clamp(img, -1, 1)
        if req_grad:
            return img.requires_grad_(True), box
        return img, box
    
    def compute_embedding(self):
        if not os.path.exists("./embeddings/" + str(self.compress_size)):
            print("\nComputing embeddings for compress size: ", self.compress_size)
            os.makedirs("./embeddings/" + str(self.compress_size))
            for i in range(500):
                img_path = "./tpdne/file_" + str(i) + ".jpg"
                temp, _ = self.face_pipeline(img_path)
                if i % 10 == 0:
                    print("Processing image: ", i)
                temp = self.resnet(self.resizeImg(temp)).detach().requires_grad_(False)
                torch.save(temp, "./embeddings/" + str(self.compress_size) + "/embed_" + str(i) + ".pt")
        else:
            print("\nEmbeddings already precomputed for this compress_size")

    def find_target_embedding(self, x_copy):
        min_norm = 1000000
        target_embedding = None
        target_path = None
        for i in range(500):
            embed_path = "./embeddings/" + str(self.compress_size) + "/embed_" + str(i) + ".pt"
            temp = torch.load(embed_path).clone().detach().requires_grad_(False)
            norm = torch.norm(x_copy - temp, p=2) ** 2
            if norm < min_norm and norm > 0.0:
                min_norm = norm
                target_embedding = temp.clone().detach().requires_grad_(False)
                target_path = "./tpdne/file_" + str(i) + ".jpg"
        print("Target Embedding Path: ", target_path)
        print("Min Norm: ", min_norm.item())
        return target_embedding, target_path

    def cloak_face(self, x_path):
        x, x_box = self.face_pipeline(x_path)
        if x is None:
            print("No face detected in the image")
            return None
        
        x_copy = self.resnet(self.resizeImg(x)).clone().detach().requires_grad_(False)
        x_cloaked, _ = self.face_pipeline(x_path, req_grad=True, box=x_box)

        self.compute_embedding()
        y_copy, y_path = self.find_target_embedding(x_copy)

        if self.use_gpu:
            x = x.cuda()
            x_cloaked = x_cloaked.cuda()
            y_copy = y_copy.cuda()

        optimizer = torch.optim.Adam([x_cloaked], lr=self.learning_rate)

        print("\nStarting optimization")
        for i in range(100):
            optimizer.zero_grad()
            loss, l2_loss, lpips_loss = self.loss_fn(x_cloaked, y_copy, x)
            loss.backward()
            optimizer.step()
            if i % 10 == 0:
                print(f"Step {i}, Loss: {loss.item():.6f}, L2: {l2_loss:.6f}, LPIPS: {lpips_loss:.6f}")

        x_cloaked = torch.clamp(x_cloaked, -1, 1)
        
        return x_cloaked, x_copy, x_box, y_copy, y_path
    
    def save_image(self, cloak, path, box, name):
        cloaked_img = Image.fromarray(lpips.tensor2im(cloak.data))
        whole_image = Image.open(path)
        whole_image.paste(cloaked_img, box[0].astype(int))

        # create directory if it doesn't exist
        # if not os.path.exists("./output/"+ str(self.compress_size)):
        #     os.makedirs("./output/"+ str(self.compress_size))

        # whole_image.save("./tmp/"+ str(self.compress_size) +"/cloaked_" + str(name) + ".jpg")

        return whole_image

    def test_save_data(self, cloak, cloak_path, x_copy, x_path, y_copy, y_path):
        
        def imgToEmbed(img_path):
            img = Image.open(img_path)
            img = self.mtcnn(img)
            img = img.unsqueeze(0)
            return self.resnet(img).detach()
        
        x_embed = imgToEmbed(x_path)
        y_embed = imgToEmbed(y_path)
        cloak_embed = imgToEmbed(cloak_path)

        y_cloak = torch.norm(y_copy - self.resnet(self.resizeImg(cloak)), p=2).item() ** 2
        x_x = torch.norm(x_copy - x_embed, p=2).item() ** 2
        y_y = torch.norm(y_copy - y_embed, p=2).item() ** 2

        x_y = torch.norm(x_embed - y_embed, p=2).item() ** 2
        x_cloak = torch.norm(x_embed - cloak_embed, p=2).item() ** 2
        y_cloak = torch.norm(y_embed - cloak_embed, p=2).item() ** 2

        print("\ncontrol: (should all be small)")
        print("y_copy - cloak: ", y_cloak)
        print("x_copy - x_embed: ", x_x)
        print("y_copy - y_embed: ", y_y)

        print("\nexperiment:")
        print("x_embed - y_embed: ", x_y)
        print("x_embed - cloak: ", x_cloak, " (bigger the better)")
        print("y_embed - cloak: ", y_cloak, " (smaller the better)")

        # row = [x_path, y_path, y_cloak, x_x, y_y, x_y, x_cloak, y_cloak]
        row = [x_path, y_path, y_cloak, x_x, y_y, x_y, x_cloak, y_cloak]

        file_name = "./" + str(self.compress_size) + "_records.csv"
        with open(file_name, "a") as f:
            writer = csv.writer(f)
            writer.writerow(row)
        f.close()


# Define the Loss Function
class CloakLoss(nn.Module):
    def __init__(self, alpha, p, resnet, resizeImg, use_gpu):
        super(CloakLoss, self).__init__()
        self.alpha = alpha
        self.p = p
        self.resnet = resnet
        self.resizeImg = resizeImg
        self.lpips = lpips.LPIPS(net='alex')
        if use_gpu:
            self.lpips = self.lpips.cuda()

    def forward(self, x_cloaked, phi_y, x):
        x_cloaked = torch.clamp(x_cloaked, -1, 1)

        # lpips only takes normalized [1, 3, x, x] tensor from [-1, 1]
        lpips_loss = self.lpips.forward(x_cloaked, x)  # Calculate LPIPS
        penalty = torch.maximum(lpips_loss - self.p, torch.tensor(0.0)) # Calculate penalty

        phi_x_cloaked = self.resnet(self.resizeImg(x_cloaked)) # Calculate embedding
        l2_loss = torch.norm(phi_x_cloaked - phi_y, p=2) ** 2  # L2 norm squared

        total_loss = l2_loss + self.alpha * penalty

        return (total_loss, l2_loss.view(-1).data.cpu().numpy()[0], lpips_loss.view(-1).data.cpu().numpy()[0])