-- Color and icon mappings for audit log display

---@class Mappings
local M = {}

--- Operation type to color mapping
---@type table<string, string>
M.operationColors = {
  CREATE = "bg-green-500",
  READ = "bg-blue-500",
  UPDATE = "bg-yellow-500",
  DELETE = "bg-red-500"
}

--- Resource type to icon mapping
---@type table<string, string>
M.resourceIcons = {
  user = "User",
  credential = "ShieldCheck",
  post = "ClipboardCheck",
  settings = "Settings",
  default = "ChartLine"
}

return M
