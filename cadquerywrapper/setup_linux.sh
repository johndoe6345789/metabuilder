#!/bin/bash
set -e

echo "🔍 Checking Python 3.11+..."
if ! python3 --version | grep -q "3.11"; then
  echo "Installing Python 3.11..."
  if command -v apt &>/dev/null; then
    sudo apt update
    sudo apt install -y python3.11 python3.11-venv python3.11-dev
    sudo update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1
  elif command -v dnf &>/dev/null; then
    sudo dnf install -y python3.11
  elif command -v pacman &>/dev/null; then
    sudo pacman -S --noconfirm python
  else
    echo "❌ Unsupported Linux package manager."
    exit 1
  fi
fi

echo "✅ Python version: $(python3 --version)"

echo "🔍 Checking for Poetry..."
if ! command -v poetry &>/dev/null; then
  echo "📦 Installing Poetry..."
  curl -sSL https://install.python-poetry.org | python3 -
  export PATH="$HOME/.local/bin:$PATH"
else
  echo "✅ Poetry is installed: $(poetry --version)"
fi

echo "📦 Installing dependencies..."
poetry install

echo "✅ Linux setup complete. Use 'poetry shell' to activate environment."
