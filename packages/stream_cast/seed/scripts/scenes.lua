-- Scene management
local M = {}

function M.render_scene(scene)
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

function M.render_list(scenes)
  local items = {}
  for _, scene in ipairs(scenes) do
    table.insert(items, M.render_scene(scene))
  end
  return {
    type = "scene_list",
    children = items
  }
end

function M.switch(scene_id)
  return {
    action = "switch_scene",
    scene_id = scene_id
  }
end

function M.create(name, sources)
  return {
    action = "create_scene",
    data = {
      name = name,
      sources = sources or {}
    }
  }
end

return M
