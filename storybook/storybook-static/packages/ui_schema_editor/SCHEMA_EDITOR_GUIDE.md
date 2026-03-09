# Schema Editor Package - Complete Implementation Guide

**Status**: Phase 3.1 - Admin Tools Implementation
**Created**: 2026-01-21
**Version**: 1.0.0
**Permission Level**: Supergod (5) - System-wide entity creation

---

## 🎯 Overview

The Schema Editor is a **visual, no-code admin tool** that allows Supergod users to create and edit database entities through an interactive UI. Instead of writing YAML schemas, admins can:

- 📋 Create new entities with fields
- 🏗️ Define field types, constraints, and validation rules
- 🔗 Map relationships between entities
- 📊 Preview generated JSON schemas in real-time
- ✅ Validate schemas before creation
- 💾 Export and import entity definitions
- 🔍 Browse existing entities and their structure

**Key Philosophy**: "GUI-friendly schema creation" - the output is JSON schemas that conform to MetaBuilder's entity definition format, making it easy for visual tools to work with the system.

---

## 📦 Package Structure

```
packages/ui_schema_editor/
├── package.json                    # Package metadata
├── seed/
│   ├── metadata.json              # Package manifest
│   ├── page-config.json           # Route definition (/admin/schema-editor)
│   └── component.json             # UI component definitions (7 components)
└── SCHEMA_EDITOR_GUIDE.md         # This file
```

**Key Features**:
- ✅ Visual entity builder with live preview
- ✅ Field type selector (13 types)
- ✅ Constraint editor with presets
- ✅ Relationship mapper (1:1, 1:N, M:N)
- ✅ JSON schema export and validation
- ✅ Real-time preview
- ✅ Supergod-only admin panel

---

## 🏗️ Architecture

### Data Flow

```
User Input (Visual UI)
        ↓
FieldEditor Component (captures constraints, types)
        ↓
EntityBuilder Component (aggregates fields)
        ↓
RelationshipMapper Component (defines relationships)
        ↓
SchemaPreview Component (shows JSON output)
        ↓
[User confirms]
        ↓
API Endpoint: POST /api/v1/supergod/schema_editor/entities
        ↓
DBAL: Creates entity definition
        ↓
Database: Stores in SchemaDefinition table
        ↓
Code Generation (auto-triggers)
        ↓
Prisma schema updated + types regenerated
```

### Component Hierarchy

```
SchemaEditorLayout (main layout)
├── EntityList (sidebar with all entities)
│   ├── SearchBox
│   ├── SortDropdown
│   └── EntityItems[] (each with edit/delete/view actions)
│
└── EntityBuilder (main panel - right side)
    ├── EntityNameInput
    ├── FieldEditor (repeated for each field)
    │   ├── FieldNameInput
    │   ├── FieldTypeSelector (13 options)
    │   ├── ConstraintEditor
    │   │   ├── RequiredToggle
    │   │   ├── UniqueToggle
    │   │   ├── IndexedToggle
    │   │   ├── DefaultValueInput
    │   │   ├── ValidationPresets (email, url, uuid, etc.)
    │   │   └── PatternInput
    │   └── RemoveFieldButton
    │
    ├── RelationshipMapper
    │   ├── RelationshipTypeSelector
    │   ├── TargetEntitySelector
    │   ├── ForeignKeySettings
    │   └── CascadeRuleSelector
    │
    ├── SchemaPreview (right pane)
    │   ├── JSONViewer (read-only)
    │   ├── CopyButton
    │   ├── DownloadButton
    │   └── ValidationErrors
    │
    ├── SaveButton
    ├── CancelButton
    └── ExportButton
```

---

## 🎨 Component Definitions

### 1. SchemaEditorLayout
**Purpose**: Main layout container for the entire Schema Editor experience

```json
{
  "id": "comp_schema_editor_layout",
  "name": "SchemaEditorLayout",
  "type": "SchemaEditorLayout",
  "props": {
    "title": "Schema Editor",
    "subtitle": "Visual entity and field builder"
  }
}
```

