local M = {}

local routes = {
  intro = "studio_a",
  main = "studio_b",
  qa = "studio_c"
}

function M.route(scene)
  return routes[scene] or "studio_b"
end

return M
