-- CLI tool for validating packages
-- Usage: lua cli.lua <package_name> [options]

local validate = require("validate")

local M = {}

-- Parse command line arguments
function M.parse_args(args)
  local options = {
    package_name = nil,
    skipStructure = false,
    skipLua = false,
    verbose = false,
    json_output = false
  }

  local i = 1
  while i <= #args do
    local arg = args[i]

    if arg == "--skip-structure" then
      options.skipStructure = true
    elseif arg == "--skip-lua" then
      options.skipLua = true
    elseif arg == "--verbose" or arg == "-v" then
      options.verbose = true
    elseif arg == "--json" then
      options.json_output = true
    elseif arg == "--help" or arg == "-h" then
      M.print_help()
      os.exit(0)
    elseif not options.package_name then
      options.package_name = arg
    end

    i = i + 1
  end

  return options
end

-- Print help message
function M.print_help()
  print([[
Package Validator CLI

Usage:
  lua cli.lua <package_name> [options]

Arguments:
  package_name          Name of the package to validate

Options:
  --skip-structure      Skip folder structure validation
  --skip-lua            Skip Lua file validation
  --verbose, -v         Show detailed validation information
  --json                Output results as JSON
  --help, -h            Show this help message

Examples:
  # Validate audit_log package
  lua cli.lua audit_log

  # Validate with verbose output
  lua cli.lua audit_log --verbose

  # Skip structure validation
  lua cli.lua audit_log --skip-structure

  # Output as JSON (for CI/CD integration)
  lua cli.lua audit_log --json

Exit Codes:
  0 - Validation passed
  1 - Validation failed
  2 - Invalid arguments or package not found
]])
end

-- Output results as JSON
function M.output_json(results)
  local json_output = {
    valid = results.valid,
    errors = results.errors,
    warnings = results.warnings
  }

  -- Simple JSON serialization
  local function serialize_array(arr)
    local items = {}
    for _, item in ipairs(arr) do
      table.insert(items, '"' .. item:gsub('"', '\\"') .. '"')
    end
    return "[" .. table.concat(items, ",") .. "]"
  end

  print("{")
  print('  "valid": ' .. tostring(results.valid) .. ',')
  print('  "errors": ' .. serialize_array(results.errors) .. ',')
  print('  "warnings": ' .. serialize_array(results.warnings))
  print("}")
end

-- Output results in human-readable format
function M.output_human(results, verbose)
  local output = validate.format_results(results)
  print(output)

  if verbose and #results.errors > 0 then
    print("\n--- Detailed Error Information ---")
    for i, err in ipairs(results.errors) do
      print(i .. ". " .. err)
    end
  end

  if verbose and #results.warnings > 0 then
    print("\n--- Detailed Warning Information ---")
    for i, warn in ipairs(results.warnings) do
      print(i .. ". " .. warn)
    end
  end
end

-- Main entry point
function M.run(args)
  local options = M.parse_args(args)

  if not options.package_name then
    print("Error: Package name is required")
    print("Use --help for usage information")
    os.exit(2)
  end

  -- Construct package path
  local package_path = "packages/" .. options.package_name .. "/seed"

  -- Check if package exists
  local metadata_file = io.open(package_path .. "/metadata.json", "r")
  if not metadata_file then
    print("Error: Package '" .. options.package_name .. "' not found")
    os.exit(2)
  end
  metadata_file:close()

  -- Validate package
  local results = validate.validate_package(package_path, {
    skipStructure = options.skipStructure,
    skipLua = options.skipLua
  })

  -- Output results
  if options.json_output then
    M.output_json(results)
  else
    M.output_human(results, options.verbose)
  end

  -- Exit with appropriate code
  if results.valid then
    os.exit(0)
  else
    os.exit(1)
  end
end

return M

-- If run directly, execute main
if arg then
  M.run(arg)
end
