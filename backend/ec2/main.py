from flask import Flask
from flask import request
from model.process_image import process_image
import numpy as np
import cv2
import time
import datetime

app = Flask(__name__)

@app.route('/')
def hello():
    return 'Hello, World!'

@app.route('/run-model', methods=['POST'])
def run_model():
    file = request.files['image']
    image = process_image(file)
    time_str = datetime.now().strftime('%Y-%m-%d-%H-%M-%S')

    # Save the image as a PNG file
    filename = 'saves/{}.png'.format(time_str)
    cv2.imwrite(filename, image)

    return filename


if __name__ == '__main__':
    app.run()
