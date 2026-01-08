# Package Import/Export Guide

## Overview

The MetaBuilder Package Import/Export system allows you to package and share complete applications, features, or database snapshots as ZIP files. This enables modular development and easy distribution of pre-built functionality.

## Features

### Export Capabilities

1. **Custom Package Export**
   - Create reusable packages with selected components
   - Include or exclude specific data types
   - Add metadata (name, version, author, description, tags)
   - Automatic README generation

2. **Database Snapshot Export**
   - Complete backup of entire database
   - One-click export with timestamp
   - Includes all schemas, pages, workflows, scripts, and configurations

3. **Selective Export Options**
   - ✅ Data schemas
   - ✅ Page configurations
   - ✅ Workflows
   - ✅ Lua scripts
   - ✅ Component hierarchies
   - ✅ Component configurations
   - ✅ CSS classes
   - ✅ Dropdown configurations
   - ✅ Seed data
   - ✅ Assets (images, videos, audio, documents)

### Import Capabilities

1. **Package Installation**
   - Import packages from ZIP files
   - Automatic validation of package structure
   - Merge with existing data
   - Asset restoration

2. **Safety Features**
   - Package validation before import
   - Non-destructive merging (adds to existing data)
   - Import warnings and confirmations

## ZIP Package Structure

```
package-name-1.0.0.zip
├── manifest.json          # Package metadata
├── content.json           # Database content
├── README.md              # Auto-generated documentation
└── assets/                # Asset files
    ├── asset-manifest.json
    ├── images/
    │   └── *.png, *.jpg, *.svg
    ├── videos/
    │   └── *.mp4, *.webm
    ├── audios/
    │   └── *.mp3, *.wav
    └── documents/
        └── *.pdf, *.txt
```

### manifest.json

```json
{
  "id": "pkg_1234567890",
  "name": "My Package",
  "version": "1.0.0",
  "description": "Package description",
  "author": "Your Name",
  "category": "social",
  "icon": "📦",
  "screenshots": [],
  "tags": ["tag1", "tag2"],
  "dependencies": [],
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "downloadCount": 0,
  "rating": 0,
  "installed": false
}
```

### content.json

```json
{
  "schemas": [...],
  "pages": [...],
  "workflows": [...],
  "luaScripts": [...],
  "componentHierarchy": {...},
  "componentConfigs": {...},
  "cssClasses": [...],
  "dropdownConfigs": [...],
  "seedData": {...}
}
```

## Usage

### Exporting a Package

1. Navigate to **Level 4 (God Panel)** or **Level 5 (Super God Panel)**
2. Open **Package Manager**
3. Click **Export** button
4. Choose export type:
   - **Custom Package**: Configure metadata and select what to include
   - **Full Snapshot**: Export everything instantly
5. For custom packages:
   - Fill in package name (required)
   - Add version, author, description
   - Add tags for searchability
   - Select export options (checkboxes)
6. Click **Export Package**
7. ZIP file will download automatically

### Importing a Package

1. Navigate to **Level 4 (God Panel)** or **Level 5 (Super God Panel)**
2. Open **Package Manager**
3. Click **Import** button
4. Click the upload area or drag a ZIP file
5. Package will be validated and imported
6. Success message shows what was imported
7. Refresh the page if needed to see new content

## Pre-Built Packages

The system comes with several pre-built packages in the Package Catalog:

### 1. **Classic Forum** 💬
- Discussion threads and categories
- User profiles and moderation
- Schema: ForumCategory, ForumThread, ForumPost

### 2. **Retro Guestbook** 📖
- 90s-style visitor messages
- Custom backgrounds and GIFs
- Schema: GuestbookEntry

### 3. **Video Platform** 🎥
- Video upload and streaming
- Comments, likes, subscriptions
- Schema: Video, VideoComment, Subscription, Playlist

### 4. **Music Streaming Platform** 🎵
- Artists, albums, tracks
- Playlists and playback
- Schema: Artist, Album, Track, MusicPlaylist

### 5. **Retro Games Arcade** 🕹️
- Game collection with high scores
- Leaderboards and achievements
- Schema: Game, HighScore, Achievement, UserAchievement

### 6. **E-Commerce Store** 🛒
- Product catalog and inventory
- Shopping cart and orders
- Schema: Product, Cart, Order

## Best Practices

### For Package Authors

1. **Descriptive Naming**: Use clear, descriptive package names
2. **Versioning**: Follow semantic versioning (major.minor.patch)
3. **Documentation**: Add comprehensive descriptions and tags
4. **Dependencies**: List any required packages
5. **Testing**: Test your package before distribution
6. **Assets**: Include all necessary assets in the package

### For Package Users

1. **Backup First**: Export a database snapshot before importing new packages
2. **Review Contents**: Check package contents in Package Manager before installing
3. **Test in Development**: Test new packages in a development environment first
4. **Check Conflicts**: Be aware of potential schema or page ID conflicts
5. **Documentation**: Read the package README for setup instructions

## API Reference

### Export Functions

```typescript
import { exportPackageAsZip, downloadZip } from '@/lib/package-export'

// Export a custom package
const blob = await exportPackageAsZip(manifest, content, assets, options)
downloadZip(blob, 'package-name.zip')

// Export database snapshot
const blob = await exportDatabaseSnapshot(
  schemas,
  pages,
  workflows,
  luaScripts,
  componentHierarchy,
  componentConfigs,
  cssClasses,
  dropdownConfigs,
  assets
)
```

### Import Functions

```typescript
import { importPackageFromZip } from '@/lib/package-export'

// Import from ZIP file
const { manifest, content, assets } = await importPackageFromZip(zipFile)
```

## Troubleshooting

### Import Fails

- **Invalid ZIP**: Ensure the ZIP file has the correct structure
- **Missing manifest.json**: Package must include a manifest file
- **Missing content.json**: Package must include content data
- **Corrupted File**: Try re-downloading or re-exporting the package

### Export Fails

- **No Package Name**: Package name is required for custom exports
- **No Data**: Ensure your database has data to export
- **Browser Memory**: Large exports may fail on low-memory devices

### Assets Not Working

- **Path Issues**: Asset paths are preserved from the original location
- **Missing Files**: Ensure all assets were included during export
- **Format Support**: Only specific formats are supported (see structure above)

## Future Enhancements

Planned features for future versions:

- 🔄 Package versioning and updates
- 🔍 Package marketplace/registry
- 🔐 Package signing and verification
- 📦 Dependency resolution
- 🎨 Custom package icons
- 📸 Package screenshots
- 💬 Package reviews and ratings
- 🔗 Remote package installation via URL
- 📊 Package analytics

## Support

For issues or questions:
- Check the console for error messages
- Verify ZIP file structure
- Ensure you have the latest version of MetaBuilder
- Review this documentation for proper usage

---

**Note**: The import/export system is designed to be non-destructive. Imported data is merged with existing data rather than replacing it. Always backup your database before major imports.
