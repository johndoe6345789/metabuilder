local M = {}

function M.render(ctx)
  return {
    type = "Box",
    props = { className = "min-h-screen bg-background" },
    children = {
      { type = "AppHeader", props = { username = ctx.user.username, showAvatar = true, variant = "user" } },
      {
        type = "Container",
        props = { className = "max-w-6xl mx-auto px-4 py-8 space-y-8" },
        children = {
          { type = "IntroSection", props = { eyebrow = "Level 2", title = "User Dashboard", description = "Manage your profile and collaborate." } },
          M.tabs()
        }
      }
    }
  }
end

function M.tabs()
  return {
    type = "Tabs",
    props = { defaultValue = "profile" },
    children = {
      {
        type = "TabsList",
        props = { className = "grid w-full grid-cols-3 max-w-lg" },
        children = {
          { type = "TabsTrigger", props = { value = "profile", text = "Profile" } },
          { type = "TabsTrigger", props = { value = "comments", text = "Comments" } },
          { type = "TabsTrigger", props = { value = "chat", text = "Chat" } }
        }
      },
      { type = "TabsContent", props = { value = "profile" }, children = { { type = "ProfileTab" } } },
      { type = "TabsContent", props = { value = "comments" }, children = { { type = "CommentsTab" } } },
      { type = "TabsContent", props = { value = "chat" }, children = { { type = "ChatTab" } } }
    }
  }
end

return M
