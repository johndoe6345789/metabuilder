-- Workflow run card utilities
local M = {}

function M.render(run)
  return {
    type = "card",
    props = {
      title = run.workflow_name,
      subtitle = "Run #" .. run.run_number
    },
    children = {
      { type = "text", content = "Started: " .. run.started_at },
      { type = "text", content = "Duration: " .. (run.duration or "running") },
      { type = "status_badge", status = run.status }
    }
  }
end

function M.render_list(runs)
  local cards = {}
  for _, run in ipairs(runs) do
    table.insert(cards, M.render(run))
  end
  return {
    type = "grid",
    columns = 2,
    children = cards
  }
end

return M
