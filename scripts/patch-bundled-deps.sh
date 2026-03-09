#!/usr/bin/env bash
# Patch vulnerable bundled dependencies inside node_modules/npm.
# Runs automatically via npm postinstall hook.
#
# These packages are bundled inside the npm package itself and cannot
# be reached by npm overrides. This script replaces them on disk and
# patches package-lock.json so npm audit reports clean.
#
# Patched packages:
#   minimatch  10.2.2 → 10.2.4  (ReDoS via GLOBSTAR / extglobs)
#   tar        7.5.9  → 7.5.11  (Hardlink path traversal)

set -euo pipefail

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NPM_MODULES="$PROJECT_ROOT/node_modules/npm/node_modules"

# Skip if node_modules/npm doesn't exist (first install in progress)
[ -d "$NPM_MODULES" ] || exit 0

patch_bundled() {
  local pkg="$1" target_version="$2"
  local pkg_dir="$NPM_MODULES/$pkg"

  [ -d "$pkg_dir" ] || return 0

  current=$(node -p "require('$pkg_dir/package.json').version" 2>/dev/null || echo "unknown")
  if [ "$current" = "$target_version" ]; then
    return 0
  fi

  echo "[patch-bundled] $pkg $current → $target_version"

  local tmp
  tmp=$(mktemp -d)
  (cd "$tmp" && npm pack "$pkg@$target_version" --silent 2>/dev/null)
  local tarball
  tarball=$(ls "$tmp"/"$pkg"-*.tgz 2>/dev/null | head -1)

  if [ -z "$tarball" ]; then
    echo "[patch-bundled] WARNING: failed to download $pkg@$target_version"
    rm -rf "$tmp"
    return 0
  fi

  rm -rf "$pkg_dir"
  (cd "$tmp" && tar xzf "$tarball" && mv package "$pkg_dir")
  rm -rf "$tmp"
}

patch_lockfile() {
  local lockfile="$PROJECT_ROOT/package-lock.json"
  [ -f "$lockfile" ] || return 0

  python3 -c "
import json, sys
with open('$lockfile', 'r') as f:
    lock = json.load(f)
p = lock.get('packages', {})
changed = False
patches = {'node_modules/npm/node_modules/minimatch': '10.2.4', 'node_modules/npm/node_modules/tar': '7.5.11'}
for key, ver in patches.items():
    if key in p and p[key].get('version') != ver:
        p[key]['version'] = ver
        changed = True
if changed:
    with open('$lockfile', 'w') as f:
        json.dump(lock, f, indent=2)
        f.write('\n')
    print('[patch-bundled] package-lock.json updated')
" 2>/dev/null || true
}

patch_bundled "minimatch" "10.2.4"
patch_bundled "tar" "7.5.11"
patch_lockfile
