local M = {}

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