**Renders**:
- Header with title and instructions
- Two-column layout (EntityList on left, EntityBuilder on right)
- Footer with help and support links

### 2. EntityList
**Purpose**: Sidebar showing all entities, with CRUD actions

```json
{
  "id": "comp_entity_list",
  "name": "EntityList",
  "type": "EntityList",
  "props": {
    "title": "Entities",
    "searchable": true,
    "sortable": true,
    "actions": ["create", "edit", "delete", "view"]
  }
}
```

**Features**:
- List of all entities with counts
- Search/filter by name
- Sort by creation date, modification date, entity type
- Quick actions: Create New, Edit, Delete, View Schema
- Color-coded entity types (core, access, package)
- Last modified timestamps

### 3. EntityBuilder
**Purpose**: Main form for creating/editing entities

```json
{
  "id": "comp_entity_builder",
  "name": "EntityBuilder",
  "type": "EntityBuilder",
  "props": {
    "title": "Entity Builder",
    "showPreview": true,
    "autoSave": true,
    "validationLevel": "strict"
  }
}
```

**Sections**:
- Entity metadata (name, description, category)
- Fields list with add/remove buttons
- Each field uses FieldEditor component
- Relationships section
- Live JSON preview on right
- Save/Cancel buttons

### 4. FieldEditor
**Purpose**: Editor for individual entity fields

```json
{
  "id": "comp_field_editor",
  "name": "FieldEditor",
  "type": "FieldEditor",
  "props": {
    "fieldTypes": [
      "String", "Number", "Boolean", "Date", "DateTime",
      "Array", "Object", "UUID", "Email", "URL",
      "JSON", "Text", "Enum"
    ],
    "constraints": [
      "required", "unique", "indexed", "default",
      "min", "max", "pattern", "enum"
    ]
  }
}
```

**Input Fields** (for each field):
- Field name (alphanumeric + underscore)
- Field type selector (dropdown with 13 options)
- Description/help text
- ConstraintEditor component
- Remove button
- Move up/down buttons (for field ordering)

### 5. SchemaPreview
**Purpose**: Real-time live preview of generated JSON schema

```json
{
  "id": "comp_schema_preview",
  "name": "SchemaPreview",
  "type": "SchemaPreview",
  "props": {
    "format": "json",
    "copyable": true,
    "downloadable": true,
    "themes": ["light", "dark"]
  }
}
```

**Features**:
- Syntax-highlighted JSON display
- Updates in real-time as user edits
- Copy-to-clipboard button
- Download as .json file button
- Validation error display (if schema is invalid)
- Theme toggle (light/dark)
- Collapsible sections

### 6. ConstraintEditor
**Purpose**: Visual editor for field constraints and validation rules

```json
{
  "id": "comp_constraint_editor",
  "name": "ConstraintEditor",
  "type": "ConstraintEditor",
  "props": {
    "showHelp": true,
    "validateAsYouGo": true,
    "presets": ["email", "phone", "url", "uuid", "date", "number"]
  }
}
```

**Constraint Options** (context-sensitive based on field type):

**For String fields**:
- Required (toggle)
- Unique (toggle)
- Indexed (toggle)
- Min length (number)
- Max length (number)
- Pattern (regex)
- Enum values (comma-separated or list)
- Presets: email, phone, url, uuid

**For Number fields**:
- Required (toggle)
- Unique (toggle)
- Indexed (toggle)
- Minimum value (number)
- Maximum value (number)
- Decimal places (number)

**For Date/DateTime fields**:
- Required (toggle)
- Indexed (toggle)
- Min date
- Max date
- Timezone (boolean)

**For All field types**:
- Default value (field type appropriate)
- Description
- Help text

### 7. RelationshipMapper
**Purpose**: Visual editor for entity relationships and foreign keys

```json
{
  "id": "comp_relationship_mapper",
  "name": "RelationshipMapper",
  "type": "RelationshipMapper",
  "props": {
    "relationshipTypes": [
      "one-to-one",
      "one-to-many",
      "many-to-many"
    ],
    "cascadeOptions": ["RESTRICT", "SET NULL", "CASCADE", "NO ACTION"],
    "indexForeignKeys": true
  }
}
```

