-- Config summary module
require("summary.types")
local json = require("json")

---@class SummaryModule
local M = {}

-- Load style configuration from JSON
---@type StyleConfig
M.styleConfig = json.load("config.json")

---Get default wrapper class
---@return string
function M.getWrapperClass()
  return M.styleConfig.defaultWrapperClass
end

---Get default title class
---@return string
function M.getTitleClass()
  return M.styleConfig.defaultTitleClass
end

---Get default grid class
---@return string
function M.getGridClass()
  return M.styleConfig.defaultGridClass
end

---Get default row class
---@return string
function M.getRowClass()
  return M.styleConfig.defaultRowClass
end

---Get default label class
---@return string
function M.getLabelClass()
  return M.styleConfig.defaultLabelClass
end

---Get default value class
---@return string
function M.getValueClass()
  return M.styleConfig.defaultValueClass
end

---Filter visible rows
---@param rows SummaryRow[]
---@return SummaryRow[]
function M.filterVisibleRows(rows)
  local visible = {}
  for _, row in ipairs(rows) do
    if row.visible ~= false then
      table.insert(visible, row)
    end
  end
  return visible
end

---Format a value for display
---@param value string|number
---@return string
function M.formatValue(value)
  if type(value) == "number" then
    return tostring(value)
  end
  return value
end

return M
