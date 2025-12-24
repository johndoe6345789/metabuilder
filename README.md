# Django-Style React Admin Panel Generator

A declarative admin panel generator that creates full-featured CRUD interfaces from JSON schema definitions. Inspired by Django's admin panel, this tool lets you define data models and UI configuration declaratively without writing component code.

## Features

- **Declarative Schema Definition** - Define your entire data model in JSON
- **Automatic CRUD Generation** - List views, forms, validation automatically generated
- **Field Types** - String, text, number, boolean, date, datetime, email, URL, select, relations, JSON
- **Advanced Features** - Sorting, filtering, search, validation, relationships
- **Persistent Storage** - Data automatically saved using Spark KV storage
- **Live Schema Editing** - Edit schemas in real-time through the UI

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up the packages folder: `npm run setup-packages` (or see [Packages Setup](#packages-setup))
4. Launch the app: `npm run dev`
5. Use the sidebar to navigate between models
6. Click "Create New" to add records
7. Edit or delete records using the action buttons
8. Click "Edit Schema" to customize your data models

## Packages Setup

This project uses a modular package system. The `packages/` folder contains component packages and is gitignored (local only). 

To set up the packages folder, you have two options:

### Option 1: Use the setup script (recommended)
```bash
npm run setup-packages
```

### Option 2: Manual setup
Create the packages folder structure manually. See `packages/README.md` for details on the expected structure.

Each package should have:
- `seed/components.json` - Component definitions (can be empty array)
- `seed/metadata.json` - Package metadata
- `static_content/examples.json` - Optional examples (can be empty object)

The packages folder is automatically created during the build process if it doesn't exist, with placeholder content.

## Schema Structure

The schema is a JSON object with the following structure:

```json
{
  "apps": [
    {
      "name": "app_name",
      "label": "App Label",
      "models": [
        {
          "name": "model_name",
          "label": "Model Label",
          "labelPlural": "Models",
          "icon": "IconName",
          "listDisplay": ["field1", "field2"],
          "listFilter": ["field3"],
          "searchFields": ["field1", "field2"],
          "ordering": ["-field2"],
          "fields": [
            {
              "name": "field_name",
              "type": "string",
              "label": "Field Label",
              "required": true,
              "unique": false,
              "default": "value",
              "helpText": "Help text or array of strings",
              "validation": {
                "min": 0,
                "max": 100,
                "minLength": 3,
                "maxLength": 200,
                "pattern": "^[a-z]+$"
              },
              "listDisplay": true,
              "searchable": true,
              "sortable": true,
              "editable": true
            }
          ]
        }
      ]
    }
  ]
}
```

## Field Types

### Basic Types
- **string** - Single-line text input
- **text** - Multi-line textarea
- **number** - Numeric input with min/max validation
- **boolean** - Switch/toggle control
- **email** - Email input with validation
- **url** - URL input with validation

### Date/Time
- **date** - Date picker
- **datetime** - Date and time picker

### Advanced Types
- **select** - Dropdown with predefined choices
- **relation** - Foreign key to another model
- **json** - JSON editor for complex data

## Select Field Choices

For select fields, define choices as an array:

```json
{
  "name": "status",
  "type": "select",
  "choices": [
    { "value": "draft", "label": "Draft" },
    { "value": "published", "label": "Published" },
    { "value": "archived", "label": "Archived" }
  ]
}
```

## Relationships

Define relationships between models using the relation type:

```json
{
  "name": "author",
  "type": "relation",
  "relatedModel": "author",
  "required": true
}
```

The related model must exist in the same app.

## Validation

Add validation rules to fields:

```json
{
  "validation": {
    "min": 0,
    "max": 100,
    "minLength": 3,
    "maxLength": 200,
    "pattern": "^[a-z0-9-]+$"
  }
}
```

## Help Text

Provide help text as a string or array of strings:

```json
{
  "helpText": "Single line help text"
}
```

Or for multi-line help:

```json
{
  "helpText": [
    "First line of help",
    "Second line of help"
  ]
}
```

## List View Configuration

Control which fields appear in the list view:

```json
{
  "listDisplay": ["title", "author", "status", "publishedAt"],
  "listFilter": ["status", "author"],
  "searchFields": ["title", "content"],
  "ordering": ["-publishedAt"]
}
```

- **listDisplay** - Fields to show in the table
- **listFilter** - Fields to offer as filters (select/boolean only)
- **searchFields** - Fields to search when using the search box
- **ordering** - Default sort order (prefix with `-` for descending)

## Example Schemas

See `example-schemas.json` for complete examples including:
- Blog with posts and authors
- Task manager with projects and tasks
- E-commerce with products and categories

## Tips

1. **Start Simple** - Begin with basic string and text fields, add complexity later
2. **Use Relations** - Connect related data with relation fields
3. **Add Validation** - Prevent bad data with field validation rules
4. **Leverage Defaults** - Set sensible defaults for better UX
5. **Help Text** - Guide users with helpful field descriptions
6. **Test Incrementally** - Edit and test schema changes one model at a time

## Technical Details

- Built with React, TypeScript, and Tailwind CSS
- Uses shadcn/ui components for consistent design
- Data persisted with Spark KV storage
- Framer Motion for smooth animations
- Full type safety with TypeScript

## Keyboard Shortcuts

- Click table headers to sort
- Use search box for quick filtering
- Forms validate on blur and submit

## Limitations

- Relations only work within the same app
- No many-to-many relationships (use JSON arrays)
- No file uploads (use URL fields to reference external files)
- Maximum recommended records per model: 1000

## Architecture

The system consists of:
1. **Schema Parser** - Validates and processes JSON schemas
2. **Field Renderer** - Dynamically renders form inputs based on field types
3. **Model List View** - Table view with sorting, filtering, search
4. **Record Form** - Auto-generated create/edit forms with validation
5. **Schema Editor** - Live JSON editor for schema modifications

All data is stored in the Spark KV store with keys like `records_appname_modelname`.
