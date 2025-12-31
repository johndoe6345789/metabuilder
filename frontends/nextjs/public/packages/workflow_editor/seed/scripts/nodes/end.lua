-- Workflow node end

---@class EndNodeDefinition
---@field type "end" Node type identifier
---@field id string Unique node identifier
---@field label string Display label for the node

---Creates an end node for workflow termination
---@param id string Unique node identifier
---@param label string? Display label (default "End")
---@return EndNodeDefinition
local function end_node(id, label)
  return {
    type = "end",
    id = id,
    label = label or "End"
  }
end

return end_node
