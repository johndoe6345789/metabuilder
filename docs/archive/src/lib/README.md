# Core Library Modules

## Overview
Core utility modules providing functionality for authentication, database access, Lua scripting, package management, and more.

## Location
[/src/lib/](/src/lib/)

## Core Modules

### Authentication & Security
- `auth.ts` - Authentication utilities and helpers
- `password-utils.ts` - Password hashing and validation
- `security-scanner.ts` - Security scanning and validation

### Database Layer
- `database.ts` - Main database abstraction layer
- `database-new.ts` - New database implementation
- `database-dbal.server.ts` - DBAL server integration
- `prisma.ts` - Prisma client initialization
- `secure-db-layer.ts` - Secure database wrapper

### Lua & Scripting
- `lua-engine.ts` - Lua script execution engine
- `sandboxed-lua-engine.ts` - Sandboxed Lua environment
- `lua-snippets.ts` - Lua code snippet library
- `lua-examples.ts` - Lua example code

### Component System
- `component-catalog.ts` - Component catalog management
- `component-registry.ts` - Component registration
- `component-types.ts` - Component type definitions
- `builder-types.ts` - Builder-related types

### Page & Schema Management
- `page-renderer.ts` - Renders pages from definitions
- `page-definition-builder.ts` - Builds page definitions
- `schema-utils.ts` - Schema utility functions
- `schema-types.ts` - Schema type definitions
- `default-schema.ts` - Default schema templates

### Package System
- `package-catalog.ts` - Package catalog management
- `package-loader.ts` - Loads packages from storage
- `package-export.ts` - Exports packages
- `package-glue.ts` - Glues packages together
- `package-types.ts` - Package type definitions

### DBAL Integration
- `dbal-client.ts` - DBAL client
- `dbal-integration.ts` - DBAL integration layer

### Declarative Components
- `declarative-component-renderer.ts` - Renders components from declarations

### Type System
- `level-types.ts` - Level-specific types

### Workflow
- `workflow-engine.ts` - Workflow execution engine

### Utilities
- `utils.ts` - General utility functions

## Related Documentation
- [Database Architecture](/docs/database)
- [Lua Integration](/docs/lua)
- [Package System](/docs/development/package-system.md)
