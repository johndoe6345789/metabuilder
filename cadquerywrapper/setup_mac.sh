#!/bin/bash
set -e

echo "🔍 Checking Python 3.11+..."
if ! python3 --version | grep -q "3.11"; then
  echo "Installing Python 3.11 using Homebrew..."
  if ! command -v brew &>/dev/null; then
    echo "📦 Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    export PATH="/opt/homebrew/bin:$PATH"
  fi
  brew install python@3.11
  brew link python@3.11 --force
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

echo "✅ macOS setup complete. Use 'poetry shell' to activate environment."
