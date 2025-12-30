-- Level 2 sidebar component
local function sidebar(items)
  return {
    type = "sidebar",
    width = "250px",
    items = items or {}
  }
end

return sidebar
