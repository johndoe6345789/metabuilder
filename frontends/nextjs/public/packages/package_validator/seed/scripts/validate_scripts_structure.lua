--- Validates scripts directory structure
---@param package_path string Path to the package
---@param metadata Metadata Package metadata
---@return string[] errors List of errors
---@return string[] warnings List of warnings
local function validate_scripts_structure(package_path, metadata)
  local errors = {}
  local warnings = {}

  local scripts_path = package_path .. "/scripts"

  -- Check if scripts directory exists when exports.scripts is defined
  if metadata.exports and metadata.exports.scripts and #metadata.exports.scripts > 0 then
    local dir_exists = false
    local test_file = io.open(scripts_path .. "/init.lua", "r")
    if test_file then
      test_file:close()
      dir_exists = true
    end

    if not dir_exists then
      table.insert(errors, "scripts/ directory required when exports.scripts is defined")
    end

    -- Check for init.lua
    local init_file = io.open(scripts_path .. "/init.lua", "r")
    if not init_file then
      table.insert(warnings, "scripts/init.lua is recommended as entry point")
    else
      init_file:close()
    end

    -- Check for tests directory if lua_test is a devDependency
    local has_lua_test = false
    if metadata.devDependencies then
      for _, dep in ipairs(metadata.devDependencies) do
        if dep == "lua_test" then
          has_lua_test = true
          break
        end
      end
    end

    if has_lua_test then
      -- lua_test is a devDependency, so tests are expected
      local test_init = io.open(scripts_path .. "/tests/metadata.test.lua", "r")
      if not test_init then
        table.insert(warnings, "scripts/tests/ directory with test files recommended when lua_test is a devDependency")
      else
        test_init:close()
      end
    end
  end

  return errors, warnings
end

return validate_scripts_structure
