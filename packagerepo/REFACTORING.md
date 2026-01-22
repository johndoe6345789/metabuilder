# Package Repository Workflow Refactoring

## Overview

Converting packagerepo backend to use MetaBuilder workflow system from root project.

## Architecture

**Packagerepo does NOT copy workflow code.** Instead, it:
1. Imports workflow executor from `/workflow/executor/python/`
2. Uses plugins from `/workflow/plugins/python/`
3. Adds packagerepo-specific plugins to `/workflow/plugins/python/packagerepo/`
4. Stores workflow definitions in `/packagerepo/backend/workflows/`

## Benefits

- **Single source of truth** - One workflow system for entire metabuilder project
- **Shared plugins** - Packagerepo uses same math, string, logic plugins as other apps
- **Easy updates** - Improvements to workflow system benefit all apps
- **Consistent patterns** - Same workflow format across frontend and backend

## File Structure

```
metabuilder/
├── workflow/
│   ├── executor/python/          # Workflow engine (used by packagerepo)
│   └── plugins/python/
│       ├── math/                  # Shared plugins
│       ├── string/
│       ├── logic/
│       └── packagerepo/           # Packagerepo-specific plugins
│           ├── auth_verify_jwt/
│           ├── kv_get/
│           ├── blob_put/
│           └── ...
└── packagerepo/
    └── backend/
        ├── workflow_loader.py     # Imports from root workflow system
        └── workflows/             # Workflow definitions
            ├── publish_artifact.json
            └── download_artifact.json
```

## Next Steps

1. Create packagerepo plugins in `/workflow/plugins/python/packagerepo/`
2. Update Flask app.py to use workflow_loader
3. Test publish endpoint
4. Convert remaining endpoints

## Dependencies

Packagerepo only needs to:
- Import from parent metabuilder project
- Define workflow JSON files
- Create packagerepo-specific plugins in root workflow system
