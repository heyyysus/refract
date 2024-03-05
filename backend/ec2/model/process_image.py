import numpy as np
from PIL import Image

def process_image(file_storage):
    # Check if the file is an image
    if not file_storage.filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif')):
        raise ValueError("Invalid image file")

    # Open the image file
    image = Image.open(file_storage)

    # Convert the image to RGB mode
    image = image.convert("RGB")

    # Convert the image to a numpy array
    image_array = np.array(image)

    return image_array
