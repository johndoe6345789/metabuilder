-- forum_forge: Thread List Component
-- Displays threads in a category with moderation controls

local M = {}

function M.render(context)
  local threads = context.threads or {
    { id = 1, title = "Welcome to the forum!", author = "Admin", replies = 12, views = 245, pinned = true },
    { id = 2, title = "How do I get started?", author = "NewUser", replies = 5, views = 89, pinned = false },
    { id = 3, title = "Feature request: Dark mode", author = "User123", replies = 23, views = 156, pinned = false },
    { id = 4, title = "Bug report: Login issues", author = "TestUser", replies = 3, views = 45, pinned = false }
  }

  local user = context.user or {}
  local isModerator = user.level and user.level >= 3

  local threadItems = {}
  for _, thread in ipairs(threads) do
    local threadChildren = {
      {
        type = "div",
        className = "forum_forge_thread_info",
        children = {
          {
            type = "h3",
            className = "forum_forge_thread_title",
            text = (thread.pinned and "📌 " or "") .. thread.title
          },
          {
            type = "span",
            className = "forum_forge_thread_author",
            text = "by " .. thread.author
          }
        }
      },
      {
        type = "div",
        className = "forum_forge_thread_stats",
        children = {
          {
            type = "span",
            text = thread.replies .. " replies"
          },
          {
            type = "span",
            text = thread.views .. " views"
          }
        }
      }
    }

    if isModerator then
      table.insert(threadChildren, {
        type = "div",
        className = "forum_forge_mod_actions",
        children = {
          {
            type = "button",
            className = "button forum_forge_button_small",
            text = "Pin",
            action = "forum.moderate.pin",
            data = { threadId = thread.id }
          },
          {
            type = "button",
            className = "button forum_forge_button_small",
            text = "Lock",
            action = "forum.moderate.lock",
            data = { threadId = thread.id }
          }
        }
      })
    end

    table.insert(threadItems, {
      type = "div",
      className = "card forum_forge_thread",
      children = threadChildren
    })
  end

  return {
    type = "div",
    className = "forum_forge_thread_list",
    children = threadItems
  }
end

return M
