-- Add schema action

require("schemas.types")

---Opens the add schema dialog
---@return ActionResult
local function addSchema()
  return { success = true, action = "open_schema_dialog" }
end

return addSchema
