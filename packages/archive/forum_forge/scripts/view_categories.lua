-- forum_forge: View Categories Component
-- Displays forum categories and thread counts

local M = {}

function M.render(context)
  local categories = context.categories or {
    { id = "general", name = "General Discussion", threads = 42, posts = 156 },
    { id = "support", name = "Support", threads = 28, posts = 94 },
    { id = "showcase", name = "Showcase", threads = 15, posts = 73 },
    { id = "feedback", name = "Feedback", threads = 8, posts = 31 }
  }

  local categoryItems = {}
  for _, cat in ipairs(categories) do
    table.insert(categoryItems, {
      type = "div",
      className = "card forum_forge_category",
      children = {
        {
          type = "h3",
          className = "forum_forge_category_name",
          text = cat.name
        },
        {
          type = "div",
          className = "forum_forge_stats",
          children = {
            {
              type = "span",
              text = cat.threads .. " threads"
            },
            {
              type = "span",
              text = cat.posts .. " posts"
            }
          }
        },
        {
          type = "button",
          className = "button forum_forge_button",
          text = "View Threads",
          action = "forum.view.category",
          data = { categoryId = cat.id }
        }
      }
    })
  end

  return {
    type = "div",
    className = "forum_forge_categories",
    children = {
      {
        type = "h2",
        className = "forum_forge_heading",
        text = "Forum Categories"
      },
      {
        type = "div",
        className = "forum_forge_category_list",
        children = categoryItems
      }
    }
  }
end

return M
