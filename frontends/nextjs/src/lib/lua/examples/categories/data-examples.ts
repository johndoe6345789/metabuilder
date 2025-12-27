/**
 * @file data-examples.ts
 * @description Data processing and transformation Lua examples
 */

export const dataExamples = {
  dataProcessing: `-- Data Processing Example
-- Access parameters via context.data
log("Processing data...")

local input = context.data or {}
local result = {
  count = 0,
  items = {}
}

if input.items then
  for i, item in ipairs(input.items) do
    if item.value > 10 then
      result.count = result.count + 1
      table.insert(result.items, item)
    end
  end
end

log("Found " .. result.count .. " items")
return result`,

  transformation: `-- Data Transformation Example
-- Transform input data structure
local input = context.data or {}

local output = {
  fullName = (input.firstName or "") .. " " .. (input.lastName or ""),
  displayAge = tostring(input.age or 0) .. " years old",
  status = input.isActive and "Active" or "Inactive",
  metadata = {
    processedAt = os.time(),
    processedBy = "lua_transform"
  }
}

log("Transformed data for: " .. output.fullName)
return output`,
}
