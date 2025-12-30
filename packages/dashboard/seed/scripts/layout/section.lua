-- Dashboard section layout
local function section(title, children)
  return {
    type = "section",
    title = title,
    children = children or {}
  }
end

return section
