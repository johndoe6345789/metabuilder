# Packages Folder

This folder contains modular packages for the MetaBuilder application. Each package is self-contained with its own components, metadata, and examples.

## Structure

Each package follows this structure:

```
packages/
  ├── package_name/
  │   ├── seed/
  │   │   ├── components.json    # Component definitions
  │   │   ├── metadata.json      # Package metadata
  │   │   └── scripts/           # Optional Lua scripts
  │   └── static_content/
  │       └── examples.json      # Optional usage examples
```

## Available Packages

- **admin_dialog**: Admin dialog components for management interfaces
- **data_table**: Data table components for displaying tabular data
- **form_builder**: Form builder components for creating dynamic forms
- **nav_menu**: Navigation menu components
- **dashboard**: Dashboard layout components
- **notification_center**: Notification center components
- **social_hub**: Social feed components with creator tools and live rooms
- **codegen_studio**: Code generation studio with template-driven exports
- **forum_forge**: Modern forum starter with categories, threads, and moderation
- **arcade_lobby**: Gaming lobby with queues, tournaments, and party setup
- **stream_cast**: Live streaming control room with schedules and scene control

## Package Metadata Format

Each `metadata.json` file should contain:

```json
{
  "packageId": "package_name",
  "name": "Display Name",
  "version": "1.0.0",
  "description": "Package description",
  "author": "Author name",
  "category": "ui",
  "dependencies": [],
  "exports": {
    "components": []
  }
}
```

## Components Format

Each `components.json` file should contain an array of component definitions.

## Development

The main application imports from these packages via relative paths in `src/lib/package-glue.ts`.

To add a new package:

1. Run `npm run setup-packages <package-name>` to create the package structure
2. Add optional `static_content/examples.json` if needed
3. Update `src/lib/package-glue.ts` to import the new package
4. Commit the new package files to the repository
