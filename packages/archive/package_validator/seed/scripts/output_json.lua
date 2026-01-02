--- Outputs validation results as JSON
---@param results ValidationResult The validation results to output
local function output_json(results)
  ---@param arr string[]
  ---@return string
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

return output_json
