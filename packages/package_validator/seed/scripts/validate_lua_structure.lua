--- Checks if Lua file follows common patterns
---@param filepath string Path to the Lua file
---@param content string File content
---@return string[] warnings List of pattern warnings
local function validate_lua_structure(filepath, content)
  local warnings = {}

  -- Check for module pattern
  if not string.match(content, "local%s+M%s*=%s*{}") and
     not string.match(content, "local%s+[%w_]+%s*=%s*{}") then
    table.insert(warnings, filepath .. ": Missing module pattern (local M = {})")
  end

  -- Check for return statement
  if not string.match(content, "return%s+[%w_]+") then
    table.insert(warnings, filepath .. ": Missing return statement")
  end

  return warnings
end

return validate_lua_structure
