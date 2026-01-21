#!/bin/sh
# SparkOS CLI Installation Script
# This script clones the SparkOS CLI repository

echo "SparkOS CLI Installation"
echo "========================"
echo ""

SPARK_REPO="https://github.com/johndoe6345789/spark-cli.git"
INSTALL_DIR="$HOME/spark-cli"

echo "This script will clone the SparkOS CLI to: $INSTALL_DIR"
echo ""

# Check if git is available
if ! command -v git >/dev/null 2>&1; then
    echo "Error: git is not installed"
    echo "Please install git to continue"
    exit 1
fi

# Check if directory already exists
if [ -d "$INSTALL_DIR" ]; then
    echo "Warning: $INSTALL_DIR already exists"
    echo -n "Do you want to remove it and re-clone? (y/N): "
    read answer
    if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
        rm -rf "$INSTALL_DIR"
    else
        echo "Installation cancelled"
        exit 0
    fi
fi

# Clone the repository
echo "Cloning spark CLI repository..."
if git clone "$SPARK_REPO" "$INSTALL_DIR"; then
    echo ""
    echo "SparkOS CLI cloned successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. cd $INSTALL_DIR"
    echo "  2. Follow the installation instructions in the repository"
    echo ""
else
    echo ""
    echo "Error: Failed to clone repository"
    echo "Please check your network connection and try again"
    exit 1
fi
