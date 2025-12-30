local format_results = require("format_results")

--- Outputs validation results in human-readable format
---@param results ValidationResult The validation results to output
---@param verbose boolean Whether to show detailed output
local function output_human(results, verbose)
  local output = format_results(results)
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

return output_human
