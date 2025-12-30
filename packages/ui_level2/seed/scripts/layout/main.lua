-- Level 2 main content area
local function main(children)
  return {
    type = "main",
    flex = 1,
    children = children or {}
  }
end

return main
