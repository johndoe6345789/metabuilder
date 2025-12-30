-- Edit schema action

---@class ActionResult
---@field success boolean
---@field action string
---@field id? string

---Opens the edit schema dialog for the specified schema
---@param ctx table
---@return ActionResult
local function editSchema(ctx)
  return { success = true, action = "open_schema_dialog", id = ctx.schemaId }
end

return editSchema
