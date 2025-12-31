# Script.json Spec Issues & Improvements

Issues discovered while converting real Lua code to script.json format.

## Critical Missing Features

### 1. **Logical Expressions (||, &&, !)**
**Issue**: Original spec only has `binary_expression` but logical operators need different semantics.

**Current (Wrong)**:
```json
{
  "type": "binary_expression",
  "left": "a",
  "operator": "&&",
  "right": "b"
}
```

**Fixed (New)**:
```json
{
  "type": "logical_expression",
  "left": "a",
  "operator": "&&",
  "right": "b"
}
```

**Reason**: Logical operators short-circuit, binary operators don't.

### 2. **Unary Expressions (!, -, ~)**
**Missing**: No way to express negation `!condition`

**Added**:
```json
{
  "type": "unary_expression",
  "operator": "!",
  "argument": "$ref:params.databaseEnabled"
}
```

**Operators**: `!`, `-`, `+`, `~`, `typeof`, `void`

### 3. **For-Each Loops (ipairs/for in)**
**Missing**: No iteration over arrays/tables

**Added**:
```json
{
  "type": "for_each_loop",
  "iterator": "flag",
  "iterable": "$ref:params.permissions.featureFlags",
  "body": [...]
}
```

**Maps to Lua**:
```lua
for _, flag in ipairs(permissions.featureFlags) do
  -- body
end
```

### 4. **Comments**
**Missing**: No way to preserve code comments

**Added**:
```json
{
  "type": "comment",
  "text": "Check if resource is enabled"
}
```

### 5. **Default Parameter Handling**
**Issue**: Parameters with `optional: true` and `default` value not handled

**Current**:
```json
{
  "name": "featureFlags",
  "type": "table",
  "optional": true,
  "default": {}
}
```

**Runtime Needs**: Auto-assign default when undefined

### 6. **Dynamic Property Access**
**Issue**: Can't access object properties using variable keys

**Current (Wrong)**:
```json
{
  "type": "member_access",
  "object": "$ref:params.featureFlags",
  "property": "hardcoded_key"
}
```

**Needed**:
```json
{
  "type": "member_access",
  "object": "$ref:params.featureFlags",
  "property": "$ref:local.flag",
  "computed": true
}
```

## Spec Improvements

### 1. **Null Coalescing (??)**
**Added**:
```json
{
  "type": "logical_expression",
  "operator": "??",
  "left": "$ref:params.value",
  "right": "default"
}
```

### 2. **Optional Chaining (?.)**
**Added**:
```json
{
  "type": "member_access",
  "object": "$ref:params.obj",
  "property": "nested",
  "optional": true
}
```

### 3. **Spread Operator (...)**
**Added**:
```json
{
  "type": "spread_expression",
  "argument": "$ref:params.array"
}
```

### 4. **Ternary Conditional (? :)**
**Added**:
```json
{
  "type": "conditional_expression",
  "test": "$ref:params.condition",
  "consequent": "value_if_true",
  "alternate": "value_if_false"
}
```

## Type System Enhancements

### 1. **Lua-Specific Types**
**Added**: `table`, `userdata`, `thread`, `nil`

### 2. **Union Types**
**Current**: `"type": "string | number"`
**Better**:
```json
{
  "type": {
    "kind": "union",
    "types": ["string", "number"]
  }
}
```

### 3. **Generic Constraints**
**Added**:
```json
{
  "generic": ["T extends any[]"],
  "constraints": {
    "T": {
      "extends": "any[]"
    }
  }
}
```

## Compatibility Fixes

### 1. **Lua vs JS Operators**
| Lua | JS | JSON |
|-----|----| -----|
| `~=` | `!=` | Use `!=` |
| `and` | `&&` | Use `&&` |
| `or` | `\|\|` | Use `\|\|` |
| `not` | `!` | Use `!` |
| `..` (concat) | `+` | Use `+` for strings |
| `#` (length) | `.length` | Use member access |

### 2. **ipairs vs for...of**
**Lua**:
```lua
for _, item in ipairs(array) do
end
```

**JSON**:
```json
{
  "type": "for_each_loop",
  "iterator": "item",
  "iterable": "$ref:params.array"
}
```

### 3. **Table vs Object**
Lua `table` → JS `object` or `Map`

**JSON uses**: `table` type for Lua compatibility

## Runtime Requirements

### Must Support:
1. ✅ Logical expressions with short-circuiting
2. ✅ Unary operators (!condition)
3. ⏳ For-each loops (ipairs iteration)
4. ⏳ Comments (ignored at runtime)
5. ⏳ Default parameters
6. ⏳ Computed property access

### Should Support:
1. ⏳ Null coalescing (??)
2. ⏳ Optional chaining (?.)
3. ⏳ Spread operator (...)
4. ⏳ Ternary conditional (? :)

### Nice to Have:
1. ⏳ Destructuring assignment
2. ⏳ Array/Object methods (map, filter, reduce)
3. ⏳ Regular expressions
4. ⏳ Switch/case statements

## Migration Path

### Phase 1: Core Features (Current)
- Basic expressions and statements
- Function calls
- Conditionals
- Object/array literals

### Phase 2: Logical Operations (Next)
- Logical expressions (&&, ||, ??)
- Unary operators (!, -, +)
- Short-circuit evaluation

### Phase 3: Iteration (Required for check_access)
- For-each loops
- For loops with counter
- While loops

### Phase 4: Advanced Features
- Computed properties
- Spread operator
- Optional chaining
- Destructuring

## Recommended Spec Changes

### New Version: v2.1.0

```json
{
  "schema_version": "2.1.0",

  "expressions": {
    "logical_expression": {
      "operators": ["&&", "||", "??"],
      "short_circuit": true
    },
    "unary_expression": {
      "operators": ["!", "-", "+", "~", "typeof", "void", "delete"]
    },
    "conditional_expression": {
      "ternary": true
    },
    "computed_member_access": {
      "dynamic_keys": true
    }
  },

  "statements": {
    "for_each_loop": {
      "lua_ipairs": true,
      "js_for_of": true
    },
    "comment": {
      "preserve": true,
      "runtime_ignore": true
    }
  },

  "compatibility": {
    "lua": {
      "operators": {"~=": "!=", "and": "&&", "or": "||", "not": "!"},
      "loops": {"ipairs": "for_each_loop", "pairs": "for_in_loop"}
    },
    "typescript": {
      "types": true,
      "generics": true,
      "decorators": false
    }
  }
}
```

## Testing Checklist

- [x] Parse check_access.lua
- [ ] Execute check_access via runtime
- [ ] Validate all logical operators
- [ ] Test default parameters
- [ ] Verify for-each loops work
- [ ] Compare Lua output vs JSON output
