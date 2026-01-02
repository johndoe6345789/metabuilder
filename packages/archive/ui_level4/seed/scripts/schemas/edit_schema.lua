-- Edit schema action

require("schemas.types")

---Opens the edit schema dialog for the specified schema
---@param ctx EditSchemaContext
---@return ActionResult
local function editSchema(ctx)
  return { success = true, action = "open_schema_dialog", id = ctx.schemaId }
end

return editSchema
