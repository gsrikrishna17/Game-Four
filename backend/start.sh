#!/bin/bash
set -e

echo "Starting Connect Four Backend..."

# Build the Go application
go build -o main .

# Run the application
./main
