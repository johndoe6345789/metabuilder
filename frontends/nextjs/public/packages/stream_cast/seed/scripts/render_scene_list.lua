local render_scene = require("render_scene")

--- Render list of scenes
---@param scenes Scene[] Array of scenes
---@return SceneListComponent Scene list component
local function render_scene_list(scenes)
  local items = {}
  for _, scene in ipairs(scenes) do
    table.insert(items, render_scene(scene))
  end
  return {
    type = "scene_list",
    children = items
  }
end

return render_scene_list
