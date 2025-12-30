--- CLI tool facade for validating packages
--- Usage: lua cli.lua <package_name> [options]
---@module cli

local validate = require("validate")
local parse_args = require("parse_args")
local print_help = require("print_help")
local output_json = require("output_json")
local output_human = require("output_human")

---@class CLI
local M = {}

M.parse_args = parse_args
M.print_help = print_help
M.output_json = output_json
M.output_human = output_human

--- Main entry point
---@param args string[] Command line arguments
function M.run(args)
  local options = parse_args(args)

  if options.show_help then
    print_help()
    os.exit(0)
  end

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
    output_json(results)
  else
    output_human(results, options.verbose)
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
