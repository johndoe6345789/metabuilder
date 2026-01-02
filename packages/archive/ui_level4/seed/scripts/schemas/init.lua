-- Schemas module facade
-- Re-exports all schemas functions for backward compatibility

require("schemas.types")

---@class SchemasModule
---@field render fun(ctx: SchemasRenderContext): UIComponent
---@field addSchema fun(): ActionResult
---@field editSchema fun(ctx: EditSchemaContext): ActionResult
local M = {}

M.render = require("schemas.render")
M.addSchema = require("schemas.add_schema")
M.editSchema = require("schemas.edit_schema")

return M
