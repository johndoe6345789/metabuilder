--- Switch to a scene
---@param scene_id string Scene ID to switch to
---@return SwitchSceneAction Switch scene action
local function switch_scene(scene_id)
  return {
    action = "switch_scene",
    scene_id = scene_id
  }
end

return switch_scene
