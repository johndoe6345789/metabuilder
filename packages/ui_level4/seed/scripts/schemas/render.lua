-- Render function for schemas tab

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class ButtonProps
---@field text string
---@field onClick string
---@field data? string

---@class BadgeProps
---@field text string

---@class TypographyProps
---@field text string

---@class GridProps
---@field cols number
---@field gap number

---@class StackProps
---@field spacing number

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
  return {
    type = "Stack",
    props = { spacing = 4 },
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
end

return render
