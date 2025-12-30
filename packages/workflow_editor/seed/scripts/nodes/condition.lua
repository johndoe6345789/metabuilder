-- Workflow node condition

---@class ConditionNodeDefinition
---@field type "condition" Node type identifier
---@field id string Unique node identifier
---@field label string Display label for the node
---@field condition string The condition expression to evaluate
---@field outputs string[] Available output branches ("true", "false")

---Creates a condition node for workflow branching
---@param id string Unique node identifier
---@param label string Display label for the node
---@param condition string The condition expression to evaluate
---@return ConditionNodeDefinition
local function condition_node(id, label, condition)
  return {
    type = "condition",
    id = id,
    label = label,
    condition = condition,
    outputs = { "true", "false" }
  }
end

return condition_node