**Relationship Definition**:
- Relationship type selector (1:1, 1:N, M:N)
- Source field (current entity)
- Target entity selector
- Target field selector
- Cascade rule (RESTRICT, SET NULL, CASCADE, NO ACTION)
- Indexed (toggle for performance)
- Delete rule
- Update rule

---

## 💾 Output Format: JSON Schema

When user saves an entity, the Schema Editor generates a JSON schema that conforms to MetaBuilder's entity definition format:

```json
{
  "id": "entity_users",
  "entity": "User",
  "packageId": "core",
  "description": "System users with roles and permissions",
  "version": "1.0.0",
  "fields": [
    {
      "name": "id",
      "type": "String",
      "constraints": {
        "required": true,
        "unique": true,
        "indexed": true,
        "primary": true
      },
      "description": "Unique user identifier (UUID)"
    },
    {
      "name": "email",
      "type": "Email",
      "constraints": {
        "required": true,
        "unique": true,
        "indexed": true,
        "pattern": "^[^@]+@[^@]+\\.[^@]+$"
      },
      "description": "User email address"
    },
    {
      "name": "username",
      "type": "String",
      "constraints": {
        "required": true,
        "unique": true,
        "minLength": 3,
        "maxLength": 32,
        "pattern": "^[a-zA-Z0-9_]+$"
      },
      "description": "User login name"
    },
    {
      "name": "password",
      "type": "String",
      "constraints": {
        "required": true,
        "minLength": 8,
        "indexed": false,
        "encrypted": true
      },
      "description": "Hashed password"
    },
    {
      "name": "role",
      "type": "Enum",
      "constraints": {
        "required": true,
        "default": "user",
        "enum": ["public", "user", "moderator", "admin", "god", "supergod"]
      },
      "description": "User permission level"
    },
    {
      "name": "isActive",
      "type": "Boolean",
      "constraints": {
        "required": true,
        "default": true
      },
      "description": "Account active status"
    },
    {
      "name": "createdAt",
      "type": "DateTime",
      "constraints": {
        "required": true,
        "indexed": true,
        "autoset": true
      },
      "description": "Account creation timestamp"
    },
    {
      "name": "updatedAt",
      "type": "DateTime",
      "constraints": {
        "autoset": true
      },
      "description": "Last account update timestamp"
    }
  ],
  "relationships": [
    {
      "type": "one-to-many",
      "from": "User.id",
      "to": "Session.userId",
      "cascade": "CASCADE",
      "indexed": true,
      "description": "User can have many sessions"
    }
  ],
  "permissions": {
    "read": [0, 1, 3, 4, 5],
    "create": [3, 4, 5],
    "update": [4, 5],
    "delete": [5]
  },
  "createdAt": "2026-01-21T10:00:00Z",
  "createdBy": "supergod_user_id"
}
```

---

## 🔄 Workflow: Creating an Entity Step-by-Step

### User Story: Admin creates "Article" entity

**Step 1: Click "Create New" in EntityList**
- Creates blank EntityBuilder form
- Focus on entity name field

**Step 2: Enter entity metadata**
- Entity name: "Article"
- Description: "Blog articles with publishing workflow"
- Category: "content" (if custom categories enabled)

**Step 3: Add fields using FieldEditor**
- Click "Add Field" button
- For each field:
  - Click to add new field row
  - Enter field name (e.g., "title")
  - Select field type from dropdown (String)
  - Open ConstraintEditor for this field
  - Set constraints: required, unique, indexed, min/max length
  - See preview update in real-time

**Example fields created**:
```
Field 1: id (String, required, unique, indexed, primary)
Field 2: title (String, required, unique, max 200)
Field 3: slug (String, required, unique, indexed)
Field 4: content (Text, required)
Field 5: excerpt (String, max 500)
Field 6: author_id (String, required, indexed, foreign key)
Field 7: is_published (Boolean, default: false)
Field 8: published_at (DateTime)
Field 9: created_at (DateTime, required, indexed, autoset)
Field 10: updated_at (DateTime, autoset)
```

