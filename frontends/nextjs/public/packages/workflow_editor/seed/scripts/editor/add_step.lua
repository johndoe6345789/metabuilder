-- Add a workflow step
require("editor.types")

local M = {}

---@param step_type string
---@param config table?
---@return WorkflowStep
function M.add_step(step_type, config)
  return {
    type = "workflow_step",
    step_type = step_type,
    config = config or {},
    position = { x = 0, y = 0 }
  }
end

return M
