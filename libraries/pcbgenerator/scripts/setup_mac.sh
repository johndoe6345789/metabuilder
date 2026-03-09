#!/usr/bin/env bash
set -e

# Check for Python 3
if command -v python3 >/dev/null 2>&1; then
    echo "Python is already installed: $(python3 --version)"
else
    echo "Python 3 not found. Attempting to install via Homebrew..."
    if command -v brew >/dev/null 2>&1; then
        brew update
        brew install python
    else
        echo "Homebrew is not installed. Please install Python manually from https://www.python.org/"
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
