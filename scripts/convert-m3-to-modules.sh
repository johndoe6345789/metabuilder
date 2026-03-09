#!/bin/bash
# Convert Google Material SCSS to SCSS Modules
# Renames main component .scss files to .module.scss and updates @use references
# Keeps partial files (_*.scss) unchanged - they're internal implementation

set -e

M3_DIR="/Users/rmac/Documents/metabuilder/scss/m3-scss/material"

echo "=== Converting Google Material SCSS to SCSS Modules ==="
echo "Directory: $M3_DIR"
echo ""

# Step 1: Find and rename main .scss files (not partials, not already .module.scss)
echo "Step 1: Renaming main SCSS files to .module.scss..."

# Get list of files to rename first (before we start renaming)
FILES_TO_RENAME=$(find "$M3_DIR" -name "*.scss" ! -name "_*.scss" ! -name "*.module.scss" -type f)
FILE_COUNT=$(echo "$FILES_TO_RENAME" | grep -c "." || echo "0")

echo "  Found $FILE_COUNT main SCSS files to rename"
echo ""

# Create a mapping file for reference updates
MAPPING_FILE=$(mktemp)
echo "# Original -> New filename mapping" > "$MAPPING_FILE"

# Rename files and record mapping
for file in $FILES_TO_RENAME; do
  if [ -f "$file" ]; then
    newname="${file%.scss}.module.scss"
    basename_old=$(basename "$file" .scss)
    basename_new=$(basename "$newname" .module.scss)
    dir=$(dirname "$file")

    echo "  $basename_old.scss -> $basename_old.module.scss"
    echo "$basename_old|$basename_new.module" >> "$MAPPING_FILE"

    mv "$file" "$newname"
  fi
done

echo ""
echo "Step 2: Updating @use references..."

# Now update all @use statements in all SCSS files
# We need to update references like @use './dialog' to @use './dialog.module'
# But NOT partials like @use './_m3-dialog'

find "$M3_DIR" -name "*.scss" -o -name "*.module.scss" | while read -r file; do
  if [ -f "$file" ]; then
    # Check if file has @use statements that reference non-partial files
    if grep -qE "@use ['\"]\./" "$file" 2>/dev/null; then

      # Read the mapping and apply updates
      while IFS='|' read -r old new; do
        if [ -n "$old" ] && [ "${old:0:1}" != "#" ]; then
          # Update @use './name' to @use './name.module'
          # But only if it's not a partial (doesn't start with _)
          sed -i '' "s|@use '\.\/${old}'|@use './${new}'|g" "$file" 2>/dev/null || true
          sed -i '' "s|@use \"\.\/${old}\"|@use \"./${new}\"|g" "$file" 2>/dev/null || true

          # Also handle parent directory references like @use '../dialog/dialog'
          sed -i '' "s|@use '\.\./\([^']*\)/${old}'|@use '../\1/${new}'|g" "$file" 2>/dev/null || true
          sed -i '' "s|@use \"\.\./\([^\"]*\)/${old}\"|@use \"../\1/${new}\"|g" "$file" 2>/dev/null || true
        fi
      done < "$MAPPING_FILE"
    fi
  fi
done

rm "$MAPPING_FILE"

echo ""
echo "Step 3: Verifying results..."

MODULE_COUNT=$(find "$M3_DIR" -name "*.module.scss" -type f | wc -l)
PARTIAL_COUNT=$(find "$M3_DIR" -name "_*.scss" -type f | wc -l)
REGULAR_COUNT=$(find "$M3_DIR" -name "*.scss" ! -name "_*.scss" ! -name "*.module.scss" -type f | wc -l)

echo ""
echo "=== Conversion Complete ==="
echo "  Module files (.module.scss): $MODULE_COUNT"
echo "  Partial files (_*.scss): $PARTIAL_COUNT"
echo "  Remaining regular files: $REGULAR_COUNT"
echo ""

# List the new module files
echo "Generated module files:"
find "$M3_DIR" -name "*.module.scss" -type f | sort | while read -r f; do
  echo "  $(echo "$f" | sed "s|$M3_DIR/||")"
done
