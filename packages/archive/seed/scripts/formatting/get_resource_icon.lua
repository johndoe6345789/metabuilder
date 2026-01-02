-- Get icon name for resource type

local mappings = require("formatting.mappings")

---@class GetResourceIcon
local M = {}

---Get icon name for a resource type
---@param resource string Resource type name
---@return string Icon name for the resource
function M.getResourceIcon(resource)
  return mappings.resourceIcons[resource] or mappings.resourceIcons.default
end

return M
