# Script.json - Complete JavaScript/TypeScript Abstraction

## Concept

Just as `styles.json` abstracts CSS into declarative JSON, **`script.json` abstracts executable JavaScript/TypeScript** - functions, promises, async/await, classes, React hooks, generators, and all runtime behavior.

## Why This Matters

**Everything as Data**: When code is represented as JSON:
- **Non-developers** can understand and modify logic
- **AI/LLMs** can reason about and generate code more reliably
- **Visual editors** can provide drag-and-drop programming
- **Code generation** becomes schema transformation
- **Multi-language output** from a single source (TS, JS, Rust, Python)
- **Version control** shows semantic changes, not syntax changes

## Architecture

```
script.json (Abstract Syntax)
    ↓
ScriptCompiler
    ↓
TypeScript/JavaScript Output
    ↓
Runtime Execution
```

## Schema Structure

### 1. Module System

```json
{
  "imports": [
    {
      "module": "react",
      "imports": ["useState", "useEffect"],
      "type": "named"
    }
  ]
}
```

Compiles to:
```typescript
import { useState, useEffect } from 'react';
```

### 2. Constants & Variables

```json
{
  "constants": [
    {
      "name": "API_BASE_URL",
      "value": "https://api.example.com",
      "type": "string",
      "exported": true
    }
  ],
  "variables": [
    {
      "name": "cacheStore",
      "kind": "let",
      "initialValue": {
        "expression": "new Map()",
        "type": "constructor"
      }
    }
  ]
}
```

Compiles to:
```typescript
export const API_BASE_URL = "https://api.example.com";
let cacheStore = new Map();
```

### 3. Functions (Async/Sync)

```json
{
  "functions": [
    {
      "name": "fetchUserData",
      "async": true,
      "params": [
        { "name": "userId", "type": "string" }
      ],
      "returnType": "Promise<User>",
      "body": [
        {
          "type": "const_declaration",
          "name": "response",
          "value": {
            "type": "await",
            "expression": {
              "type": "call_expression",
              "callee": "fetch",
              "args": ["/api/users/${userId}"]
            }
          }
        },
        {
          "type": "return",
          "value": "$ref:local.response"
        }
      ]
    }
  ]
}
```

Compiles to:
```typescript
async function fetchUserData(userId: string): Promise<User> {
  const response = await fetch(`/api/users/${userId}`);
  return response;
}
```

### 4. Control Flow

**If Statements**:
```json
{
  "type": "if_statement",
  "condition": {
    "type": "binary_expression",
    "left": "$ref:local.count",
    "operator": ">",
    "right": 0
  },
  "then": [
    { "type": "return", "value": true }
  ],
  "else": [
    { "type": "return", "value": false }
  ]
}
```

**Loops**:
```json
{
  "type": "for_loop",
  "init": { "type": "const_declaration", "name": "i", "value": 0 },
  "condition": {
    "type": "binary_expression",
    "left": "$ref:local.i",
    "operator": "<",
    "right": 10
  },
  "update": {
    "type": "update_expression",
    "operator": "++",
    "argument": "$ref:local.i"
  },
  "body": [
    {
      "type": "call_expression",
      "callee": "console.log",
      "args": ["$ref:local.i"]
    }
  ]
}
```

### 5. Error Handling

```json
{
  "type": "try_catch",
  "try": [
    {
      "type": "const_declaration",
      "name": "data",
      "value": {
        "type": "await",
        "expression": {
          "type": "call_expression",
          "callee": "fetchData",
          "args": []
        }
      }
    }
  ],
  "catch": {
    "param": "error",
    "body": [
      {
        "type": "call_expression",
        "callee": "console.error",
        "args": ["$ref:catch.error"]
      }
    ]
  },
  "finally": [
    {
      "type": "call_expression",
      "callee": "cleanup",
      "args": []
    }
  ]
}
```

### 6. Classes

```json
{
  "classes": [
    {
      "name": "ApiClient",
      "properties": [
        { "name": "baseUrl", "type": "string", "visibility": "private" }
      ],
      "constructor": {
        "params": [{ "name": "config", "type": "object" }],
        "body": [
          {
            "type": "assignment",
            "target": "this.baseUrl",
            "value": "$ref:params.config.baseUrl"
          }
        ]
      },
      "methods": [
        {
          "name": "get",
          "async": true,
          "visibility": "public",
          "params": [{ "name": "endpoint", "type": "string" }],
          "returnType": "Promise<any>",
          "body": [...]
        }
      ]
    }
  ]
}
```

### 7. React Hooks

```json
{
  "hooks": [
    {
      "name": "useFetch",
      "params": [{ "name": "url", "type": "string" }],
      "body": [
        {
          "type": "const_declaration",
          "name": "[data, setData]",
          "value": {
            "type": "call_expression",
            "callee": "useState",
            "args": [null]
          }
        },
        {
          "type": "call_expression",
          "callee": "useEffect",
          "args": [
            {
              "type": "arrow_function",
              "async": true,
              "body": [...]
            },
            ["$ref:params.url"]
          ]
        },
        {
          "type": "return",
          "value": {
            "type": "object_literal",
            "properties": {
              "data": "$ref:local.data"
            }
          }
        }
      ]
    }
  ]
}
```

