-- Header actions section

---@class Action
---@field type? string
---@field label? string
---@field onClick? string

---@class ActionsComponent
---@field type string
---@field children? Action[]

---@param actions? Action[]
---@return ActionsComponent
local function actions_section(actions)
  return {
    type = "actions",
    children = actions or {}
  }
end

return actions_section
