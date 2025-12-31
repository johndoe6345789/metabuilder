-- stream_cast: Control Room Component
-- Main streaming control interface for broadcasters

local M = {}

function M.render(context)
  local stream = context.stream or {
    status = "offline",
    viewers = 0,
    uptime = "00:00:00"
  }

  local user = context.user or {}
  local canBroadcast = user.level and user.level >= 3

  local isLive = stream.status == "live"

  return {
    type = "div",
    className = "stream_cast_control_room",
    children = {
      {
        type = "div",
        className = "card stream_cast_main_panel",
        children = {
          {
            type = "h2",
            className = "stream_cast_heading",
            text = "🎥 Stream Control Room"
          },
          {
            type = "div",
            className = "stream_cast_status",
            children = {
              {
                type = "div",
                className = "stream_cast_status_indicator stream_cast_status_" .. stream.status,
                children = {
                  {
                    type = "span",
                    className = "stream_cast_status_dot",
                    text = isLive and "🔴" or "⚫"
                  },
                  {
                    type = "span",
                    text = " " .. string.upper(stream.status)
                  }
                }
              },
              {
                type = "div",
                className = "stream_cast_metrics",
                children = {
                  {
                    type = "span",
                    text = "👥 " .. stream.viewers .. " viewers"
                  },
                  {
                    type = "span",
                    text = "⏱️ " .. stream.uptime
                  }
                }
              }
            }
          },
          {
            type = "div",
            className = "stream_cast_controls",
            children = {
              {
                type = "button",
                className = "button stream_cast_button_primary",
                text = isLive and "Stop Stream" or "Go Live",
                action = isLive and "stream.stop" or "stream.start",
                disabled = not canBroadcast
              },
              {
                type = "button",
                className = "button stream_cast_button",
                text = "Switch Scene",
                action = "stream.scene.switch",
                disabled = not isLive
              },
              {
                type = "button",
                className = "button stream_cast_button",
                text = "Manage Schedule",
                action = "stream.schedule.view"
              }
            }
          }
        }
      },
      {
        type = "div",
        className = "card stream_cast_preview",
        children = {
          {
            type = "h3",
            className = "stream_cast_subheading",
            text = "Stream Preview"
          },
          {
            type = "div",
            className = "stream_cast_preview_window",
            children = {
              {
                type = "div",
                className = "stream_cast_preview_placeholder",
                text = isLive and "🎬 Live Preview" or "📹 Offline"
              }
            }
          }
        }
      }
    }
  }
end

return M
