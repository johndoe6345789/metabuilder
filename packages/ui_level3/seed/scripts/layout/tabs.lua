-- Tabbed interface for admin panel

---@class UIComponent
---@field type string
---@field props table?
---@field children table[]?

local M = {}

---Creates tabbed interface for users and comments management
---@return UIComponent Tabs component with content sections
function M.tabs()
  return {
    type = "Tabs",
    props = { defaultValue = "users" },
    children = {
      {
        type = "TabsList",
        children = {
          { type = "TabsTrigger", props = { value = "users", text = "Users" } },
          { type = "TabsTrigger", props = { value = "comments", text = "Comments" } }
        }
      },
      {
        type = "TabsContent",
        props = { value = "users" },
        children = { { type = "UsersTable" } }
      },
      {
        type = "TabsContent",
        props = { value = "comments" },
        children = { { type = "CommentsTable" } }
      }
    }
  }
end

return M
