-- Level 4 God panel content
local function god_content(children)
  return {
    type = "god_content",
    fullWidth = true,
    children = children or {}
  }
end

return god_content
