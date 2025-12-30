-- Workflow node action

---@class ActionNodeDefinition
---@field type "action" Node type identifier
---@field id string Unique node identifier
---@field label string Display label for the node
---@field actionType string The type of action to perform
---@field icon? string Icon name from fakemui icons

---Creates an action node for workflow
---@param id string Unique node identifier
---@param label string Display label for the node
---@param action_type string The type of action to perform
---@param icon? string Icon name from fakemui icons
---@return ActionNodeDefinition
local function action_node(id, label, action_type, icon)
  return {
    type = "action",
    id = id,
    label = label,
    actionType = action_type,
    icon = icon
  }
end

return action_node
