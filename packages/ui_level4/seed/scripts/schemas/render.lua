-- Render function for schemas tab

require("schemas.types")

---Renders the schemas tab with a grid of schema cards
---@param ctx SchemasRenderContext
---@return UIComponent
local function render(ctx)
  ---@type Schema[]
  local schemas = ctx.schemas or {}
  ---@type UIComponent[]
  local items = {}
  for _, s in ipairs(schemas) do
    items[#items + 1] = {
      type = "Card",
      children = {
        {
          type = "CardHeader",
          children = {
            { type = "CardTitle", props = { text = s.name } }
          }
        },
        {
          type = "CardContent",
          children = {
            {
              type = "Typography",
              props = {
                ---@type TypographyProps
                text = s.description or "No description"
              }
            },
            {
              type = "Badge",
              props = {
                ---@type BadgeProps
                text = #(s.fields or {}) .. " fields"
              }
            }
          }
        },
        {
          type = "CardFooter",
          children = {
            {
              type = "Button",
              props = {
                ---@type ButtonProps
                text = "Edit",
                onClick = "editSchema",
                data = s.id
              }
            }
          }
        }
      }
    }
  end
  ---@type UIComponent
  local view = {
    type = "Stack",
    props = {
      ---@type StackProps
      spacing = 4
    },
    children = {
      {
        type = "Button",
        props = {
          ---@type ButtonProps
          text = "Add Schema",
          onClick = "addSchema"
        }
      },
      {
        type = "Grid",
        props = {
          ---@type GridProps
          cols = 2,
          gap = 4
        },
        children = items
      }
    }
  }
  return view
end

return render
