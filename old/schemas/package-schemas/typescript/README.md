# TypeScript Type Definitions

TypeScript type definitions for MetaBuilder schemas, enabling type-safe schema manipulation in TypeScript/JavaScript projects.

## Installation

### Option 1: Use Pre-Generated Types

```bash
npm install @metabuilder/schema-types
```

```typescript
import type { PackageMetadata, EntitySchema, APISchema } from '@metabuilder/schema-types';

const pkg: PackageMetadata = {
  packageId: 'my-package',
  name: 'My Package',
  version: '1.0.0',
  description: 'A typed package',
};
```

### Option 2: Generate Types Locally

```bash
# Install generator
npm install -g json-schema-to-typescript
# or
npm install -g quicktype

# Generate types
./generate-types.sh
```

## Available Types

### Core Schemas

```typescript
import type {
  PackageMetadata,
  EntitySchema,
  Entity,
  Field,
  TypesSchema,
  TypeDefinition,
  ScriptSchema,
  Function,
  APISchema,
  Route,
  ValidationSchema,
} from '@metabuilder/schema-types';
```

### Usage Examples

#### 1. Type-Safe Package Definition

```typescript
import type { PackageMetadata } from '@metabuilder/schema-types';

const package: PackageMetadata = {
  packageId: 'user-management',
  name: 'User Management',
  version: '2.1.0',
  description: 'Complete user management system',
  author: 'John Doe',
  license: 'MIT',
  dependencies: {
    'core-utils': '^1.0.0',
  },
  exports: {
    scripts: ['createUser', 'validateEmail'],
    types: ['User', 'UserRole'],
  },
};
```

#### 2. Type-Safe Entity Definition

```typescript
import type { Entity, Field } from '@metabuilder/schema-types';

const userEntity: Entity = {
  name: 'User',
  version: '1.0',
  primaryKey: 'id',
  timestamps: true,
  softDelete: true,
  fields: {
    id: {
      type: 'uuid',
      generated: true,
    },
    email: {
      type: 'string',
      required: true,
      unique: true,
      maxLength: 255,
    },
    role: {
      type: 'enum',
      enum: ['user', 'admin', 'moderator'],
      default: 'user',
    },
  },
  indexes: [
    {
      fields: ['email'],
      unique: true,
    },
  ],
  acl: {
    create: ['admin'],
    read: ['user', 'admin'],
    update: ['admin'],
    delete: ['admin'],
  },
};
```

#### 3. Type-Safe API Routes

```typescript
import type { Route, APISchema } from '@metabuilder/schema-types';

const getUserRoute: Route = {
  path: '/users/:id',
  method: 'GET',
  handler: 'getUser',
  description: 'Get user by ID',
  auth: {
    type: 'bearer',
    required: true,
  },
  params: [
    {
      name: 'id',
      type: 'string',
      required: true,
      pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    },
  ],
  response: {
    '200': {
      description: 'User found',
      schema: 'User',
    },
    '404': {
      description: 'User not found',
    },
  },
};

const api: APISchema = {
  schemaVersion: '1.0.0',
  package: 'user-api',
  basePath: '/api/v1',
  routes: [getUserRoute],
};
```

#### 4. Type-Safe Function Definitions

```typescript
import type { Function, Parameter } from '@metabuilder/schema-types';

const greetFunction: Function = {
  id: 'greet_user',
  name: 'greetUser',
  params: [
    {
      name: 'name',
      type: 'string',
      sanitize: true,
    },
  ],
  returnType: 'string',
  body: [
    {
      type: 'return',
      value: {
        type: 'template_literal',
        parts: ['Hello, ', { type: 'identifier', name: 'name' }, '!'],
      },
    },
  ],
  docstring: {
    summary: 'Greets a user by name',
    params: [
      {
        name: 'name',
        description: 'The user\'s name',
      },
    ],
    returns: 'A greeting message',
  },
};
```

#### 5. Validation with Type Safety

```typescript
import type { ValidationResult, ValidationError } from '@metabuilder/schema-types';

function validateEmail(email: string): ValidationResult {
  const errors: ValidationError[] = [];

  if (!email.includes('@')) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      code: 'INVALID_EMAIL',
      severity: 'error',
    });
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}
```

## Type Utilities

### Generic Constraints

```typescript
import type { Entity, Field, FieldType } from '@metabuilder/schema-types';

// Type-safe field creator
function createField<T extends FieldType>(
  type: T,
  options: Partial<Omit<Field, 'type'>>
): Field {
  return {
    type,
    ...options,
  };
}

const emailField = createField('string', {
  required: true,
  unique: true,
  maxLength: 255,
});
```

### Type Guards

