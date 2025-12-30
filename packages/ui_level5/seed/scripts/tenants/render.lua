-- Render tenant management UI
-- Single function module for tenant management

---@class Render
local M = {}

---Render tenant list and management UI
---@param ctx TenantContext Context with tenant array
---@return UIComponent
function M.render(ctx)
  local items = {}
  for _, t in ipairs(ctx.tenants or {}) do
    items[#items + 1] = {
      type = "Card",
      children = {
        { type = "CardHeader", children = { { type = "CardTitle", props = { text = t.name } } } },
        { type = "CardContent", children = {
          { type = "Typography", props = { text = "ID: " .. t.id } },
          { type = "Badge", props = { text = t.userCount .. " users" } }
        }},
        { type = "CardFooter", children = {
          { type = "Button", props = { text = "Manage", onClick = "manageTenant", data = t.id } },
          { type = "Button", props = { variant = "destructive", text = "Delete", onClick = "deleteTenant", data = t.id } }
        }}
      }
    }
  end
  return {
    type = "Stack",
    props = { spacing = 4 },
    children = {
      { type = "Button", props = { text = "Create Tenant", onClick = "createTenant" } },
      { type = "Grid", props = { cols = 3, gap = 4 }, children = items }
    }
  }
end

return M
