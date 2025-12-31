--- Checks for common Lua anti-patterns
---@param filepath string Path to the Lua file
---@param content string File content
---@return string[] warnings List of quality warnings
local function check_lua_quality(filepath, content)
  local warnings = {}

  -- Check for global variables (potential issue)
  if string.match(content, "[^%w_]function%s+[%w_]+%(") then
    table.insert(warnings, filepath .. ": Global function definition found (consider local)")
  end

  -- Check for TODO comments
  if string.match(content, "TODO") or string.match(content, "FIXME") then
    table.insert(warnings, filepath .. ": Contains TODO/FIXME comments")
  end

  -- Check for print statements (should use proper logging)
  local print_count = select(2, string.gsub(content, "print%(", ""))
  if print_count > 0 then
    table.insert(warnings, filepath .. ": Contains " .. print_count .. " print() statements")
  end

  return warnings
end

return check_lua_quality
