-- Workflow Editor initialization

---@class WorkflowEditorModule
---@field name string
---@field version string
---@field init fun(): WorkflowEditorInfo
local M = {}

M.name = "workflow_editor"
M.version = "1.0.0"

---@class WorkflowEditorInfo
---@field name string
---@field version string
---@field loaded boolean

---Initialize the workflow editor module
---@return WorkflowEditorInfo
function M.init()
  return {
    name = M.name,
    version = M.version,
    loaded = true
  }
end

return M
