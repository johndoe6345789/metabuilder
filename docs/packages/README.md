# Packages Documentation

The package system enables self-contained, reusable modules with their own components, scripts, and configuration.

## Package Structure

Each package follows a standard structure:

```
packages/{name}/
├── seed/
│   ├── metadata.json           # Package info, exports, dependencies
│   ├── components.json         # Component definitions
│   ├── scripts/                # Lua scripts organized by function
│   └── index.ts                # Exports packageSeed object
├── src/                        # Optional React components
└── static_content/             # Assets (images, etc.)
```

## Key Concepts

- **Self-contained** - Each package manages its own data and logic
- **Composable** - Packages can depend on other packages
- **Declarative** - Configuration in JSON, business logic in Lua
- **Exportable** - Packages can be shared and imported

## Related Resources

- [Architecture: Packages System](../architecture/packages.md)
- [Getting Started: Quick Start](../getting-started/QUICK_START.md)
- [Development: Component Development](../guides/component-development.md)
