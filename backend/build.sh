#!/bin/bash

echo "Building Connect Four Backend..."

# Build Docker image
docker build -t connect-four-backend:latest .

echo "Build complete! Image: connect-four-backend:latest"
echo ""
echo "To run locally:"
echo "  docker-compose up"
echo ""
echo "To push to Docker Hub:"
echo "  docker tag connect-four-backend:latest YOUR_USERNAME/connect-four-backend:latest"
echo "  docker push YOUR_USERNAME/connect-four-backend:latest"