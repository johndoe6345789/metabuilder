-- Get color class for operation type

local mappings = require("formatting.mappings")

---@class GetOperationColor
local M = {}

---Get CSS color class for an operation type
---@param operation string Operation name (CREATE, READ, UPDATE, DELETE)
---@return string CSS class for the operation badge
function M.getOperationColor(operation)
  return mappings.operationColors[operation] or "bg-gray-500"
end

return M
