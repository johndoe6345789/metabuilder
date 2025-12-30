# Nerd Mode IDE

The Nerd Mode IDE is a package-aware editor that can:
- Load template workspaces (Next.js starter or MetaBuilder package blueprints)
- Edit Lua, JSON, and TypeScript files in a structured tree
- Export the current workspace to a zip bundle

## Template Workspaces

Templates ship with:
- A root folder (workspace name)
- Subfolders that mirror package layout (Lua, metadata, static)
- Seed JSON ready for packages

The Social Hub template includes:
- `Lua/` scripts for lifecycle, permissions, moderation, analytics
- `metadata/` package metadata + components
- `static/` example data and a CLI stub

## Exporting a Zip

Use the download action in the IDE header to export the workspace as a zip:
1. Load a template
2. Edit files as needed
3. Click the export icon to download `<workspace>.zip`

## Packages Route

The app serves package assets from `/packages/...` using the app router.
This enables runtime loading of:
- `seed/metadata.json`
- `seed/components.json`
- `seed/scripts/*`
- `static_content/*`

## Notes

- New files under folders with `exportPath` inherit the correct on-disk path.
- Lua scripts are listed in `seed/scripts/manifest.json` for dynamic loading.
