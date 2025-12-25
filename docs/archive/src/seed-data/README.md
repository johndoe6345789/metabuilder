# Seed Data

## Overview
Initial database seed data for bootstrapping the application with default configurations, templates, and sample data.

## Location
[/src/seed-data/](/src/seed-data/)

## Seed Data Modules

### Components
- **File**: `components.ts`
- **Purpose**: Default component definitions and configurations
- **Includes**: Component schemas, properties, and rendering rules

### Pages
- **File**: `pages.ts`
- **Purpose**: Default page templates and layouts
- **Includes**: Page definitions, routing, and navigation

### Packages
- **File**: `packages.ts`
- **Purpose**: Package definitions and metadata
- **Includes**: Package configurations, exports, and glue data

### Workflows
- **File**: `workflows.ts`
- **Purpose**: Default workflow definitions and templates
- **Includes**: Workflow steps, conditions, and actions

### Scripts
- **File**: `scripts.ts`
- **Purpose**: Default Lua scripts and code snippets
- **Includes**: Utility functions, examples, and templates

### Users
- **File**: `users.ts`
- **Purpose**: Default user accounts and roles
- **Includes**: Admin users, role definitions, permissions

### Main Index
- **File**: `index.ts`
- **Purpose**: Exports all seed data modules
- **Includes**: Combined seed data for database initialization

## Usage

Seed data is automatically loaded during database initialization:

```typescript
import seedData from '@/seed-data'
// Use for populating database on first run
```

## Database Initialization

Run `npm run db:push` to apply seed data to the database.

## Related Documentation
- [Database Schema](/docs/database)
- [Package System](/docs/development/package-system.md)
