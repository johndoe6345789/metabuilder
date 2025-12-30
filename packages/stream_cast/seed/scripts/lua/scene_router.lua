---@class SceneRouter
local M = {}

---@type table<string, string>
local routes = {
  intro = "studio_a",
  main = "studio_b",
  qa = "studio_c"
}

---@param scene string
---@return string
function M.route(scene)
  return routes[scene] or "studio_b"
end

return M
