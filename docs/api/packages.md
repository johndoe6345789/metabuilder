# Packages API

Package installation and seed data management via HTTP endpoints.

## Installed Packages

### GET `/api/packages/installed`
Returns all installed packages.

Response:
```json
{
  "installed": [
    {
      "packageId": "social_forum",
      "installedAt": 1735140000000,
      "version": "1.2.0",
      "enabled": true
    }
  ]
}
```

### POST `/api/packages/installed`
Installs a package by ID using the server-side catalog and seeds. For imported packages, include `manifest` and `content`.

Request:
```json
{
  "packageId": "social_forum"
}
```

Import example:
```json
{
  "packageId": "custom_pkg",
  "manifest": {
    "id": "custom_pkg",
    "name": "Custom Package",
    "version": "1.0.0",
    "description": "",
    "author": "Anonymous",
    "category": "other",
    "icon": "package",
    "screenshots": [],
    "tags": [],
    "dependencies": [],
    "createdAt": 1735140000000,
    "updatedAt": 1735140000000,
    "downloadCount": 0,
    "rating": 0,
    "installed": false
  },
  "content": {
    "schemas": [],
    "pages": [],
    "workflows": [],
    "luaScripts": [],
    "componentHierarchy": {},
    "componentConfigs": {}
  }
}
```

Response:
```json
{
  "installed": {
    "packageId": "social_forum",
    "installedAt": 1735140000000,
    "version": "1.2.0",
    "enabled": true
  }
}
```

### PATCH `/api/packages/installed/{packageId}`
Updates enabled state for an installed package.

Request:
```json
{
  "enabled": false
}
```

### DELETE `/api/packages/installed/{packageId}`
Uninstalls a package and removes its seeded data.

Response:
```json
{
  "deleted": true
}
```

## Package Data

### GET `/api/packages/data/{packageId}`
Returns stored seed data for a package.

Response:
```json
{
  "data": {
    "users": [{ "id": "user_1" }]
  }
}
```

### PUT `/api/packages/data/{packageId}`
Replaces stored seed data for a package.

Request:
```json
{
  "data": {
    "users": [{ "id": "user_1" }]
  }
}
```

### DELETE `/api/packages/data/{packageId}`
Deletes stored seed data for a package.

Response:
```json
{
  "deleted": true
}
```
