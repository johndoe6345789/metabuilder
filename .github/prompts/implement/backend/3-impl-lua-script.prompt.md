# Write Lua Business Logic

Add business logic as a sandboxed Lua script:

## Create Script
Location: `packages/{pkg}/seed/scripts/` or `src/lib/lua-snippets.ts`

```lua
-- Sandbox restrictions: NO os, io, require, loadfile
function validateInput(value)
  if not value or value == "" then
    return false, "Value required"
  end
  return true, nil
end
```

## Register Script
```typescript
renderer.registerLuaScript('validate_input', {
  code: luaCode,
  parameters: [{ name: 'value', type: 'string' }],
  returnType: 'boolean'
})
```

## Execute Script
```typescript
const result = await renderer.executeLuaScript('validate_input', [userInput])
```

## When to Use Lua
- Validation rules
- Data transformation
- Conditional rendering logic
- Business rules that change frequently
