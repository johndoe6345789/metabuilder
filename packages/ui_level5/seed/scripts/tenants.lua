-- Tenant management for Level 5

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class Tenant
---@field id string
---@field name string
---@field userCount number

---@class TenantContext
---@field tenants? Tenant[]
---@field tenantId? string

---@class ActionResult
---@field success boolean
---@field action string
---@field id? string

local M = {}

---@param ctx TenantContext
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

---@return ActionResult
function M.createTenant()
  return { success = true, action = "open_create_dialog" }
end

---@param ctx TenantContext
---@return ActionResult
function M.deleteTenant(ctx)
  return { success = true, action = "confirm_delete", id = ctx.tenantId }
end

return M
