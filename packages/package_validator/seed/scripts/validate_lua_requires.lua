--- Extracts and validates Lua file requires
---@param filepath string Path to the Lua file
---@param content string File content
---@return string[] requires List of required modules
---@return string[] errors List of errors
local function validate_lua_requires(filepath, content)
  local errors = {}
  local requires = {}

  -- Extract all require statements
  for req in string.gmatch(content, 'require%s*%(%s*["\']([^"\']+)["\']%s*%)') do
    table.insert(requires, req)
  end

  return requires, errors
end

return validate_lua_requires
