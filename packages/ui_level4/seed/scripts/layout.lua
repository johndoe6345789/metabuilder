local M = {}

function M.render(ctx)
  local desc = ctx.nerdMode 
    and "Design declaratively with schemas and Lua scripts."
    or "Build visually with forms and drag-and-drop."
  return {
    type = "Box",
    props = { className = "min-h-screen bg-canvas" },
    children = {
      { type = "Level4Header", props = { username = ctx.user.username, nerdMode = ctx.nerdMode } },
      {
        type = "Container",
        props = { className = "max-w-7xl mx-auto px-4 py-8 space-y-8" },
        children = {
          { type = "IntroSection", props = { eyebrow = "Level 4", title = "Application Builder", description = desc } },
          M.tabs(ctx)
        }
      }
    }
  }
end

function M.tabs(ctx)
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

return M
