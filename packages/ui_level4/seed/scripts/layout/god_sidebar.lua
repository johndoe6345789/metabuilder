-- Level 4 God panel sidebar
local function god_sidebar(items)
  return {
    type = "god_sidebar",
    width = "300px",
    theme = "dark",
    items = items or {}
  }
end

return god_sidebar
