-- stream_cast: Scene Manager Component
-- Manage stream scenes and transitions

local M = {}

function M.render(context)
  local scenes = context.scenes or {
    { id = 1, name = "Main Camera", active = true, sources = 3 },
    { id = 2, name = "Screen Share", active = false, sources = 2 },
    { id = 3, name = "BRB Screen", active = false, sources = 1 },
    { id = 4, name = "Ending Soon", active = false, sources = 2 }
  }

  local user = context.user or {}
  local canManageScenes = user.level and user.level >= 3

  local sceneCards = {}
  for _, scene in ipairs(scenes) do
    table.insert(sceneCards, {
      type = "div",
      className = "card stream_cast_scene " .. (scene.active and "stream_cast_scene_active" or ""),
      children = {
        {
          type = "div",
          className = "stream_cast_scene_header",
          children = {
            {
              type = "h4",
              className = "stream_cast_scene_name",
              text = scene.name
            },
            {
              type = "span",
              className = "stream_cast_scene_badge",
              text = scene.active and "ACTIVE" or ""
            }
          }
        },
        {
          type = "div",
          className = "stream_cast_scene_info",
          children = {
            {
              type = "span",
              text = "📦 " .. scene.sources .. " sources"
            }
          }
        },
        {
          type = "div",
          className = "stream_cast_scene_actions",
          children = {
            {
              type = "button",
              className = "button stream_cast_button_small",
              text = "Activate",
              action = "stream.scene.activate",
              data = { sceneId = scene.id },
              disabled = scene.active or not canManageScenes
            },
            {
              type = "button",
              className = "button stream_cast_button_small",
              text = "Edit",
              action = "stream.scene.edit",
              data = { sceneId = scene.id },
              disabled = not canManageScenes
            }
          }
        }
      }
    })
  end

  return {
    type = "div",
    className = "stream_cast_scene_manager",
    children = {
      {
        type = "h2",
        className = "stream_cast_heading",
        text = "Scene Manager"
      },
      {
        type = "div",
        className = "stream_cast_scene_list",
        children = sceneCards
      },
      {
        type = "button",
        className = "button stream_cast_button_primary",
        text = "+ Create New Scene",
        action = "stream.scene.create",
        disabled = not canManageScenes
      }
    }
  }
end

return M
