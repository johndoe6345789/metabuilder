local Analytics = {}

function Analytics.aggregate(events)
  local summary = { views = 0, likes = 0, comments = 0 }
  for _, event in ipairs(events or {}) do
    summary.views = summary.views + (event.views or 0)
    summary.likes = summary.likes + (event.likes or 0)
    summary.comments = summary.comments + (event.comments or 0)
  end
  return summary
end

return Analytics
