-- Level 5 layout module

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class RenderContext
---@field user table
---@field user.username string
---@field nerdMode boolean
---@field tenants? table[]

local M = {}

---@param ctx RenderContext
---@return UIComponent
function M.render(ctx)
  return {
    type = "Box",
    props = { className = "min-h-screen bg-gradient-to-br from-purple-950 via-slate-900 to-indigo-950" },
    children = {
      { type = "Level5Header", props = { username = ctx.user.username, nerdMode = ctx.nerdMode } },
      {
        type = "Container",
        props = { className = "max-w-7xl mx-auto px-4 py-8 space-y-8" },
        children = {
          { type = "IntroSection", props = { eyebrow = "Level 5", title = "Super God Panel", description = "Govern tenants and manage cross-level operations." } },
          M.navigator(ctx)
        }
      }
    }
  }
end

---@param ctx RenderContext
---@return UIComponent
function M.navigator(ctx)
  return {
    type = "Tabs",
    props = { defaultValue = "tenants" },
    children = {
      {
        type = "TabsList",
        children = {
          { type = "TabsTrigger", props = { value = "tenants", text = "Tenants" } },
          { type = "TabsTrigger", props = { value = "gods", text = "God Users" } },
          { type = "TabsTrigger", props = { value = "transfer", text = "Transfer" } }
        }
      },
      { type = "TabsContent", props = { value = "tenants" }, children = { { type = "TenantsTab" } } },
      { type = "TabsContent", props = { value = "gods" }, children = { { type = "GodsTab" } } },
      { type = "TabsContent", props = { value = "transfer" }, children = { { type = "TransferTab" } } }
    }
  }
end

return M
