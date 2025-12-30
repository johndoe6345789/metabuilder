--- Checks if Lua file has valid syntax
---@param filepath string Path to the Lua file
---@param content string File content
---@return boolean valid Whether syntax is valid
---@return string[] errors List of syntax errors
local function validate_lua_syntax(filepath, content)
  local errors = {}

  -- Try to load the Lua content
  local func, err = loadstring(content)

  if not func then
    table.insert(errors, filepath .. ": Syntax error - " .. (err or "unknown error"))
    return false, errors
  end

  return true, errors
end

return validate_lua_syntax
