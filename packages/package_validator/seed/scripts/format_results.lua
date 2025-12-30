--- Formats validation results for display
---@param results ValidationResult The validation results
---@return string formatted Formatted output string
local function format_results(results)
  local output = {}

  if results.valid then
    table.insert(output, "✓ Validation passed")
  else
    table.insert(output, "✗ Validation failed")
  end

  if #results.errors > 0 then
    table.insert(output, "\nErrors:")
    for _, err in ipairs(results.errors) do
      table.insert(output, "  • " .. err)
    end
  end

  if #results.warnings > 0 then
    table.insert(output, "\nWarnings:")
    for _, warn in ipairs(results.warnings) do
      table.insert(output, "  • " .. warn)
    end
  end

  return table.concat(output, "\n")
end

return format_results