```typescript
import type { Route, HTTPMethod } from '@metabuilder/schema-types';

function isGetRoute(route: Route): route is Route & { method: 'GET' } {
  return route.method === 'GET';
}

function hasAuth(route: Route): route is Route & { auth: NonNullable<Route['auth']> } {
  return route.auth !== undefined;
}
```

## IDE Support

### VS Code

Types provide full IntelliSense support:

```typescript
import type { Entity } from '@metabuilder/schema-types';

const entity: Entity = {
  name: 'User',
  version: '1.0',
  fields: {
    id: {
      // IntelliSense shows all FieldType options
      type: 'uuid', // ✓ Valid
      // type: 'invalid', // ✗ Type error
    },
  },
};
```

### Type Checking

```bash
# Check types
tsc --noEmit

# Watch mode
tsc --noEmit --watch
```

## Schema Validation

Combine with runtime validation:

```typescript
import Ajv from 'ajv';
import type { PackageMetadata } from '@metabuilder/schema-types';
import metadataSchema from '../metadata_schema.json';

const ajv = new Ajv();
const validate = ajv.compile(metadataSchema);

function createPackage(data: PackageMetadata): PackageMetadata {
  if (!validate(data)) {
    throw new Error('Invalid package: ' + JSON.stringify(validate.errors));
  }
  return data;
}
```

## Advanced Patterns

### Builder Pattern

```typescript
import type { Entity, Field } from '@metabuilder/schema-types';

class EntityBuilder {
  private entity: Partial<Entity> = {
    fields: {},
  };

  withName(name: string): this {
    this.entity.name = name;
    return this;
  }

  withVersion(version: string): this {
    this.entity.version = version;
    return this;
  }

  addField(name: string, field: Field): this {
    this.entity.fields![name] = field;
    return this;
  }

  withPrimaryKey(key: string): this {
    this.entity.primaryKey = key;
    return this;
  }

  build(): Entity {
    if (!this.entity.name || !this.entity.version || !this.entity.fields) {
      throw new Error('Missing required fields');
    }
    return this.entity as Entity;
  }
}

const user = new EntityBuilder()
  .withName('User')
  .withVersion('1.0')
  .withPrimaryKey('id')
  .addField('id', { type: 'uuid', generated: true })
  .addField('email', { type: 'string', required: true })
  .build();
```

### Partial Updates

```typescript
import type { Entity } from '@metabuilder/schema-types';

function updateEntity(
  entity: Entity,
  updates: Partial<Entity>
): Entity {
  return {
    ...entity,
    ...updates,
  };
}
```

## Testing

### Type Testing with tsd

```typescript
// schema.test-d.ts
import { expectType, expectError } from 'tsd';
import type { PackageMetadata, Entity } from '@metabuilder/schema-types';

// Should accept valid package
expectType<PackageMetadata>({
  packageId: 'test',
  name: 'Test',
  version: '1.0.0',
  description: 'Test package',
});

// Should reject invalid package
expectError<PackageMetadata>({
  packageId: 'test',
  // missing required fields
});

// Field types should be constrained
expectType<Entity>({
  name: 'Test',
  version: '1.0',
  fields: {
    id: {
      type: 'uuid', // ✓ Valid
    },
  },
});

expectError<Entity>({
  name: 'Test',
  version: '1.0',
  fields: {
    id: {
      type: 'invalid', // ✗ Invalid
    },
  },
});
```

## Migration from v1.0 to v2.0

```typescript
import type { Entity } from '@metabuilder/schema-types';

// v1.0 (deprecated)
const oldEntity = {
  name: 'User',
  version: '1.0',
  fields: {
    id: {
      type: 'uuid',
      primary: true, // ✗ Deprecated
    },
  },
};

// v2.0 (current)
const newEntity: Entity = {
  name: 'User',
  version: '1.0',
  primaryKey: 'id', // ✓ Correct
  fields: {
    id: {
      type: 'uuid',
    },
  },
};
```

## Troubleshooting

### Type Errors

```typescript
// Error: Type 'string' is not assignable to type 'FieldType'
const field: Field = {
  type: 'varchar', // ✗ Use 'string' instead
};

// Fix:
const field: Field = {
  type: 'string', // ✓
};
```

### Missing Properties

```typescript
// Error: Property 'name' is missing
const entity: Entity = {
  version: '1.0',
  fields: {},
};

// Fix: Add required properties
const entity: Entity = {
  name: 'User',
  version: '1.0',
  fields: {
    id: { type: 'uuid' },
  },
};
```

## Resources

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [JSON Schema to TypeScript](https://github.com/bcherny/json-schema-to-typescript)
- [Quicktype](https://quicktype.io/)

---

**Version:** 2.0.0
**Last Updated:** 2026-01-01
**Maintained by:** MetaBuilder Team

Generated with Claude Code
