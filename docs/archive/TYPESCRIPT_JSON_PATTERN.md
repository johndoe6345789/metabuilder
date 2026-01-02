# TypeScript JSON Abstraction Pattern

## Concept Overview

Just as we've abstracted CSS into declarative JSON schemas (`styles.json`), this demonstrates how TypeScript type definitions can be represented in a similar JSON format.

## Pattern Comparison

### CSS Pattern (styles.json V2)
```
Declarative JSON → StylesCompiler → CSS Output
```

### TypeScript Pattern (types.json)
```
Declarative JSON → TypeScriptCompiler → .d.ts Output
```

## Architecture

### 1. Schema Structure

**File Location**: `packages/{package}/seed/types.json`

**Core Sections**:
- **tokens**: Reusable primitive type aliases
- **interfaces**: Object type definitions
- **types**: Union types, literal types
- **generics**: Generic type definitions
- **rules**: Type constraints and modifiers
- **exports**: Export configuration
- **environments**: Target environments (ESM, CJS, TypeScript)
- **composition**: Type intersections and combinations

### 2. Benefits of This Approach

1. **Non-Developer Friendly**: JSON is easier to read/edit than TypeScript syntax
2. **Composable**: Build complex types from simple building blocks
3. **Multi-Target**: Single source generates multiple output formats
4. **Versionable**: Schema versioning allows evolution
5. **Debuggable**: Can build visualization tools (like StylesPanel)
6. **Consistent**: Mirrors the proven styles.json pattern

### 3. Example: From JSON to TypeScript

**Input** (`types.json`):
```json
{
  "interfaces": [
    {
      "name": "ButtonProps",
      "extends": ["BaseComponentProps"],
      "properties": {
        "variant": {
          "type": "'primary' | 'secondary'",
          "optional": false
        },
        "size": {
          "type": "'small' | 'medium' | 'large'",
          "default": "'medium'"
        }
      }
    }
  ]
}
```

**Output** (compiled TypeScript):
```typescript
export interface ButtonProps extends BaseComponentProps {
  variant: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
}
```

### 4. Compiler Implementation Sketch

```typescript
class TypeScriptCompiler {
  private schema: TypeScriptSchema;

  compile(): string {
    const output: string[] = [];

    // Compile tokens
    if (this.schema.tokens) {
      output.push(this.compileTokens(this.schema.tokens));
    }

    // Compile interfaces
    if (this.schema.interfaces) {
      output.push(...this.schema.interfaces.map(i => this.compileInterface(i)));
    }

    // Compile types
    if (this.schema.types) {
      output.push(...this.schema.types.map(t => this.compileType(t)));
    }

    // Apply rules/modifiers
    return this.applyRules(output.join('\n\n'));
  }

  private compileInterface(def: InterfaceDefinition): string {
    const ext = def.extends?.length ? ` extends ${def.extends.join(', ')}` : '';
    const props = Object.entries(def.properties)
      .map(([key, prop]) => {
        const optional = prop.optional ? '?' : '';
        const readonly = prop.readonly ? 'readonly ' : '';
        return `  ${readonly}${key}${optional}: ${prop.type};`;
      })
      .join('\n');

    return `export interface ${def.name}${ext} {\n${props}\n}`;
  }

  private compileType(def: TypeDefinition): string {
    if (def.kind === 'union') {
      return `export type ${def.name} = ${def.values.join(' | ')};`;
    }
    return `export type ${def.name} = ${def.definition};`;
  }
}
```

### 5. Integration Points

Following the styles.json pattern:

```typescript
// Similar to loadPackageStyles()
async function loadPackageTypes(packageId: string): Promise<string> {
  const response = await fetch(`/packages/${packageId}/seed/types.json`);
  const schema = await response.json();

  const compiler = new TypeScriptCompiler(schema);
  return compiler.compile();
}

// Generate .d.ts files at build time
function generateTypeDefinitions() {
  const packages = getPackageList();

  for (const pkg of packages) {
    const typeSchema = loadTypeSchema(pkg);
    const compiler = new TypeScriptCompiler(typeSchema);
    const output = compiler.compile();

    fs.writeFileSync(
      `packages/${pkg}/dist/types.d.ts`,
      output
    );
  }
}
```

### 6. Advanced Features

**Composition** (like styles.json appearance layers):
```json
{
  "composition": [
    {
      "name": "EnhancedButtonProps",
      "kind": "intersection",
      "types": [
        "ButtonProps",
        "AccessibilityProps",
        "AnalyticsProps"
      ]
    }
  ]
}
```

**Rules** (like styles.json selector rules):
```json
{
  "rules": [
    {
      "selector": {
        "interfaceName": "UserData",
        "property": "id"
      },
      "modifiers": ["readonly", "required"],
      "priority": 10
    }
  ]
}
```

**Environments** (like styles.json responsive environments):
```json
{
  "environments": {
    "node": {
      "moduleSystem": "CommonJS",
      "globals": ["process", "Buffer"]
    },
    "browser": {
      "moduleSystem": "ES2015",
      "globals": ["window", "document"]
    }
  }
}
```

### 7. Practical Use Cases

1. **Component Libraries**: Define all component prop types in JSON
2. **API Contracts**: Generate TypeScript types from API schemas
3. **Configuration**: Type-safe config objects defined declaratively
4. **Theme Systems**: Type definitions for theme tokens and variants
5. **State Management**: Action and state type definitions

### 8. Future Enhancements

- **Validation**: JSON Schema validation for types.json
- **Visualization**: Storybook panel to explore type relationships (like StylesPanel)
- **Code Generation**: Generate not just types but implementation stubs
- **Documentation**: Auto-generate docs from type definitions
- **Migration Tools**: Convert existing .ts files to types.json

## Example Files

See the demonstration in:
- [packages/shared/seed/types.json](packages/shared/seed/types.json)

This mirrors the existing pattern:
- [packages/shared/seed/styles.json](packages/shared/seed/styles.json)

## Conclusion

This pattern demonstrates that **any code abstraction can be represented declaratively in JSON** when you:
1. Define a clear schema
2. Build a compiler to transform it
3. Support composition and rules
4. Enable multi-target output
5. Provide tooling for debugging/visualization

The same pattern used for CSS → styles.json applies perfectly to TypeScript → types.json.
