# MetaBuilder Schema Examples

This directory contains example packages demonstrating MetaBuilder schema usage.

## Directory Structure

```
examples/
├── minimal-package/       # Bare minimum valid package
├── complete-package/      # Comprehensive example with all features
└── advanced-features/     # Advanced patterns and techniques
```

## Minimal Package

The simplest valid MetaBuilder package with only required fields.

**Files included:**
- `package.json` - Basic metadata
- `entities/schema.json` - Single User entity
- `scripts/index.json` - Simple script examples

**Purpose:** Quick start template, understanding minimum requirements

**Validation:**
```bash
cd minimal-package
../../schema_validator.sh package.json
../../schema_validator.sh entities/schema.json
../../schema_validator.sh scripts/index.json
```

## Complete Package

A production-ready example demonstrating all major features.

**Files included:**
- `package.json` - Full metadata with dependencies, exports, tests
- `entities/schema.json` - Multiple entities with relationships, indexes, ACL
- `types/index.json` - Type definitions with utility types
- `api/routes.json` - RESTful API with authentication, rate limiting
- `validation/validators.json` - Custom validation functions
- `components/ui.json` - UI components
- `forms/forms.json` - Dynamic forms
- `events/definitions.json` - Event-driven architecture
- `permissions/roles.json` - RBAC configuration
- `config/settings.json` - Configuration management
- `jobs/tasks.json` - Background jobs
- `migrations/versions.json` - Database migrations
- `styles/tokens.json` - Design tokens
- `storybook/config.json` - Storybook configuration for preview and docs

**Purpose:** Reference implementation, production patterns, best practices

**Features demonstrated:**
- ✅ Complete entity relationships (belongsTo, hasMany, hasOne)
- ✅ Row-level security (ACL)
- ✅ API authentication and authorization
- ✅ Cross-schema validation
- ✅ Version compatibility
- ✅ Security best practices (sanitization, password validation)
- ✅ Type safety with TypeScript-style types
- ✅ Event-driven architecture
- ✅ Background job scheduling
- ✅ Dynamic form generation
- ✅ Storybook integration with context variants and controls

## Advanced Features

Specialized examples for advanced use cases.

**Topics covered:**
- Generic types and type constraints
- Complex validation logic
- Visual programming metadata
- Standard library usage
- Multi-step workflows
- WebSocket events
- GraphQL resolvers
- Complex migrations
- A/B testing with feature flags
- Performance optimization

## Validation

All examples are validated against their respective schemas:

```bash
# Validate all examples
cd examples
find . -name "*.json" -type f -exec ../../schema_validator.sh {} \;

# Validate specific package
cd complete-package
../../schema_validator.sh package.json
```

## Using as Templates

Copy any example directory to bootstrap your package:

```bash
# Start from minimal example
cp -r schemas/package-schemas/examples/minimal-package my-new-package
cd my-new-package

# Customize
vim package.json  # Update packageId, name, description

# Validate
../schema_validator.sh package.json
```

## Schema Versions

All examples use schema version **2.0.0** which includes:
- ✅ Secure-by-default input sanitization
- ✅ Deprecated `field.primary` removed (use `entity.primaryKey`)
- ✅ Visual programming metadata support
- ✅ Enhanced cross-schema validation

## Learning Path

1. **Start here:** `minimal-package/` - Understand basics
2. **Expand knowledge:** `complete-package/` - See all features working together
3. **Master advanced:** `advanced-features/` - Specialized patterns

## Best Practices Demonstrated

### Security
- ✅ Input sanitization enabled by default
- ✅ Strong password validation patterns
- ✅ Role-based access control (RBAC)
- ✅ Row-level security in entities
- ✅ Rate limiting on API routes
- ✅ CORS configuration

### Architecture
- ✅ Clear separation of concerns
- ✅ Type safety with explicit schemas
- ✅ Event-driven patterns
- ✅ RESTful API design
- ✅ Database normalization

### Developer Experience
- ✅ Comprehensive documentation
- ✅ Explicit versioning
- ✅ Validation at multiple levels
- ✅ Clear error messages
- ✅ Examples and templates

## Common Patterns

### Creating a CRUD API

See `complete-package/api/routes.json` for:
- List with pagination
- Get by ID
- Create with validation
- Update (full and partial)
- Delete (soft delete)

### Entity Relationships

See `complete-package/entities/schema.json` for:
- One-to-many (User → Posts)
- One-to-one (User → Profile)
- Foreign key constraints
- Cascade delete

### Type Safety

See `complete-package/types/index.json` for:
- Object types
- Enums
- Utility types (Omit, Pick, Partial)
- Type reuse

### Authentication & Authorization

See `complete-package/api/routes.json` and `permissions/roles.json` for:
- Bearer token auth
- Role-based permissions
- Route-level authorization
- Resource-level access control

## Troubleshooting

### Schema Validation Fails

**Check:**
1. Required fields are present
2. `schemaVersion` matches (2.0.0)
3. Type references exist in types schema
4. Handler functions exist in scripts schema

**Common issues:**
- Missing `schemaVersion` field
- Using deprecated `field.primary` instead of `entity.primaryKey`
- Handler function not exported
- Type reference doesn't match type name exactly

### Cross-Schema References Not Working

Ensure:
1. Referenced items are exported
2. Names match exactly (case-sensitive)
3. All schemas use compatible versions

## Contributing

To add new examples:

1. Create directory under `examples/`
2. Include README.md explaining the example
3. Ensure all JSON files validate
4. Add to this master README
5. Test cross-schema validation

## Resources

- [Schema Documentation](../SCHEMAS_README.md)
- [Versioning Guide](../VERSIONING.md)
- [Quick Start](../QUICKSTART.md)
- [Improvements Summary](../IMPROVEMENTS_SUMMARY.md)

---

**Last Updated:** 2026-01-01
**Schema Version:** 2.0.0
**Maintained by:** MetaBuilder Team

Generated with Claude Code
