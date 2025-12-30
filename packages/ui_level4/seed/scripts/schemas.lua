-- Schemas tab module

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class SchemaField
---@field name string
---@field type string

---@class Schema
---@field id string
---@field name string
---@field description? string
---@field fields? SchemaField[]

---@class SchemasRenderContext
---@field schemas? Schema[]

---@class ActionResult
---@field success boolean
---@field action string
---@field id? string

---@class SchemasModule
---@field render fun(ctx: SchemasRenderContext): UIComponent
---@field addSchema fun(): ActionResult
---@field editSchema fun(ctx: table): ActionResult

local M = {}

---Renders the schemas tab with a grid of schema cards
---@param ctx SchemasRenderContext
---@return UIComponent
function M.render(ctx)
  local items = {}
  for _, s in ipairs(ctx.schemas or {}) do
    items[#items + 1] = {
      type = "Card",
      children = {
        { type = "CardHeader", children = { { type = "CardTitle", props = { text = s.name } } } },
        { type = "CardContent", children = {
          { type = "Typography", props = { text = s.description or "No description" } },
          { type = "Badge", props = { text = #(s.fields or {}) .. " fields" } }
        }},
        { type = "CardFooter", children = {
          { type = "Button", props = { text = "Edit", onClick = "editSchema", data = s.id } }
        }}
      }
    }
  end
  return {
    type = "Stack",
    props = { spacing = 4 },
    children = {
      { type = "Button", props = { text = "Add Schema", onClick = "addSchema" } },
      { type = "Grid", props = { cols = 2, gap = 4 }, children = items }
    }
  }
end

---Opens the add schema dialog
---@return ActionResult
function M.addSchema()
  return { success = true, action = "open_schema_dialog" }
end

---Opens the edit schema dialog for the specified schema
---@param ctx table
---@return ActionResult
function M.editSchema(ctx)
  return { success = true, action = "open_schema_dialog", id = ctx.schemaId }
end

return M
