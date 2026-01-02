local render_stat = require("render_stat")

--- Render stats grid component
---@param data { followers?: number, following?: number, posts?: number } Stats data
---@return StatsGridComponent Stats grid component
local function render_stats(data)
  return {
    type = "stats_grid",
    columns = 3,
    children = {
      render_stat("Followers", data.followers or 0, "users"),
      render_stat("Following", data.following or 0, "user-plus"),
      render_stat("Posts", data.posts or 0, "file-text")
    }
  }
end

return render_stats
