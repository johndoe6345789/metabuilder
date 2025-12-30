-- Data Table initialization

---@class DataTable
---@field name string
---@field version string
local M = {}

M.name = "data_table"
M.version = "1.0.0"

---@class DataTableInitResult
---@field name string
---@field version string
---@field loaded boolean

---Initialize the data table module
---@return DataTableInitResult
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
