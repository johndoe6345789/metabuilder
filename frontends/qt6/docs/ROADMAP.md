# Qt6 Frontend Roadmap

**Status**: Compiles and links (26 QML views, ~14,500 LOC)
**Last Build**: 2026-03-19 | Qt 6.7.3 via Conan | MSVC 19.5 | C++20

---

## Completed

### Phase 1: Qt5 → Qt6 Migration
- [x] Replace versioned imports (`import QtQuick 2.15` → `import QtQuick`) across 62 files
- [x] Remove `QtGraphicalEffects` (4 files) — shadows dropped, Qt6 has no direct equivalent without Qt5Compat
- [x] Replace `TabView`/`Tab` (Qt Quick Controls 1) with `TabBar` + `StackLayout`
- [x] Stub `ModPlayer` — libopenmpt not available via Conan; Qt6 `QAudioSink` API ready when it is
- [x] Fix `QJSValue::engine()` removal in `DBALClient.cpp`
- [x] Fix `MaterialLanding.qml` brace nesting
- [x] Fix `PackageManager.qml` `modelData` access and `onClicked` scoping
- [x] Add `CMAKE_AUTOMOC`, `QTP0001` policy, `/Zc:__cplusplus` for MSVC
- [x] Remove unused `cpr` dependency

### Phase 2: Shared Component Library Migration
- [x] Migrate from local `qmllib/Material/` (35 components) to shared `/qml/` library (`QmlComponents 1.0`, 119 components)
- [x] Update all 22 package views to use `QmlComponents 1.0`
- [x] Add `engine.addImportPath()` in `main.cpp` for runtime QML resolution
- [x] Map component APIs: `MaterialButton` → `CButton`, `MaterialPalette` → `Theme`, etc.
- [x] Fix API differences: `CListItem.title` (not `.text`), `CTabBar.tabs` (not `.model`), `CAlert.text` (not `.message`)

### Phase 3: 5-Level Navigation (old/ Vision Restored)
- [x] `App.qml` — Main shell with app bar, level badges, sidebar, `StackLayout` router
- [x] Auth system — 4 seed users (demo/admin/god/super), level-gated navigation
- [x] Level 1: `FrontPage.qml` — Hero, feature cards, tabbed CI/status panels
- [x] Level 1: `LoginView.qml` — Credentials form with seed user hints
- [x] Level 2: `DashboardView.qml` — Stats cards, activity feed, quick actions
- [x] Level 2: `ProfileView.qml` — Avatar, bio, password change, connected accounts
- [x] Level 2: `CommentsView.qml` — Post/like/delete, sort, role-based visibility
- [x] Level 3: `AdminView.qml` — 10 entities, CRUD dialogs, search, filter, pagination, bulk delete (871 LOC)
- [x] Level 4: `GodPanel.qml` — 14-tab builder container with config summary
- [x] Level 5: `SuperGodPanel.qml` — Tenants, god users, power transfer, system health

### Phase 4: God Panel Builder Tools (15 Agents)
- [x] `SchemaEditor.qml` — Visual JSON schema editor (634 LOC)
- [x] `WorkflowEditor.qml` — Node-based DAG editor with test runner (772 LOC)
- [x] `LuaEditor.qml` — Code editor, parameters, snippets, security scan (910 LOC)
- [x] `DatabaseManager.qml` — 14 DBAL backends, connection test, adapter patterns (467 LOC)
- [x] `PageRoutesManager.qml` — Route table, level/layout config (524 LOC)
- [x] `ComponentHierarchyEditor.qml` — UI tree editor with properties (468 LOC)
- [x] `CssClassManager.qml` — Style class editor with live preview (691 LOC)
- [x] `DropdownConfigManager.qml` — Select field config with reorder (785 LOC)
- [x] `UserManagement.qml` — User CRUD, role filter, SHA-512 badge (676 LOC)
- [x] `ThemeEditor.qml` — 9 theme selector, color swatches, typography (876 LOC)
- [x] `SMTPConfigEditor.qml` — Server config, test send, email templates (632 LOC)

### Phase 5: DBAL Integration
- [x] Register `DBALClient` as QML context property in `main.cpp`
- [x] Migrate to DBAL REST API: `/api/v1/{tenant}/{package}/{entity}[/{id}]`
- [x] Add `packageId` property to DBALClient (C++ + QML), default `"core"`
- [x] Wire `AdminView` entity table to DBAL REST endpoints with mock fallback
- [x] Wire `SchemaEditor` to load schemas from DBAL with mock fallback
- [x] Wire `UserManagement` to real User entity CRUD with mock fallback
- [x] Wire `DashboardView` health cards to `/health` endpoint
- [x] Add DBAL connection status indicator in app bar (green/red dot + "DBAL")
- [x] Add DBAL offline banner below app bar ("DBAL Offline — showing cached data")
- [x] Add `health()`, `version()`, `status()`, `listSchemas()`, `getSchema()` to C++ DBALClient
- [x] `DBALProvider.qml` — REST-based QML HTTP client with `entityPath()` helpers

