# Use a base image with Python pre-installed
FROM python:3.9-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the requirements.txt file to the container
COPY requirements.txt .

# Install the dependencies
RUN pip install --no-cache-dir -r requirements.txt


COPY ./model/*.py /model/

COPY main.py .

RUN mkdir /tmp/

# Set the command to run when the container starts
CMD ["python", "main.py"]