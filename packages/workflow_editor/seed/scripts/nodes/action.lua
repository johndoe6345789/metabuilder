-- Workflow node action
local function action_node(id, label, action_type)
  return {
    type = "action",
    id = id,
    label = label,
    actionType = action_type
  }
end

return action_node
