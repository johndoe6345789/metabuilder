-- Workflow node start

---@class StartNodeDefinition
---@field type "start" Node type identifier
---@field id string Unique node identifier
---@field label string Display label for the node

---Creates a start node for workflow entry point
---@param id string Unique node identifier
---@param label string? Display label (default "Start")
---@return StartNodeDefinition
local function start_node(id, label)
  return {
    type = "start",
    id = id,
    label = label or "Start"
  }
end

return start_node
