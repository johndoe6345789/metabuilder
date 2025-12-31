--- Parses command line arguments
---@param args string[] Raw command line arguments
---@return CLIOptions options Parsed options
local function parse_args(args)
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
      options.show_help = true
    elseif not options.package_name then
      options.package_name = arg
    end

    i = i + 1
  end

  return options
end

return parse_args
