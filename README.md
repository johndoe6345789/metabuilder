# Django-Style React Admin Panel Generator

A declarative admin panel generator that creates full-featured CRUD interfaces from JSON schema definitions. Inspired by Django's admin panel, this tool lets you define data models and UI configuration declaratively without writing component code.

## Features

- **Declarative Schema Definition** - Define your entire data model in JSON
- **Automatic CRUD Generation** - List views, forms, validation automatically generated
- **Field Types** - String, text, number, boolean, date, datetime, email, URL, select, relations, JSON
- **Advanced Features** - Sorting, filtering, search, validation, relationships
- **Persistent Storage** - Data automatically saved using Spark KV storage
- **Live Schema Editing** - Edit schemas in real-time through the UI
- **CI/CD Pipeline** - Automated testing, linting, and deployment
- **AI-Assisted Development** - Automated code reviews and issue triage
- **E2E Testing** - Comprehensive Playwright test suite

## Quick Start

1. Clone the repository
2. Install dependencies: `npm install`
3. Launch the app: `npm run dev`
4. Use the sidebar to navigate between models
5. Click "Create New" to add records
6. Edit or delete records using the action buttons
7. Click "Edit Schema" to customize your data models

## Development

### Available Scripts

```bash
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix linting issues
npm run test:e2e         # Run Playwright e2e tests
npm run test:e2e:ui      # Run tests with Playwright UI
npm run test:e2e:headed  # Run tests in headed browser mode
npm run preview          # Preview production build
```

### Code Quality

This project uses strict ESLint rules with TypeScript support:
- No explicit `any` types (warnings)
- Promise handling required
- React hooks dependencies validated
- Console statements flagged (except warn/error)

Run `npm run lint:fix` before committing to auto-fix issues.

### Testing

The project includes comprehensive E2E tests using Playwright:
- Login and authentication flows
- Navigation between sections
- CRUD operations
- Form validation
- Schema editor functionality

Tests run automatically on every PR via GitHub Actions.

## CI/CD & Automation

### Automated Workflows

1. **CI/CD Pipeline** - Runs on every push and PR
   - Linting with ESLint
   - TypeScript compilation
   - Production build
   - E2E tests with Playwright
   - Code quality checks

2. **Automated Code Review** - Reviews every PR
   - Security vulnerability checks
   - Code quality analysis
   - Type safety validation
   - Best practices enforcement
   - **Auto-approves** PRs with no issues

3. **Auto-Merge** - Merges approved PRs automatically
   - Waits for all CI checks to pass
   - Requires PR approval
   - Uses squash merge
   - Automatically deletes branch after merge

4. **Issue Triage** - Categorizes and labels issues
   - Auto-labels by type (bug, feature, docs)
   - Assigns priority levels
   - Flags AI-fixable issues
   - Welcomes contributors

5. **PR Management** - Organizes pull requests
   - Auto-labels based on changed files
   - Validates PR descriptions
   - Links related issues
   - Size indicators (small/medium/large)

See [.github/workflows/README.md](.github/workflows/README.md) for detailed workflow documentation.

### Contributing

1. Create a branch for your changes
2. Make your changes and test locally
3. Push your branch - workflows run automatically
4. Address any review comments
5. Once approved and tests pass, PR merges automatically

The automated workflows will:
- Review your code
- Run tests
- Approve if everything looks good
- Merge and cleanup after approval

## Packages

This project uses a modular package system. The `packages/` folder contains component packages that are committed to the repository.

If you need to add a new package, use:
```bash
npm run setup-packages <package-name>
```

This will create the required package structure with placeholder files.

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
