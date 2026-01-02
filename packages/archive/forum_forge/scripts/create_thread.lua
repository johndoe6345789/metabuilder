-- forum_forge: Create Thread Component
-- Provides UI for creating new forum threads

local M = {}

function M.render(context)
  local user = context.user or {}

  return {
    type = "form",
    className = "forum_forge_create_thread",
    children = {
      {
        type = "div",
        className = "card",
        children = {
          {
            type = "h2",
            className = "forum_forge_heading",
            text = "Create New Thread"
          },
          {
            type = "input",
            className = "input forum_forge_input",
            name = "title",
            placeholder = "Thread title...",
            required = true
          },
          {
            type = "select",
            className = "input forum_forge_select",
            name = "category",
            required = true,
            options = {
              { value = "general", label = "General Discussion" },
              { value = "support", label = "Support" },
              { value = "showcase", label = "Showcase" },
              { value = "feedback", label = "Feedback" }
            }
          },
          {
            type = "textarea",
            className = "input forum_forge_textarea",
            name = "content",
            placeholder = "Write your post...",
            rows = 8,
            required = true
          },
          {
            type = "div",
            className = "forum_forge_actions",
            children = {
              {
                type = "button",
                className = "button forum_forge_button",
                text = "Create Thread",
                action = "forum.thread.create"
              },
              {
                type = "button",
                className = "button forum_forge_button_secondary",
                text = "Cancel",
                action = "forum.cancel"
              }
            }
          }
        }
      }
    }
  }
end

return M
