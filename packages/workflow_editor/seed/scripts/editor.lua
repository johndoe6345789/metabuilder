-- Workflow editor rendering

---@class Workflow
---@field id string?
---@field name string?
---@field steps table[]?

---@class Position
---@field x number
---@field y number

---@class WorkflowStep
---@field type string
---@field step_type string
---@field config table
---@field position Position

---@class Connection
---@field type string
---@field from string
---@field to string
---@field condition string?

---@class WorkflowEditorProps
---@field id string?
---@field name string
---@field steps table[]

---@class WorkflowEditor
---@field type string
---@field props WorkflowEditorProps

local M = {}

---Render workflow editor component
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

---Add a workflow step
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

---Connect two workflow steps
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