### Phase 6: Build System (Python + stdlib)
- [x] Create `generate_cmake.py` — zero-dependency script (Python stdlib only)
  - Globs all `*.qml` files automatically (root, qmllib/, packages/)
  - Reads `metadata.json` from each package for auto-registration
  - Discovers `src/*.cpp` and `src/*.h` for C++ sources
  - Handles SVG/audio/resource globbing
  - Supports conditional features (libopenmpt, Qt Multimedia)
- [x] Create `cmake_config.json` defining modules, dependencies, feature flags
- [x] `--dry-run` mode to preview generated CMakeLists.txt
- [x] `--output` and `--config` CLI options

### Phase 7: Runtime Polish
- [x] Dark/light theme switching (toggle button in app bar)
- [x] Keyboard shortcuts (Ctrl+K search, Ctrl+L login/logout, Ctrl+1-5 level switch, Escape back)
- [x] Window state persistence via `Qt.labs.settings` (size, position, theme)
- [x] Error boundary — DBAL offline banner with warning styling

### Phase 4.5: Media Service Integration
- [x] `MediaServicePanel.qml` — 4-tab media service management (~730 LOC)
  - Jobs tab: submission form, active jobs table, progress bars, cancel
  - Radio tab: channel management, playlists, start/stop streaming
  - TV tab: channel scheduling, multi-resolution, broadcast controls
  - Plugins tab: FFmpeg/ImageMagick/Pandoc/Radio/LibRetro grid with reload
- [x] Integrated into GodPanel as tab 12 (14 total tabs)
- [x] Separate HTTP client for media service at `http://localhost:8090`

---

## Planned

### Phase 8: Package System
- [ ] Dynamic package view loading from disk (PackageViewLoader → real file resolution)
- [ ] Package install/uninstall with metadata validation
- [ ] Package dependency resolution (metadata.json `dependencies` field)
- [ ] Hot-reload QML when package files change (QFileSystemWatcher)

### Phase 9: Audio & Media
- [ ] Integrate libopenmpt via Conan when available (ModPlayer currently stubbed)
- [ ] Add Qt6 Multimedia (`QAudioSink`) for .mod playback
- [ ] Waveform visualizer in ModPlayerPanel

### Phase 10: Production Readiness
- [ ] Installer (Qt Installer Framework or NSIS)
- [ ] Code signing (Windows Authenticode)
- [ ] Auto-update mechanism
- [ ] Crash reporter
- [ ] Telemetry opt-in
- [ ] CI/CD: GitHub Actions build matrix (Windows, macOS, Linux)

---

## Architecture

```
App.qml (ApplicationWindow)
├── CAppBar (Level nav + auth + DBAL status + theme toggle)
├── DBAL Offline Banner (conditional warning strip)
├── Sidebar (CListItem navigation, level-gated)
├── Settings (Qt.labs.settings — window size/position/theme persistence)
├── Shortcuts (Ctrl+K/L/1-5, Escape)
└── StackLayout (17 views)
    ├── FrontPage          (Level 1 - Public)
    ├── LoginView          (Auth)
    ├── DashboardView      (Level 2 - User, DBAL health)
    ├── ProfileView        (Level 2)
    ├── CommentsView       (Level 2)
    ├── PackageViewLoader×6 (Level 2 - Forum, Gallery, etc.)
    ├── AdminView          (Level 3 - Django CRUD, DBAL REST)
    ├── GodPanel           (Level 4 - 14-tab builder)
    │   ├── SchemaEditor      (DBAL REST)
    │   ├── WorkflowEditor
    │   ├── LuaEditor
    │   ├── DatabaseManager
    │   ├── PageRoutesManager
    │   ├── ComponentHierarchyEditor
    │   ├── CssClassManager
    │   ├── DropdownConfigManager
    │   ├── UserManagement    (DBAL REST)
    │   ├── ThemeEditor
    │   ├── SMTPConfigEditor
    │   └── MediaServicePanel (Media Daemon REST)
    ├── PackageManager     (Level 4)
    ├── Storybook          (Level 4)
    └── SuperGodPanel      (Level 5 - Tenants + Power Transfer)

C++ Backend
├── PackageRegistry   (JSON metadata loader)
├── ModPlayer         (stub — libopenmpt pending)
└── DBALClient        (REST client → DBAL daemon :8080)
    ├── CRUD: /api/v1/{tenant}/{package}/{entity}[/{id}]
    ├── System: /health, /version, /status
    └── Schema: /api/v1/{tenant}/schema[/{entity}]

Build System
├── generate_cmake.py  (auto-generates CMakeLists.txt from file globs)
└── cmake_config.json  (project config, Qt components, feature flags)

Shared: /qml/ QmlComponents 1.0 (119 components, 9 themes, 19 languages)
```
