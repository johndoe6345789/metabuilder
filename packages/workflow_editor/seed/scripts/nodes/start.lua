-- Workflow node start
local function start_node(id, label)
  return {
    type = "start",
    id = id,
    label = label or "Start"
  }
end

return start_node
