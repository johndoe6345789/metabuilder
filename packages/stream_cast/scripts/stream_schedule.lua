-- stream_cast: Stream Schedule Component
-- Manage streaming schedule and upcoming broadcasts

local M = {}

function M.render(context)
  local schedules = context.schedules or {
    { id = 1, title = "Morning Gaming Session", date = "2025-01-02", time = "09:00", duration = "3h", recurring = true },
    { id = 2, title = "Tutorial Series Ep. 5", date = "2025-01-03", time = "14:00", duration = "2h", recurring = false },
    { id = 3, title = "Community Q&A", date = "2025-01-04", time = "18:00", duration = "1h", recurring = true },
    { id = 4, title = "Special Event Stream", date = "2025-01-05", time = "20:00", duration = "4h", recurring = false }
  }

  local user = context.user or {}
  local canManageSchedule = user.level and user.level >= 3

  local scheduleItems = {}
  for _, schedule in ipairs(schedules) do
    table.insert(scheduleItems, {
      type = "div",
      className = "card stream_cast_schedule_item",
      children = {
        {
          type = "div",
          className = "stream_cast_schedule_header",
          children = {
            {
              type = "h4",
              className = "stream_cast_schedule_title",
              text = schedule.title
            },
            {
              type = "span",
              className = "stream_cast_schedule_badge",
              text = schedule.recurring and "♻️ Recurring" or "📅 One-time"
            }
          }
        },
        {
          type = "div",
          className = "stream_cast_schedule_details",
          children = {
            {
              type = "span",
              text = "📆 " .. schedule.date
            },
            {
              type = "span",
              text = "🕐 " .. schedule.time
            },
            {
              type = "span",
              text = "⏱️ " .. schedule.duration
            }
          }
        },
        {
          type = "div",
          className = "stream_cast_schedule_actions",
          children = {
            {
              type = "button",
              className = "button stream_cast_button_small",
              text = "Edit",
              action = "stream.schedule.edit",
              data = { scheduleId = schedule.id },
              disabled = not canManageSchedule
            },
            {
              type = "button",
              className = "button stream_cast_button_small",
              text = "Delete",
              action = "stream.schedule.delete",
              data = { scheduleId = schedule.id },
              disabled = not canManageSchedule
            }
          }
        }
      }
    })
  end

  return {
    type = "div",
    className = "stream_cast_schedule",
    children = {
      {
        type = "h2",
        className = "stream_cast_heading",
        text = "Stream Schedule"
      },
      {
        type = "div",
        className = "stream_cast_schedule_list",
        children = scheduleItems
      },
      {
        type = "button",
        className = "button stream_cast_button_primary",
        text = "+ Add Stream",
        action = "stream.schedule.create",
        disabled = not canManageSchedule
      }
    }
  }
end

return M
