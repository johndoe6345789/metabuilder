-- Lua file validation
local M = {}

-- Check if Lua file has valid syntax
function M.validate_lua_syntax(filepath, content)
  local errors = {}

  -- Try to load the Lua content
  local func, err = loadstring(content)

  if not func then
    table.insert(errors, filepath .. ": Syntax error - " .. (err or "unknown error"))
    return false, errors
  end

  return true, errors
end

-- Check if Lua file follows common patterns
function M.validate_lua_structure(filepath, content)
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

-- Validate test file structure
function M.validate_test_file(filepath, content)
  local errors = {}
  local warnings = {}

  -- Check for describe blocks
  if not string.match(content, "describe%(") then
    table.insert(warnings, filepath .. ": Missing describe() blocks")
  end

  -- Check for it/test blocks
  if not string.match(content, "it%(") and not string.match(content, "test%(") then
    table.insert(warnings, filepath .. ": Missing it() or test() blocks")
  end

  -- Check for expect assertions
  if not string.match(content, "expect%(") then
    table.insert(warnings, filepath .. ": Missing expect() assertions")
  end

  return errors, warnings
end

-- Validate script exports match metadata
function M.validate_script_exports(package_path, metadata)
  local errors = {}
  local warnings = {}

  if not metadata.exports or not metadata.exports.scripts then
    return errors, warnings
  end

  local scripts_path = package_path .. "/scripts"

  -- Check each exported script exists
  for _, script_name in ipairs(metadata.exports.scripts) do
    local script_file = scripts_path .. "/" .. script_name .. ".lua"

    -- Check if file exists
    local file = io.open(script_file, "r")
    if not file then
      table.insert(errors, "Exported script not found: " .. script_name .. ".lua")
    else
      file:close()
    end
  end

  return errors, warnings
end

-- Validate all Lua files in a package
function M.validate_package_lua_files(package_path)
  local results = {
    valid = true,
    errors = {},
    warnings = {}
  }

  local scripts_path = package_path .. "/scripts"

  -- Find all Lua files
  local lua_files = {}
  -- Note: In real implementation, this would recursively find all .lua files
  -- For now, we'll validate the pattern

  if not file_exists(scripts_path) then
    table.insert(results.warnings, "No scripts directory found")
    return results
  end

  return results
end

-- Check for common Lua anti-patterns
function M.check_lua_quality(filepath, content)
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

-- Validate Lua file dependencies
function M.validate_lua_requires(filepath, content)
  local errors = {}
  local requires = {}

  -- Extract all require statements
  for req in string.gmatch(content, 'require%s*%(%s*["\']([^"\']+)["\']%s*%)') do
    table.insert(requires, req)
  end

  return requires, errors
end

return M
