-- Workflow nodes module

---@class NodesModule
---@field start fun(id: string, label?: string): StartNodeDefinition
---@field end fun(id: string, label?: string): EndNodeDefinition
---@field action fun(id: string, label: string, action_type: string): ActionNodeDefinition
---@field condition fun(id: string, label: string, condition: string): ConditionNodeDefinition

---@type NodesModule
local nodes = {
  start = require("nodes.start"),
  ["end"] = require("nodes.end"),
  action = require("nodes.action"),
  condition = require("nodes.condition")
}

return nodes
