-- Workflow node end
local function end_node(id, label)
  return {
    type = "end",
    id = id,
    label = label or "End"
  }
end

return end_node
