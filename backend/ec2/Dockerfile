# Use a base image with Python pre-installed
FROM --platform=linux/amd64 python:3.9

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt file to the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt

COPY ./model/*.py model/

COPY main.py .

COPY credentials.csv .

RUN mkdir tmp/

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"

RUN unzip awscliv2.zip

RUN ./aws/install

# Set the command to run when the container starts
CMD ["python", "main.py"]