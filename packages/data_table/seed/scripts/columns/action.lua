-- Action column definition

---@class Action
---@field label string Action button label
---@field handler string Action handler name

---@class ActionColumn
---@field type "actions" Column type identifier
---@field id string Column identifier
---@field label string Column header label (typically empty)
---@field width string Column width (e.g., "120px")
---@field actions Action[] Array of actions

---Create an action column definition
---@param id string Column identifier
---@param actions? Action[] Array of actions (default: {})
---@return ActionColumn action_column The action column definition
local function action_column(id, actions)
  return {
    type = "actions",
    id = id,
    label = "",
    width = "120px",
    actions = actions or {}
  }
end

return action_column
