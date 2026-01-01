# MetaBuilder Schema Versioning Guide

## Overview

This document outlines the versioning strategy for MetaBuilder package schemas, ensuring predictable evolution and backward compatibility.

**Current Version**: 2.0.0
**Last Updated**: 2026-01-01
**Status**: Active

---

## Semantic Versioning

All MetaBuilder schemas follow [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH
```

### Version Components

- **MAJOR**: Incompatible API changes (breaking changes)
- **MINOR**: New functionality in a backward-compatible manner
- **PATCH**: Backward-compatible bug fixes

### Examples

```
1.0.0 → 1.0.1  (Bug fix: corrected regex pattern)
1.0.1 → 1.1.0  (New feature: added optional field)
1.1.0 → 2.0.0  (Breaking: removed deprecated field)
```

---

## Breaking Changes Policy

### What Constitutes a Breaking Change?

A **MAJOR version bump** is required for:

1. **Removing required fields**
   ```json
   // v1.0.0
   {"required": ["name", "email"]}

   // v2.0.0 - BREAKING
   {"required": ["name"]}  // email removed
   ```

2. **Changing field types**
   ```json
   // v1.0.0
   {"type": "string"}

   // v2.0.0 - BREAKING
   {"type": "number"}
   ```

3. **Restricting enum values**
   ```json
   // v1.0.0
   {"enum": ["read", "write", "admin"]}

   // v2.0.0 - BREAKING
   {"enum": ["read", "write"]}  // admin removed
   ```

4. **Changing validation rules** (stricter patterns, lower max values, etc.)
   ```json
   // v1.0.0
   {"pattern": "^[a-z]+$"}

   // v2.0.0 - BREAKING
   {"pattern": "^[a-z]{3,}$"}  // now requires minimum 3 chars
   ```

5. **Removing or renaming fields**
   ```json
   // v1.0.0
   {"field": {"type": "string"}}

   // v2.0.0 - BREAKING
   {"fieldName": {"type": "string"}}  // renamed
   ```

### What is NOT a Breaking Change?

A **MINOR version bump** is sufficient for:

1. **Adding optional fields**
   ```json
   // v1.0.0
   {"properties": {"name": {}}}

   // v1.1.0 - OK
   {"properties": {"name": {}, "description": {}}}
   ```

2. **Expanding enum values**
   ```json
   // v1.0.0
   {"enum": ["read", "write"]}

   // v1.1.0 - OK
   {"enum": ["read", "write", "admin"]}
   ```

3. **Relaxing validation** (looser patterns, higher max values)
   ```json
   // v1.0.0
   {"maxLength": 50}

   // v1.1.0 - OK
   {"maxLength": 100}
   ```

4. **Adding new schema files**
5. **Improving documentation/descriptions**
6. **Adding examples**

---

## Deprecation Process

### Deprecation Timeline

1. **Announcement** (Version N): Mark as deprecated, add warnings
2. **Grace Period** (Version N+1): Feature still works but logs warnings
3. **Removal** (Version N+2): Feature removed (breaking change)

### Minimum Grace Period

- **Major schemas** (metadata, entities, script): 6 months
- **Minor schemas** (styles, forms): 3 months
- **Critical security fixes**: May skip grace period

### Example: Deprecating `field.primary`

```
v1.0.0 (2024-06-01)
  - field.primary supported

v1.5.0 (2024-09-01) - DEPRECATION ANNOUNCED
  - field.primary marked as deprecated
  - Documentation updated with migration guide
  - Schema validation emits warnings

v2.0.0 (2025-03-01) - REMOVAL (6 months later)
  - field.primary removed
  - entity.primaryKey is the only supported method
  - Schema validation fails for field.primary
```

### Deprecation Markers

Use these patterns to deprecate fields:

```json
{
  "field": {
    "type": "object",
    "properties": {
      "oldField": {
        "type": "string",
        "deprecated": {
          "since": "1.5.0",
          "reason": "Use newField instead for better type safety",
          "alternative": "newField",
          "removeIn": "2.0.0"
        }
      }
    }
  }
}
```

Or use JSON Schema `not` constraint:

```json
{
  "field": {
    "not": {
      "required": ["primary"],
      "description": "DEPRECATED: field.primary is no longer supported. Use entity.primaryKey instead."
    }
  }
}
```

---

## Version Compatibility Matrix

### Schema Inter-Dependencies

| Schema | v1.0 | v1.5 | v2.0 |
|--------|------|------|------|
| **metadata** | 1.0.0 | 1.0.0 | 1.0.0 |
| **entities** | 1.0.0 | 1.0.0 | 2.0.0 |
| **types** | 1.0.0 | 1.0.0 | 1.0.0 |
| **script** | 1.0.0 | 2.1.0 | 2.2.0 |
| **validation** | 1.0.0 | 1.0.0 | 2.0.0 |
| **api** | 1.0.0 | 1.0.0 | 1.0.0 |
| **forms** | 1.0.0 | 1.0.0 | 1.1.0 |
| **config** | 1.0.0 | 1.0.0 | 1.0.0 |

### Runtime Compatibility

- Schemas can be mixed across MINOR versions
- All schemas in a package must use compatible MAJOR versions
- Runtime validates schema compatibility on load

---

## Migration Guides

### General Migration Steps

1. **Audit current usage**
   ```bash
   # Find deprecated field usage
   grep -r '"primary":' entities/
   ```

2. **Update schema version**
   ```json
   {
     "schemaVersion": "2.0.0"  // Update from "1.0.0"
   }
   ```

3. **Apply schema-specific migrations** (see below)

4. **Validate**
   ```bash
   ./schema_validator.sh entities/schema.json
   ```

5. **Test thoroughly**

### Schema-Specific Migrations

#### Entities Schema: v1.0 → v2.0

**Change**: `field.primary` → `entity.primaryKey`

```javascript
// migrate-entities-v2.js
function migrate(schema) {
  for (const entity of schema.entities) {
    let primaryKey = null;

    // Find and remove field.primary
    for (const [name, field] of Object.entries(entity.fields)) {
      if (field.primary) {
        primaryKey = name;
        delete field.primary;  // Remove deprecated
      }
    }

    // Set entity.primaryKey
    if (primaryKey && !entity.primaryKey) {
      entity.primaryKey = primaryKey;
    }
  }

  schema.schemaVersion = "2.0.0";
  return schema;
}
```

**CLI Migration**:
```bash
# Automated migration
node scripts/migrate-entities-v2.js entities/schema.json

# Manual migration
# 1. Move primary key to entity level
# 2. Remove field.primary properties
# 3. Update schemaVersion to "2.0.0"
```

#### Validation Schema: v1.0 → v2.0

**Change**: `sanitize` default changed from `false` → `true`

```json
// v1.0.0 - explicit opt-in
{
  "params": [{
    "name": "userInput",
    "type": "string",
    "sanitize": true  // Must explicitly enable
  }]
}

// v2.0.0 - secure by default
{
  "params": [{
    "name": "userInput",
    "type": "string"
    // sanitize: true is now default
  }]
}
```

**Migration**:
```bash
# If you need unsanitized input (rare!), explicitly disable:
{
  "params": [{
    "name": "trustedContent",
    "type": "string",
    "sanitize": false  // ONLY for trusted sources
  }]
}
```

#### Script Schema: v2.1 → v2.2

**Change**: Added visual programming metadata (non-breaking)

```json
// v2.1.0 - basic function
{
  "functions": [{
    "id": "calc",
    "name": "calculate",
    "params": [],
    "body": []
  }]
}

// v2.2.0 - with visual metadata (optional)
{
  "functions": [{
    "id": "calc",
    "name": "calculate",
    "params": [],
    "body": [],
    "visual": {  // NEW: optional visual metadata
      "icon": "💰",
      "color": "#27ae60",
      "category": "math"
    }
  }]
}
```

**Migration**: No changes required (backward compatible)

---

## Release Process

### Pre-Release Checklist

- [ ] All tests pass
- [ ] Documentation updated
- [ ] CHANGELOG.md updated
- [ ] Migration guide written (for MAJOR)
- [ ] Examples updated
- [ ] Deprecation warnings added (if applicable)

### Release Types

#### Patch Release (1.0.0 → 1.0.1)
- Bug fixes only
- No API changes
- Immediate release

#### Minor Release (1.0.0 → 1.1.0)
- New features
- Backward compatible
- 1-week beta period

#### Major Release (1.0.0 → 2.0.0)
- Breaking changes
- 4-week beta period
- Migration tools provided
- Blog post announcement

### Release Channels

1. **Stable**: Production-ready releases
2. **Beta**: Feature-complete, testing phase
3. **Alpha**: Early access, may have bugs
4. **Nightly**: Automated builds, unstable

---

## Backward Compatibility Guarantees

### What We Guarantee

✅ **Within MAJOR versions**:
- Existing valid data remains valid
- No required fields added
- Enum values not removed
- Validation not stricter

✅ **Across MINOR versions**:
- Can upgrade without code changes
- New features are optional

### What We Don't Guarantee

❌ **Internal implementation**:
- Validation algorithm changes
- Error message format
- Schema file organization

❌ **Deprecated features**:
- May be removed in next MAJOR version
- No guarantee of continued support

❌ **Alpha/Beta releases**:
- No stability guarantees
- Breaking changes allowed

---

## Version Detection

### Runtime Version Check

```javascript
import { validateSchemaVersion } from '@metabuilder/schema-validator';

const schema = require('./entities/schema.json');

// Check compatibility
const result = validateSchemaVersion(schema, {
  expected: '2.x.x',  // Accept any 2.x version
  strict: false        // Allow newer versions
});

if (!result.compatible) {
  console.error(`Incompatible schema version: ${result.message}`);
}
```

### Schema Version in Files

All schema files must include `schemaVersion`:

```json
{
  "$schema": "https://metabuilder.dev/schemas/entities.schema.json",
  "schemaVersion": "2.0.0",
  "entities": [...]
}
```

---

## Changelog Format

Use [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [2.0.0] - 2025-03-01

### Breaking Changes
- **entities**: Removed `field.primary`, use `entity.primaryKey` instead
- **validation**: Changed `sanitize` default from `false` to `true`

### Added
- **forms**: Added ARIA accessibility properties
- **validation**: Added `ValidationResult` type definition

### Changed
- **config**: Improved security guidance for secret providers

### Deprecated
- Nothing deprecated in this release

### Removed
- **entities**: `field.primary` (deprecated in v1.5.0)

### Fixed
- **api**: Fixed body validation defaults documentation

### Security
- **validation**: Input sanitization now enabled by default
```

---

## Getting Help

### Version-Related Issues

1. Check the migration guide for your version
2. Search [GitHub Issues](https://github.com/metabuilder/schemas/issues)
3. Ask in [Discord #schema-help](https://discord.gg/metabuilder)
4. Email: schemas@metabuilder.dev

### Reporting Bugs

Include:
- Current schema version
- Target schema version
- Minimal reproduction example
- Migration steps attempted

---

## Contributing

### Proposing Breaking Changes

1. Open GitHub issue with `[BREAKING]` prefix
2. Explain rationale and migration path
3. Wait for community feedback (minimum 2 weeks)
4. Submit PR with migration guide

### Version Bump Guidelines

When submitting a PR, increment the version in:
- Schema file `schemaVersion` field
- CHANGELOG.md
- Documentation examples

---

## Appendix

### Quick Reference

| Change Type | Version Bump | Example |
|------------|--------------|---------|
| Bug fix | PATCH | 1.0.0 → 1.0.1 |
| New optional field | MINOR | 1.0.0 → 1.1.0 |
| New schema file | MINOR | 1.0.0 → 1.1.0 |
| Enum expansion | MINOR | 1.0.0 → 1.1.0 |
| Remove required field | MAJOR | 1.0.0 → 2.0.0 |
| Rename field | MAJOR | 1.0.0 → 2.0.0 |
| Enum restriction | MAJOR | 1.0.0 → 2.0.0 |
| Stricter validation | MAJOR | 1.0.0 → 2.0.0 |

### Related Documents

- [SCHEMAS_README.md](./SCHEMAS_README.md) - Schema overview
- [QUICKSTART.md](./QUICKSTART.md) - Getting started guide
- [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md) - Recent changes
- [CHANGELOG.md](./CHANGELOG.md) - Version history

---

**Document Version**: 1.0.0
**Last Updated**: 2026-01-01
**Maintained by**: MetaBuilder Team

*Generated with Claude Code*
