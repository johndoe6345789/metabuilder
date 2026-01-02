-- Open documentation link

---@class NavigationResult
---@field success boolean
---@field action? string
---@field url? string

local M = {}

---Open documentation in external window/tab
---@return NavigationResult
function M.openDocs()
  return {
    success = true,
    action = "external",
    url = "/docs"
  }
end

return M
