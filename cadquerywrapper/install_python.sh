#!/usr/bin/env bash
set -e

if command -v python3 >/dev/null 2>&1; then
    echo "Python is already installed." && exit 0
fi

echo "Python not found. Attempting installation..."
if command -v apt-get >/dev/null 2>&1; then
    sudo apt-get update && sudo apt-get install -y python3 python3-pip
elif command -v yum >/dev/null 2>&1; then
    sudo yum install -y python3 python3-pip
elif command -v brew >/dev/null 2>&1; then
    brew install python
else
    echo "Unsupported package manager. Please install Python manually." >&2
    exit 1
fi

if ! command -v python >/dev/null 2>&1 && command -v python3 >/dev/null 2>&1; then
    sudo ln -s "$(command -v python3)" /usr/local/bin/python || true
fi

echo "Python installed successfully."
