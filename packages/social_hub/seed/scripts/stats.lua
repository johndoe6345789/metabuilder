-- Social statistics
local M = {}

function M.render_stat(label, value, icon)
  return {
    type = "stat_card",
    props = {
      label = label,
      value = value,
      icon = icon
    }
  }
end

function M.render_stats(data)
  return {
    type = "stats_grid",
    columns = 3,
    children = {
      M.render_stat("Followers", data.followers or 0, "users"),
      M.render_stat("Following", data.following or 0, "user-plus"),
      M.render_stat("Posts", data.posts or 0, "file-text")
    }
  }
end

function M.render_hero(user)
  return {
    type = "hero_section",
    children = {
      { type = "avatar", props = { src = user.avatar, size = "xl" } },
      { type = "heading", props = { level = 1, text = user.name } },
      { type = "text", props = { variant = "muted", text = user.bio } }
    }
  }
end

return M
