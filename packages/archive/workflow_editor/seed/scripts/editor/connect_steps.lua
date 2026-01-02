-- Connect two workflow steps
require("editor.types")

local M = {}

---@param from_id string
---@param to_id string
---@param condition string?
---@return Connection
function M.connect_steps(from_id, to_id, condition)
  return {
    type = "connection",
    from = from_id,
    to = to_id,
    condition = condition
  }
end

return M
