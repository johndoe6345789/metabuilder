-- Code editor toolbar
local function toolbar(actions)
  return {
    type = "editor_toolbar",
    actions = actions or { "save", "undo", "redo", "format" }
  }
end

return toolbar
