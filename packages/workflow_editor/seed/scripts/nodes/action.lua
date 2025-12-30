-- Workflow node action

---@class ActionNodeDefinition
---@field type "action" Node type identifier
---@field id string Unique node identifier
---@field label string Display label for the node
---@field actionType string The type of action to perform

---Creates an action node for workflow
---@param id string Unique node identifier
---@param label string Display label for the node
---@param action_type string The type of action to perform
---@return ActionNodeDefinition
local function action_node(id, label, action_type)
  return {
    type = "action",
    id = id,
    label = label,
    actionType = action_type
  }
end

return action_node
