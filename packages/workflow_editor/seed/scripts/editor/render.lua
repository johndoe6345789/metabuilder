-- Render workflow editor component
require("editor.types")

local M = {}

---@param workflow Workflow?
---@return WorkflowEditor
function M.render(workflow)
  return {
    type = "workflow_editor",
    props = {
      id = workflow and workflow.id,
      name = workflow and workflow.name or "New Workflow",
      steps = workflow and workflow.steps or {}
    }
  }
end

return M
