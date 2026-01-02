--- Prints CLI help message
---@return nil
local function print_help()
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

return print_help
