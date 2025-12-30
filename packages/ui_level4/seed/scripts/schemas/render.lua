-- Render function for schemas tab

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

---Renders the schemas tab with a grid of schema cards
---@param ctx SchemasRenderContext
---@return UIComponent
local function render(ctx)
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

return render
