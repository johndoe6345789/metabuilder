-- Workflow node condition
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
