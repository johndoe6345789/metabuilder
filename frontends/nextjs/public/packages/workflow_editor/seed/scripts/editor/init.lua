-- Workflow editor module

---@class EditorModule
---@field render fun(workflow: Workflow?): WorkflowEditor
---@field add_step fun(step_type: string, config: table?): WorkflowStep
---@field connect_steps fun(from_id: string, to_id: string, condition: string?): Connection

local M = {
  render = require("editor.render").render,
  add_step = require("editor.add_step").add_step,
  connect_steps = require("editor.connect_steps").connect_steps
}

return M
