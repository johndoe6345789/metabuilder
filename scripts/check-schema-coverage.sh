#!/bin/bash
# Package-Schema Mismatch Detector
# Reports JSON files in packages that don't have corresponding schemas

set -e

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SCHEMA_DIR="$REPO_ROOT/schemas/package-schemas"
PACKAGES_DIR="$REPO_ROOT/packages"

echo "================================================="
echo "Package-Schema Mismatch Report"
echo "================================================="
echo ""

# Find all JSON files in packages
declare -A found_files
declare -A schema_exists

echo "Scanning packages for JSON files..."
while IFS= read -r json_file; do
    rel_path="${json_file#$PACKAGES_DIR/}"
    pkg_name=$(echo "$rel_path" | cut -d'/' -f1)
    file_path=$(echo "$rel_path" | cut -d'/' -f2-)
    
    # Normalize to pattern (e.g., "scripts/functions.json")
    pattern=$(echo "$file_path" | sed 's|/[^/]*\.json$|/*.json|')
    
    found_files["$file_path"]=1
done < <(find "$PACKAGES_DIR" -name "*.json" -type f ! -path "*/node_modules/*" ! -path "*/.next/*")

echo "Found $(echo "${!found_files[@]}" | wc -w) unique JSON file patterns"
echo ""

# Check documented schema mappings from SCHEMAS_README.md
echo "Checking schema documentation..."
echo "---------------------------------------------------"

declare -A EXPECTED_SCHEMAS=(
    ["package.json"]="metadata_schema.json"
    ["entities/schema.json"]="entities_schema.json"
    ["types/index.json"]="types_schema.json"
    ["scripts/functions.json"]="script_schema.json (per docs line 42)"
    ["components/ui.json"]="components_schema.json"
    ["validation/validators.json"]="validation_schema.json"
    ["styles/tokens.json"]="styles_schema.json"
    ["api/routes.json"]="api_schema.json"
    ["events/definitions.json"]="events_schema.json"
    ["events/handlers.json"]="events_schema.json"
    ["config/settings.json"]="config_schema.json"
    ["jobs/tasks.json"]="jobs_schema.json"
    ["permissions/roles.json"]="permissions_schema.json"
    ["forms/forms.json"]="forms_schema.json"
    ["migrations/versions.json"]="migrations_schema.json"
    ["storybook/config.json"]="storybook_schema.json"
)

# Files found in packages
declare -a UNMATCHED_FILES=()

for file_pattern in $(find "$PACKAGES_DIR" -name "*.json" -type f ! -path "*/node_modules/*" | sed "s|^$PACKAGES_DIR/[^/]*/||" | sort -u); do
    schema_name="${EXPECTED_SCHEMAS[$file_pattern]}"
    
    if [ -z "$schema_name" ]; then
        UNMATCHED_FILES+=("$file_pattern")
    fi
done

# Report
echo ""
echo "================================================="
echo "FINDINGS"
echo "================================================="
echo ""

if [ ${#UNMATCHED_FILES[@]} -gt 0 ]; then
    echo -e "${YELLOW}Files found in packages WITHOUT documented schema mapping:${NC}"
    for file in "${UNMATCHED_FILES[@]}"; do
        # Count how many packages have this file
        count=$(find "$PACKAGES_DIR" -path "*/$file" -type f | wc -l)
        echo -e "  ${RED}✗${NC} $file (found in $count packages)"
    done
    echo ""
fi

# Check for schema files that exist
echo -e "${GREEN}Schemas that exist:${NC}"
for schema in "$SCHEMA_DIR"/*_schema.json; do
    basename "$schema"
done | sort

echo ""
echo "================================================="
echo "RECOMMENDATION"
echo "================================================="
echo ""
echo "The issue 'functions.json which isnt even in the schemas' refers to:"
echo ""
echo "  scripts/functions.json files exist in packages"
echo "  BUT the documentation says they should use 'script_schema.json'"
echo "  which expects full function implementations with 'body' fields"
echo ""
echo "Action needed:"
echo "  1. Check if scripts/functions.json files match script_schema.json"
echo "  2. If not, either:"
echo "     a) Update the files to match script_schema.json, OR"
echo "     b) Create a new schema for the simpler format being used"
echo ""
