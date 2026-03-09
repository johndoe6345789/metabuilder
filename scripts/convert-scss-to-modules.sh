#!/bin/bash
# Generate SCSS Module wrappers for Angular Material components
# Creates .module.scss files that @use the original Angular Material styles
# and expose them with CSS Module compatible class names

set -e

M3_SCSS_DIR="/Users/rmac/Documents/metabuilder/scss/m3-scss/material"
OUTPUT_DIR="/Users/rmac/Documents/metabuilder/scss/m3-modules"

echo "=== Generating SCSS Module Wrappers for Angular Material ==="
echo "Source: $M3_SCSS_DIR"
echo "Output: $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# List of components with main .scss files (not partials)
COMPONENTS=(
  "autocomplete/autocomplete"
  "badge/badge"
  "bottom-sheet/bottom-sheet"
  "button/button"
  "button/icon-button"
  "button/fab"
  "button-toggle/button-toggle"
  "card/card"
  "checkbox/checkbox"
  "chips/chips"
  "datepicker/datepicker"
  "dialog/dialog"
  "divider/divider"
  "expansion/expansion"
  "form-field/form-field"
  "grid-list/grid-list"
  "icon/icon"
  "input/input"
  "list/list"
  "menu/menu"
  "paginator/paginator"
  "progress-bar/progress-bar"
  "progress-spinner/progress-spinner"
  "radio/radio"
  "select/select"
  "sidenav/sidenav"
  "slide-toggle/slide-toggle"
  "slider/slider"
  "snack-bar/snack-bar"
  "sort/sort"
  "stepper/stepper"
  "table/table"
  "tabs/tabs"
  "timepicker/timepicker"
  "toolbar/toolbar"
  "tooltip/tooltip"
  "tree/tree"
)

echo "Generating wrapper modules for ${#COMPONENTS[@]} components..."
echo ""

for component in "${COMPONENTS[@]}"; do
  # Extract component name (last part after /)
  comp_name=$(basename "$component")
  comp_dir=$(dirname "$component")

  source_file="$M3_SCSS_DIR/$component.scss"

  if [ -f "$source_file" ]; then
    # Create component subdirectory in output
    mkdir -p "$OUTPUT_DIR/$comp_dir"

    output_file="$OUTPUT_DIR/$comp_dir/$comp_name.module.scss"

    echo "  Creating: $comp_dir/$comp_name.module.scss"

    # Generate the wrapper module
    cat > "$output_file" << EOF
// $comp_name SCSS Module
// Auto-generated wrapper for Angular Material $comp_name component
// Imports official styles and exposes them as CSS Module classes

@use '../../m3-scss/material/$component';

// Re-export with module-compatible class names
// The original Angular Material classes are now available
// Import this file in React: import styles from './$comp_name.module.scss'
EOF

  else
    echo "  Skipping: $component (source not found)"
  fi
done

echo ""
echo "=== Generation Complete ==="
echo ""

# Count generated files
GENERATED=$(find "$OUTPUT_DIR" -name "*.module.scss" -type f 2>/dev/null | wc -l)
echo "Generated $GENERATED module wrappers in $OUTPUT_DIR"
