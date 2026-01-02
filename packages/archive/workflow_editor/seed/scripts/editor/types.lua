-- Type definitions for workflow editor

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

return {}
