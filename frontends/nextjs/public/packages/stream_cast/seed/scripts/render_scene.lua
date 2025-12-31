--- Render a single scene preview
---@param scene Scene Scene data
---@return ScenePreviewComponent Scene preview component
local function render_scene(scene)
  return {
    type = "scene_preview",
    props = {
      id = scene.id,
      name = scene.name,
      thumbnail = scene.thumbnail,
      active = scene.active or false
    }
  }
end

return render_scene
