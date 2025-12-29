local M = {}

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

function M.addSchema()
  return { success = true, action = "open_schema_dialog" }
end

function M.editSchema(ctx)
  return { success = true, action = "open_schema_dialog", id = ctx.schemaId }
end

return M
