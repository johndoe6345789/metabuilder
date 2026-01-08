#!/bin/bash
# Docker entrypoint hook for schema migrations
# Called during container startup to apply approved migrations

set -e

REGISTRY_FILE="/app/prisma/schema-registry.json"
GENERATED_PRISMA="/app/prisma/generated-from-packages.prisma"

echo "🔍 Checking for pending schema migrations..."

# Check if registry exists
if [ ! -f "$REGISTRY_FILE" ]; then
    echo "✓ No schema registry found - skipping"
    exit 0
fi

# Check for approved migrations
APPROVED_COUNT=$(cat "$REGISTRY_FILE" | python3 -c "
import json, sys
data = json.load(sys.stdin)
count = sum(1 for m in data.get('migrationQueue', []) if m['status'] == 'approved')
print(count)
")

if [ "$APPROVED_COUNT" -eq 0 ]; then
    echo "✓ No approved migrations pending"
    exit 0
fi

echo "⚠️  Found $APPROVED_COUNT approved migration(s) to apply"

# Generate Prisma schema fragment
echo "📝 Generating Prisma schema..."
npx ts-node /app/tools/codegen/schema-cli.ts generate

# Check if generated file exists
if [ ! -f "$GENERATED_PRISMA" ]; then
    echo "❌ Failed to generate Prisma schema"
    exit 1
fi

echo "📋 Generated schema fragment:"
cat "$GENERATED_PRISMA"

# Apply migrations
echo ""
echo "🚀 Running Prisma migrate..."
npx prisma migrate dev --name "package-schema-$(date +%Y%m%d%H%M%S)" --skip-generate

if [ $? -eq 0 ]; then
    echo "✓ Migrations applied successfully"
    
    # Mark migrations as applied in registry
    python3 -c "
import json

with open('$REGISTRY_FILE', 'r') as f:
    data = json.load(f)

import time
for m in data.get('migrationQueue', []):
    if m['status'] == 'approved':
        m['status'] = 'applied'
        m['appliedAt'] = int(time.time() * 1000)
        # Update entity registry
        data['entities'][m['entityName']] = {
            'checksum': m['newChecksum'],
            'version': '1.0',
            'ownerPackage': m['packageId'],
            'prismaModel': m['prismaPreview'],
            'appliedAt': m['appliedAt']
        }

with open('$REGISTRY_FILE', 'w') as f:
    json.dump(data, f, indent=2)

print('✓ Registry updated')
"
    
    # Regenerate Prisma client
    echo "🔧 Regenerating Prisma client..."
    npx prisma generate
    
    echo ""
    echo "✅ Schema migrations complete!"
else
    echo "❌ Migration failed!"
    exit 1
fi