### 8. Promises & Async Operations

```json
{
  "functions": [
    {
      "name": "retryWithBackoff",
      "async": true,
      "params": [
        { "name": "fn", "type": "() => Promise<T>" },
        { "name": "maxRetries", "type": "number" }
      ],
      "body": [
        {
          "type": "for_loop",
          "init": { "name": "i", "value": 0 },
          "condition": { "left": "$ref:local.i", "operator": "<", "right": "$ref:params.maxRetries" },
          "body": [
            {
              "type": "try_catch",
              "try": [
                {
                  "type": "return",
                  "value": {
                    "type": "await",
                    "expression": {
                      "type": "call_expression",
                      "callee": "$ref:params.fn"
                    }
                  }
                }
              ],
              "catch": {
                "body": [
                  {
                    "type": "await",
                    "expression": {
                      "type": "call_expression",
                      "callee": "delay",
                      "args": [1000]
                    }
                  }
                ]
              }
            }
          ]
        }
      ]
    }
  ]
}
```

### 9. Generators

```json
{
  "generators": [
    {
      "name": "range",
      "generator": true,
      "params": [
        { "name": "start", "type": "number" },
        { "name": "end", "type": "number" }
      ],
      "body": [
        {
          "type": "for_loop",
          "init": { "name": "i", "value": "$ref:params.start" },
          "condition": { "left": "$ref:local.i", "operator": "<=", "right": "$ref:params.end" },
          "body": [
            { "type": "yield", "value": "$ref:local.i" }
          ]
        }
      ]
    }
  ]
}
```

### 10. Event Handlers

```json
{
  "events": [
    {
      "name": "UserLoggedInEvent",
      "type": "CustomEvent",
      "detail": {
        "userId": "string",
        "timestamp": "number"
      }
    }
  ],
  "event_handlers": [
    {
      "event": "$ref:events.user_logged_in_event",
      "handler": {
        "type": "arrow_function",
        "params": [{ "name": "event", "type": "UserLoggedInEvent" }],
        "body": [
          {
            "type": "call_expression",
            "callee": "console.log",
            "args": ["User logged in:", "$ref:params.event.detail.userId"]
          }
        ]
      }
    }
  ]
}
```

## Reference System

The `$ref:` syntax creates references to:
- **`$ref:params.userId`** - Function parameters
- **`$ref:local.response`** - Local variables
- **`$ref:constants.API_BASE_URL`** - Module constants
- **`$ref:imports.axios.get`** - Imported functions
- **`$ref:functions.delay`** - Other functions in the module
- **`$ref:catch.error`** - Catch block error parameter

This enables:
- Type safety
- Dependency tracking
- Refactoring without string replacements
- Dead code elimination

## Compiler Implementation

```typescript
class ScriptCompiler {
  private schema: ScriptSchema;

  compile(): string {
    const parts: string[] = [];

    // Imports
    if (this.schema.imports) {
      parts.push(this.compileImports(this.schema.imports));
    }

    // Constants
    if (this.schema.constants) {
      parts.push(this.compileConstants(this.schema.constants));
    }

    // Functions
    if (this.schema.functions) {
      parts.push(...this.schema.functions.map(f => this.compileFunction(f)));
    }

    // Classes
    if (this.schema.classes) {
      parts.push(...this.schema.classes.map(c => this.compileClass(c)));
    }

    // Hooks
    if (this.schema.hooks) {
      parts.push(...this.schema.hooks.map(h => this.compileHook(h)));
    }

    return parts.join('\n\n');
  }

  private compileFunction(def: FunctionDefinition): string {
    const asyncKw = def.async ? 'async ' : '';
    const exportKw = def.exported ? 'export ' : '';
    const params = def.params.map(p =>
      `${p.name}${p.optional ? '?' : ''}: ${p.type}`
    ).join(', ');

    const body = this.compileBody(def.body);

    return `${exportKw}${asyncKw}function ${def.name}(${params}): ${def.returnType} {\n${body}\n}`;
  }

  private compileBody(statements: Statement[]): string {
    return statements.map(stmt => this.compileStatement(stmt)).join('\n');
  }

  private compileStatement(stmt: Statement): string {
    switch (stmt.type) {
      case 'const_declaration':
        return `  const ${stmt.name} = ${this.compileExpression(stmt.value)};`;

      case 'if_statement':
        const condition = this.compileExpression(stmt.condition);
        const thenBlock = this.compileBody(stmt.then);
        const elseBlock = stmt.else ? `\n  } else {\n${this.compileBody(stmt.else)}` : '';
        return `  if (${condition}) {\n${thenBlock}${elseBlock}\n  }`;

      case 'return':
        return `  return ${this.compileExpression(stmt.value)};`;

      case 'await':
        return `await ${this.compileExpression(stmt.expression)}`;

      // ... more statement types
    }
  }

  private compileExpression(expr: Expression): string {
    if (typeof expr === 'string' && expr.startsWith('$ref:')) {
      return this.resolveReference(expr);
    }

    if (expr.type === 'call_expression') {
      const args = expr.args.map(a => this.compileExpression(a)).join(', ');
      return `${expr.callee}(${args})`;
    }

    if (expr.type === 'template_literal') {
      return `\`${expr.template}\``;
    }

    // ... more expression types
  }

  private resolveReference(ref: string): string {
    // $ref:params.userId -> userId
    // $ref:local.response -> response
    // $ref:constants.API_BASE_URL -> API_BASE_URL
    const parts = ref.replace('$ref:', '').split('.');
    return parts[parts.length - 1];
  }
}
```

## Usage Example

**Input**: `packages/shared/seed/script.json`

**Compile**:
```typescript
const compiler = new ScriptCompiler(scriptSchema);
const tsCode = compiler.compile();
fs.writeFileSync('packages/shared/dist/index.ts', tsCode);
```

**Output**: `packages/shared/dist/index.ts`
```typescript
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

