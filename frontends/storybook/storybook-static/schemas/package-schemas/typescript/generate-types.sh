#!/bin/bash
# Generate TypeScript type definitions from JSON schemas
# Uses json-schema-to-typescript or quicktype

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCHEMA_DIR="$(dirname "$SCRIPT_DIR")"
OUTPUT_DIR="$SCRIPT_DIR/generated"

echo "================================================="
echo "TypeScript Type Generator"
echo "================================================="
echo ""

# Check for TypeScript generators
HAS_JSON_SCHEMA_TO_TS=false
HAS_QUICKTYPE=false

if command -v json2ts &> /dev/null; then
    HAS_JSON_SCHEMA_TO_TS=true
    echo "✓ Found json-schema-to-typescript (json2ts)"
fi

if command -v quicktype &> /dev/null; then
    HAS_QUICKTYPE=true
    echo "✓ Found quicktype"
fi

if [ "$HAS_JSON_SCHEMA_TO_TS" = false ] && [ "$HAS_QUICKTYPE" = false ]; then
    echo -e "${RED}ERROR: No TypeScript generator found${NC}"
    echo ""
    echo "Install one of:"
    echo "  npm install -g json-schema-to-typescript"
    echo "  npm install -g quicktype"
    exit 1
fi

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo ""
echo "Generating TypeScript types..."
echo "Output: $OUTPUT_DIR"
echo ""

# Function to generate types for a schema
generate_types() {
    local schema_file="$1"
    local schema_name="$(basename "$schema_file" .json)"
    local output_file="$OUTPUT_DIR/${schema_name}.d.ts"

    printf "Generating %-40s ... " "$schema_name.d.ts"

    if [ "$HAS_JSON_SCHEMA_TO_TS" = true ]; then
        # Use json-schema-to-typescript
        if json2ts "$schema_file" > "$output_file" 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
            return 0
        fi
    fi

    if [ "$HAS_QUICKTYPE" = true ]; then
        # Use quicktype
        local type_name=$(echo "$schema_name" | sed 's/_schema$//' | sed 's/_\([a-z]\)/\U\1/g' | sed 's/^./\U&/')
        if quicktype "$schema_file" -o "$output_file" --lang typescript --just-types --nice-property-names 2>/dev/null; then
            echo -e "${GREEN}✓${NC}"
            return 0
        fi
    fi

    echo -e "${RED}✗${NC}"
    return 1
}

# Generate types for all schemas
TOTAL=0
SUCCESS=0
FAILED=0

for schema in "$SCHEMA_DIR"/*_schema.json; do
    if [ -f "$schema" ]; then
        ((TOTAL++))
        if generate_types "$schema"; then
            ((SUCCESS++))
        else
            ((FAILED++))
        fi
    fi
done

# Generate index file
echo ""
echo "Generating index file..."

cat > "$OUTPUT_DIR/index.d.ts" << 'EOF'
/**
 * MetaBuilder Schema TypeScript Definitions
 * Auto-generated from JSON schemas
 * Version: 2.0.0
 */

// Re-export all schema types
export * from './metadata_schema';
export * from './entities_schema';
export * from './types_schema';
export * from './script_schema';
export * from './components_schema';
export * from './validation_schema';
export * from './styles_schema';
export * from './api_schema';
export * from './events_schema';
export * from './config_schema';
export * from './jobs_schema';
export * from './permissions_schema';
export * from './forms_schema';
export * from './migrations_schema';
export * from './index_schema';
export * from './stdlib_schema';
EOF

echo -e "${GREEN}✓ Generated index.d.ts${NC}"

# Generate package.json for the types
cat > "$OUTPUT_DIR/package.json" << 'EOF'
{
  "name": "@metabuilder/schema-types",
  "version": "2.0.0",
  "description": "TypeScript type definitions for MetaBuilder schemas",
  "main": "index.d.ts",
  "types": "index.d.ts",
  "keywords": [
    "metabuilder",
    "schema",
    "typescript",
    "types"
  ],
  "author": "MetaBuilder Team",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/metabuilder/schemas"
  }
}
EOF

echo -e "${GREEN}✓ Generated package.json${NC}"

# Summary
echo ""
echo "================================================="
echo "Summary"
echo "================================================="
echo "Total schemas: $TOTAL"
echo "Success:       $SUCCESS"
echo "Failed:        $FAILED"
echo ""
echo "Output directory: $OUTPUT_DIR"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All types generated successfully!${NC}"
    echo ""
    echo "Usage:"
    echo "  1. npm install $OUTPUT_DIR"
    echo "  2. import { MetadataSchema } from '@metabuilder/schema-types';"
    exit 0
else
    echo -e "${YELLOW}⚠ Some types failed to generate${NC}"
    exit 1
fi
