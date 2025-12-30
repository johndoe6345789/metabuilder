-- Add schema action

---@class ActionResult
---@field success boolean
---@field action string
---@field id? string

---Opens the add schema dialog
---@return ActionResult
local function addSchema()
  return { success = true, action = "open_schema_dialog" }
end

return addSchema