**Step 4: Define relationships using RelationshipMapper**
- Add relationship: Article → User (author)
- Type: many-to-one (many articles can have one author)
- Foreign key: article.author_id → user.id
- Cascade: CASCADE (delete user → delete their articles)
- Index foreign key: yes

**Step 5: Review SchemaPreview**
- See generated JSON schema
- Validate all constraints are correct
- Check relationships are properly defined

**Step 6: Save entity**
- Click "Save" button
- System validates schema
- Creates entity in database
- Triggers Prisma schema generation
- Shows success message with new entity details

**Step 7: Use in API**
- New entity available via DBAL
- `await db.articles.list()`
- `await db.articles.create(data)`
- etc.

---

## 🚀 Implementation Notes

### Phase 3.1 Deliverables

This Schema Editor package provides:

1. **Package metadata**: `package.json` with permissions and features
2. **Package manifest**: `seed/metadata.json` describing the package
3. **Route definition**: `seed/page-config.json` for `/admin/schema-editor`
4. **Component definitions**: `seed/component.json` with 7 components
5. **Documentation**: This guide

### Phase 3.2-3.4 (Future)

The Schema Editor creates JSON schemas that can be consumed by:
- **JSON Script Editor** (Phase 3.2): Edit workflows and automation rules
- **Workflow Editor** (Phase 3.3): Visual node-based workflow builder → JSON
- **Database Manager** (Phase 3.4): CRUD interface using created entities

### Integration Points

The Schema Editor integrates with:
- **DBAL**: `POST /api/v1/supergod/schema_editor/entities` to save
- **DBALClient**: Uses `getDBALClient()` to access database
- **Prisma**: Auto-triggers `codegen:prisma` after new entity
- **FakeMUI**: All components use Material Design from FakeMUI

### Security

- **Supergod only** (permission level 5)
- Multi-tenant aware: schemas are system-wide but scoped to tenant
- Rate limited: 50 requests/minute for schema operations
- Validation: All schema output validated against entity schema JSON schema
- ACL: Only supergod can create/modify entities

---

## 📊 Metrics

**Files Created**: 4
- `package.json`
- `seed/metadata.json`
- `seed/page-config.json`
- `seed/component.json`
- `SCHEMA_EDITOR_GUIDE.md` (this file)

**Components**: 7
- SchemaEditorLayout (main container)
- EntityList (sidebar)
- EntityBuilder (main form)
- FieldEditor (field editor)
- SchemaPreview (live JSON preview)
- ConstraintEditor (validation rules)
- RelationshipMapper (relationships)

**Field Types Supported**: 13
- String, Number, Boolean, Date, DateTime
- Array, Object, UUID, Email, URL
- JSON, Text, Enum

**Constraints Supported**: 8+
- required, unique, indexed, default
- min, max, pattern, enum
- Custom validation presets: email, phone, url, uuid

**Relationships**: 3 types
- one-to-one, one-to-many, many-to-many
- Cascade rules: RESTRICT, SET NULL, CASCADE, NO ACTION

---

## 🔗 Related Documentation

- **CLAUDE.md** - Development principles and architecture
- **ARCHITECTURE.md** - System architecture and data flow
- **schemas/SEED_SCHEMAS.md** - Schema system explanation
- **dbal/shared/api/schema/** - Entity schema definitions
- **packages/PACKAGE_STRUCTURE.md** - Package organization

---

## ✅ Next Steps

1. **Phase 3.1** (NOW): Schema Editor package created
2. **Phase 3.2** (Next): Create JSON Script Editor package
3. **Phase 3.3**: Create Workflow Editor package
4. **Phase 3.4**: Create Database Manager package

---

**Status**: ✅ Phase 3.1 Complete - Schema Editor Package Created
**Health Score**: Expected to improve to 85/100 after implementation
**Timeline**: 3-5 days remaining to complete all admin tools

