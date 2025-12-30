--- Validates test files structure
---@param package_path string Path to the package
---@param metadata Metadata Package metadata
---@return string[] errors List of errors
---@return string[] warnings List of warnings
local function validate_test_structure(package_path, metadata)
  local errors = {}
  local warnings = {}

  -- Check if lua_test is a devDependency
  local has_lua_test = false
  if metadata.devDependencies then
    for _, dep in ipairs(metadata.devDependencies) do
      if dep == "lua_test" then
        has_lua_test = true
        break
      end
    end
  end

  if not has_lua_test then
    -- No lua_test, tests are optional
    return errors, warnings
  end

  local tests_path = package_path .. "/scripts/tests"

  -- Check for common test files
  local common_tests = {
    "metadata.test.lua",
    "components.test.lua"
  }

  local found_tests = false
  for _, test_file in ipairs(common_tests) do
    local test_path = tests_path .. "/" .. test_file
    local file = io.open(test_path, "r")
    if file then
      file:close()
      found_tests = true
    end
  end

  if not found_tests then
    table.insert(warnings, "No test files found (metadata.test.lua, components.test.lua) despite lua_test devDependency")
  end

  return errors, warnings
end

return validate_test_structure
