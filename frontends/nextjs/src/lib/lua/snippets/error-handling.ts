import { LuaSnippet } from './types'

export const ERROR_HANDLING_SNIPPETS: LuaSnippet[] = [
  {
    id: 'error_try_catch',
    name: 'Try-Catch Pattern',
    description: 'Safe execution with error handling',
    category: 'Error Handling',
    tags: ['error', 'exception', 'safety'],
    code: `local function riskyOperation()
  local data = context.data or {}

  if not data.value then
    error("Value is required")
  end

  if data.value < 0 then
    error("Value must be positive")
  end

  return data.value * 2
end

local success, result = pcall(riskyOperation)

if success then
  log("Operation successful: " .. tostring(result))
  return {
    success = true,
    result = result
  }
else
  log("Operation failed: " .. tostring(result))
  return {
    success = false,
    error = tostring(result)
  }
end`,
  },
  {
    id: 'error_validation_accumulator',
    name: 'Validation Error Accumulator',
    description: 'Collect all validation errors at once',
    category: 'Error Handling',
    tags: ['error', 'validation', 'accumulator'],
    code: `local data = context.data or {}
local errors = {}

if not data.name or data.name == "" then
  table.insert(errors, "Name is required")
end

if not data.email or data.email == "" then
  table.insert(errors, "Email is required")
elseif not string.match(data.email, "@") then
  table.insert(errors, "Email format is invalid")
end

if not data.age then
  table.insert(errors, "Age is required")
elseif data.age < 18 then
  table.insert(errors, "Must be 18 or older")
end

if #errors > 0 then
  return {
    valid = false,
    errors = errors,
    count = #errors
  }
end

return {
  valid = true,
  data = data
}`,
  },
]
