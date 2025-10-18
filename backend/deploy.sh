#!/bin/bash

echo "Deploying Connect Four Backend..."

# Build image
docker build -t connect-four-backend:latest .

# Tag for Docker Hub
docker tag connect-four-backend:latest YOUR_USERNAME/connect-four-backend:latest

# Push to Docker Hub
docker push YOUR_USERNAME/connect-four-backend:latest

echo "Deployment complete!"
echo "Image pushed to: YOUR_USERNAME/connect-four-backend:latest"