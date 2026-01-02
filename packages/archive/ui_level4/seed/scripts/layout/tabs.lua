-- Tabs component for Level 4 layout

---@class UIComponent
---@field type string
---@field props? table
---@field children? UIComponent[]

---@class User
---@field username string

---@class RenderContext
---@field nerdMode boolean
---@field user User

---Renders the tabbed interface for Schemas, Workflows, and Lua Scripts
---@param ctx RenderContext
---@return UIComponent
local function tabs(ctx)
  return {
    type = "Tabs",
    props = { defaultValue = "schemas" },
    children = {
      {
        type = "TabsList",
        children = {
          { type = "TabsTrigger", props = { value = "schemas", text = "Schemas" } },
          { type = "TabsTrigger", props = { value = "workflows", text = "Workflows" } },
          { type = "TabsTrigger", props = { value = "lua", text = "Lua Scripts" } }
        }
      },
      { type = "TabsContent", props = { value = "schemas" }, children = { { type = "SchemasTab" } } },
      { type = "TabsContent", props = { value = "workflows" }, children = { { type = "WorkflowsTab" } } },
      { type = "TabsContent", props = { value = "lua" }, children = { { type = "LuaScriptsTab" } } }
    }
  }
end

return tabs
