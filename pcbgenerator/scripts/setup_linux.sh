#!/usr/bin/env bash
set -e

# Check for Python 3
if command -v python3 >/dev/null 2>&1; then
    echo "Python is already installed: $(python3 --version)"
else
    echo "Python 3 not found. Attempting to install..."
    if command -v apt-get >/dev/null 2>&1; then
        sudo apt-get update
        sudo apt-get install -y python3 python3-pip
    elif command -v yum >/dev/null 2>&1; then
        sudo yum install -y python3 python3-pip
    elif command -v dnf >/dev/null 2>&1; then
        sudo dnf install -y python3 python3-pip
    elif command -v pacman >/dev/null 2>&1; then
        sudo pacman -Sy --noconfirm python python-pip
    elif command -v zypper >/dev/null 2>&1; then
        sudo zypper install -y python3 python3-pip
    else
        echo "Could not detect package manager. Please install Python manually."
        exit 1
    fi
fi

# Ensure pip is available
if ! command -v pip3 >/dev/null 2>&1; then
    echo "pip3 not found. Installing with ensurepip..."
    python3 -m ensurepip --upgrade
fi

# Install project dependencies
pip3 install -r requirements.txt

echo "Setup complete."
