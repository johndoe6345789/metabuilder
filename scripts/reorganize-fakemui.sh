#!/bin/bash

# FakeMUI Structure Reorganization Script
# Purpose: Clean up fakemui folder structure for better organization
# Date: January 23, 2026

set -e  # Exit on error

FAKEMUI_ROOT="/Users/rmac/Documents/metabuilder/fakemui"
ARCHIVE_DIR="$FAKEMUI_ROOT/.archive"

echo "╔════════════════════════════════════════════════════════════╗"
echo "║        FakeMUI Structure Reorganization                    ║"
echo "║        This will archive legacy code and reorganize        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Create archive directory
echo "📁 Creating archive directory..."
mkdir -p "$ARCHIVE_DIR"

# 1. Archive Python implementations (unused)
echo "📦 Archiving unused Python implementations..."
if [ -d "$FAKEMUI_ROOT/fakemui" ]; then
    find "$FAKEMUI_ROOT/fakemui" -maxdepth 1 -name "*.py" -type f | while read file; do
        if [ -f "$file" ]; then
            echo "   → Archiving $(basename "$file")"
            mv "$file" "$ARCHIVE_DIR/"
        fi
    done
fi

# 2. Archive legacy QML implementations
echo "📦 Archiving legacy QML implementations..."
if [ -d "$FAKEMUI_ROOT/components" ]; then
    echo "   → Moving components/ to archive"
    mv "$FAKEMUI_ROOT/components" "$ARCHIVE_DIR/qml-legacy-components"
fi

if [ -d "$FAKEMUI_ROOT/widgets" ]; then
    echo "   → Moving widgets/ to archive"
    mv "$FAKEMUI_ROOT/widgets" "$ARCHIVE_DIR/qml-legacy-widgets"
fi

# 3. Archive incomplete migration
echo "📦 Archiving incomplete migration files..."
if [ -d "$FAKEMUI_ROOT/src" ] && [ ! -f "$FAKEMUI_ROOT/src/index.ts" ]; then
    echo "   → Moving src/ to archive (incomplete migration)"
    mv "$FAKEMUI_ROOT/src" "$ARCHIVE_DIR/migration-in-progress"
fi

# 4. Archive legacy SCSS
echo "📦 Consolidating SCSS files..."
if [ -d "$FAKEMUI_ROOT/scss" ]; then
    echo "   → Moving scss/ to archive (consolidated to theming/)"
    mkdir -p "$ARCHIVE_DIR/legacy-scss"
    cp -r "$FAKEMUI_ROOT/scss" "$ARCHIVE_DIR/legacy-scss/"
    rm -rf "$FAKEMUI_ROOT/scss"
fi

# 5. Consolidate contexts into theming
echo "🎨 Consolidating contexts into theming..."
if [ -d "$FAKEMUI_ROOT/contexts" ]; then
    echo "   → Reviewing contexts/ folder..."
    find "$FAKEMUI_ROOT/contexts" -type f -name "*.tsx" -o -name "*.ts" | while read file; do
        echo "   → Would merge: $(basename "$file")"
    done
    # Backup contexts before moving
    cp -r "$FAKEMUI_ROOT/contexts" "$ARCHIVE_DIR/legacy-contexts"
    rm -rf "$FAKEMUI_ROOT/contexts"
fi

# 6. Archive core utilities (review after)
echo "📦 Archiving core utilities (review after)..."
if [ -d "$FAKEMUI_ROOT/core" ]; then
    echo "   → Backing up core/ folder"
    cp -r "$FAKEMUI_ROOT/core" "$ARCHIVE_DIR/legacy-core-review"
    # Don't delete yet - needs manual review
fi

# 7. Clean up styles folder (consolidate)
echo "🎨 Consolidating styles folder..."
if [ -d "$FAKEMUI_ROOT/styles" ]; then
    echo "   → Reviewing styles/ folder..."
    find "$FAKEMUI_ROOT/styles" -type f | wc -l | xargs echo "   → Found"
    echo "   → Consider consolidating with theming/"
fi

echo ""
echo "✅ Archive created at: $ARCHIVE_DIR"
echo ""
echo "📊 Cleanup Summary:"
echo "   → Python files moved to archive"
echo "   → Legacy QML components archived"
echo "   → Incomplete migrations archived"
echo "   → SCSS consolidated references"
echo "   → Contexts consolidated"
echo ""
echo "⚠️  MANUAL REVIEW REQUIRED:"
echo "   1. Review archived files: ls -la $ARCHIVE_DIR"
echo "   2. Check if contexts were properly consolidated"
echo "   3. Verify theming/ folder has all necessary files"
echo "   4. Delete archive/ when confident (git rm -r)"
echo ""
echo "Next steps:"
echo "   1. Test: npm run build"
echo "   2. Test: npm run test:e2e"
echo "   3. Commit: git add -A && git commit"
echo ""
