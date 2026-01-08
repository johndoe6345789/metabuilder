# Create New Package

Create a new MetaBuilder package with the standard structure:

```
packages/{name}/
├── seed/
│   ├── metadata.json      # Package info, version, dependencies
│   ├── components.json    # Component definitions
│   └── scripts/           # Lua scripts (optional)
├── static_content/        # Assets (optional)
└── tests/
    └── README.md
```

Required metadata.json format:
```json
{
  "packageId": "{name}",
  "name": "Display Name",
  "version": "1.0.0",
  "description": "Package description",
  "author": "MetaBuilder",
  "category": "ui",
  "dependencies": [],
  "exports": { "components": [] }
}
```
