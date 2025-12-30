---@class LayoutContext
---@field user table User object with username and id
---@field userCount integer Number of users
---@field commentCount integer Number of comments
---@field flaggedCount integer Number of flagged items

---@class UIComponent
---@field type string Component type name
---@field props table? Component properties
---@field children table[]? Child components

local M = {}

---Renders the main admin panel layout
---@param ctx LayoutContext Context data for rendering
---@return UIComponent Box component with admin panel layout
function M.render(ctx)
  return {
    type = "Box",
    props = { className = "min-h-screen bg-background" },
    children = {
      { type = "AppHeader", props = { title = "Admin Panel", username = ctx.user.username, showBadge = true, variant = "admin" } },
      {
        type = "Container",
        props = { className = "max-w-7xl mx-auto px-4 py-8 space-y-8" },
        children = {
          { type = "IntroSection", props = { eyebrow = "Level 3", title = "Data Management", description = "Manage users and content." } },
          M.stats(ctx),
          M.tabs()
        }
      }
    }
  }
end

---Creates stats grid component with user and content statistics
---@param ctx LayoutContext Context data containing statistics
---@return UIComponent Grid component with stat cards
function M.stats(ctx)
  return {
    type = "Grid",
    props = { cols = 3, gap = 4 },
    children = {
      { type = "StatCard", props = { label = "Users", value = ctx.userCount or 0 } },
      { type = "StatCard", props = { label = "Comments", value = ctx.commentCount or 0 } },
      { type = "StatCard", props = { label = "Flagged", value = ctx.flaggedCount or 0 } }
    }
  }
end

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
      { type = "TabsContent", props = { value = "users" }, children = { { type = "UsersTable" } } },
      { type = "TabsContent", props = { value = "comments" }, children = { { type = "CommentsTable" } } }
    }
  }
end

return M
