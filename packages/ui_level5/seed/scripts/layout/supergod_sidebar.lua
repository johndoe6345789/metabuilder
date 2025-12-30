-- Level 5 Supergod panel sidebar
local function supergod_sidebar(items)
  return {
    type = "supergod_sidebar",
    width = "320px",
    theme = "system",
    items = items or {}
  }
end

return supergod_sidebar
