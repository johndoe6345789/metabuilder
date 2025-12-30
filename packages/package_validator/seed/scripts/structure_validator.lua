-- Package folder structure validation
local M = {}

-- Expected package structure
M.REQUIRED_STRUCTURE = {
  ["seed/metadata.json"] = true,
  ["seed/components.json"] = true
}

M.OPTIONAL_STRUCTURE = {
  ["seed/scripts/"] = "directory",
  ["seed/scripts/init.lua"] = "file",
  ["seed/scripts/tests/"] = "directory",
  ["static_content/"] = "directory",
  ["static_content/icon.svg"] = "file",
  ["README.md"] = "file",
  ["examples/"] = "directory"
}

-- Validate basic folder structure
function M.validate_structure(package_path)
  local errors = {}
  local warnings = {}

  -- Check required files
  for path, _ in pairs(M.REQUIRED_STRUCTURE) do
    local full_path = package_path .. "/" .. path
    local file = io.open(full_path, "r")

    if not file then
      table.insert(errors, "Required file missing: " .. path)
    else
      file:close()
    end
  end

  -- Check optional but recommended files
  for path, type in pairs(M.OPTIONAL_STRUCTURE) do
    local full_path = package_path .. "/" .. path

    if type == "file" then
      local file = io.open(full_path, "r")
      if not file then
        table.insert(warnings, "Recommended file missing: " .. path)
      else
        file:close()
      end
    elseif type == "directory" then
      -- Note: Directory checking would be done with OS-specific commands
      -- This is a placeholder for the pattern
    end
  end

  return errors, warnings
end

-- Validate scripts directory structure
function M.validate_scripts_structure(package_path, metadata)
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

-- Validate static content structure
function M.validate_static_content(package_path, metadata)
  local errors = {}
  local warnings = {}

  if metadata.icon then
    local icon_path = package_path .. "/" .. metadata.icon
    local icon_file = io.open(icon_path, "r")

    if not icon_file then
      table.insert(errors, "Icon file not found: " .. metadata.icon)
    else
      icon_file:close()
    end
  else
    table.insert(warnings, "No icon defined in metadata")
  end

  return errors, warnings
end

-- Check for orphaned files (files not referenced in metadata)
function M.check_orphaned_files(package_path, metadata)
  local warnings = {}

  -- This would scan the package directory and check if files are referenced
  -- Placeholder for the pattern

  return warnings
end

-- Validate naming conventions
function M.validate_naming_conventions(package_path, metadata)
  local errors = {}
  local warnings = {}

  -- Package directory should match packageId
  local dir_name = package_path:match("([^/]+)$")
  if dir_name ~= metadata.packageId then
    table.insert(errors, "Package directory name '" .. dir_name .. "' does not match packageId '" .. metadata.packageId .. "'")
  end

  -- Check script file naming
  if metadata.exports and metadata.exports.scripts then
    for _, script_name in ipairs(metadata.exports.scripts) do
      -- Script names should be lowercase with underscores
      if not string.match(script_name, "^[a-z_]+$") then
        table.insert(warnings, "Script name '" .. script_name .. "' should use lowercase and underscores only")
      end
    end
  end

  -- Check component naming
  if metadata.exports and metadata.exports.components then
    for _, component_name in ipairs(metadata.exports.components) do
      -- Component names can be PascalCase or snake_case
      local is_valid = string.match(component_name, "^[A-Z][a-zA-Z]+$") or
                      string.match(component_name, "^[a-z_]+$")
      if not is_valid then
        table.insert(warnings, "Component name '" .. component_name .. "' should use PascalCase or snake_case")
      end
    end
  end

  return errors, warnings
end

-- Validate complete package structure
function M.validate_package_structure(package_path, metadata)
  local results = {
    valid = true,
    errors = {},
    warnings = {}
  }

  -- Basic structure
  local struct_errors, struct_warnings = M.validate_structure(package_path)
  for _, err in ipairs(struct_errors) do
    table.insert(results.errors, err)
    results.valid = false
  end
  for _, warn in ipairs(struct_warnings) do
    table.insert(results.warnings, warn)
  end

  -- Scripts structure
  local script_errors, script_warnings = M.validate_scripts_structure(package_path, metadata)
  for _, err in ipairs(script_errors) do
    table.insert(results.errors, err)
    results.valid = false
  end
  for _, warn in ipairs(script_warnings) do
    table.insert(results.warnings, warn)
  end

  -- Static content
  local static_errors, static_warnings = M.validate_static_content(package_path, metadata)
  for _, err in ipairs(static_errors) do
    table.insert(results.errors, err)
    results.valid = false
  end
  for _, warn in ipairs(static_warnings) do
    table.insert(results.warnings, warn)
  end

  -- Naming conventions
  local naming_errors, naming_warnings = M.validate_naming_conventions(package_path, metadata)
  for _, err in ipairs(naming_errors) do
    table.insert(results.errors, err)
    results.valid = false
  end
  for _, warn in ipairs(naming_warnings) do
    table.insert(results.warnings, warn)
  end

  return results
end

return M
