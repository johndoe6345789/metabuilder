#!/usr/bin/env bash
set -e

case "$(uname)" in
  Linux*) script="setup_linux.sh" ;;
  Darwin*) script="setup_mac.sh" ;;
  MINGW*|MSYS*|CYGWIN*) script="setup_windows.ps1" ;;
  *) echo "Unsupported OS: $(uname)" && exit 1 ;;
esac

if [ "$script" = "setup_windows.ps1" ]; then
  if command -v pwsh >/dev/null 2>&1; then
    pwsh "$script"
  else
    powershell.exe -ExecutionPolicy Bypass -File "$script"
  fi
else
  bash "$script"
fi