export const API_BASE_URL = "https://api.example.com";
export const MAX_RETRIES = 3;

let cacheStore = new Map();

export async function fetchUserData(userId: string, options?: object): Promise<User> {
  const cacheKey = `user_${userId}`;

  if (cacheStore.has(cacheKey)) {
    return cacheStore.get(cacheKey);
  }

  try {
    const response = await axios.get(`${API_BASE_URL}/users/${userId}`, options);
    const userData = response.data;
    cacheStore.set(cacheKey, userData);
    return userData;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw error;
  }
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = MAX_RETRIES
): Promise<T> {
  for (const i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) {
        throw error;
      }
      await delay(1000 * Math.pow(2, i));
    }
  }
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: { baseUrl: string; timeout?: number }) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout ?? 5000;
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(this.timeout)
    });
    return await response.json();
  }

  async post<T, R>(endpoint: string, data: T): Promise<R> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await response.json();
  }
}

export function useFetch<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(async () => {
    try {
      const response = await fetch(url);
      const json = await response.json();
      setData(json);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error };
}

export function* range(start: number, end: number): Generator<number> {
  for (let i = start; i <= end; i++) {
    yield i;
  }
}
```

## Benefits

### 1. **Visual Programming**
Build a drag-and-drop editor where users create functions by connecting blocks.

### 2. **Multi-Language Output**
Same `script.json` → TypeScript, JavaScript, Python, Rust

### 3. **AI-Friendly**
LLMs can generate/modify JSON more reliably than raw code.

### 4. **Static Analysis**
Analyze control flow, detect dead code, optimize without parsing.

### 5. **Runtime Flexibility**
Interpret JSON directly without compilation (like a scripting engine).

### 6. **Educational**
Teach programming concepts with visual JSON representation.

## Integration with Existing Patterns

| Pattern | File | Purpose |
|---------|------|---------|
| **UI Components** | `components.json` | Component tree structure |
| **Styling** | `styles.json` | CSS abstraction |
| **Types** | `types.json` | TypeScript type definitions |
| **Logic** | `script.json` | **Executable code** |

Together, these define a **complete application** in pure JSON:
```
packages/my_app/seed/
  ├── components.json   (What to render)
  ├── styles.json       (How it looks)
  ├── types.json        (Type system)
  └── script.json       (How it behaves)
```

## Advanced Features

### Composition
```json
{
  "composition": [
    {
      "name": "enhancedFetch",
      "base": "$ref:functions.fetchUserData",
      "middleware": [
        "$ref:functions.retryWithBackoff",
        "$ref:functions.cacheWrapper"
      ]
    }
  ]
}
```

### Optimization Hints
```json
{
  "functions": [
    {
      "name": "expensiveCalculation",
      "memoize": true,
      "pure": true,
      "body": [...]
    }
  ]
}
```

### Dependency Injection
```json
{
  "dependencies": {
    "logger": "$ref:services.logger",
    "cache": "$ref:services.cache"
  },
  "functions": [
    {
      "name": "processData",
      "inject": ["logger", "cache"],
      "body": [...]
    }
  ]
}
```

## Conclusion

**script.json** demonstrates that **executable code is just data**. When properly abstracted:
- Logic becomes composable
- Non-developers can participate
- AI can reason about behavior
- Visual tools can edit functionality
- Cross-language compilation is trivial

This completes the abstraction trilogy:
1. **styles.json** = Appearance as data
2. **types.json** = Type system as data
3. **script.json** = Behavior as data

**Everything is JSON. Everything is composable. Everything is programmable.**
