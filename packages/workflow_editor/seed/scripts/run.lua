-- Workflow run card utilities

---@class WorkflowRun
---@field workflow_name string Workflow name
---@field run_number integer Run number
---@field started_at string Start timestamp
---@field duration? string Run duration (or nil if running)
---@field status string Run status

---@class CardChild
---@field type string Child component type
---@field content? string Text content
---@field status? string Status for badge

---@class RunCardProps
---@field title string Card title
---@field subtitle string Card subtitle

---@class RunCard
---@field type "card"
---@field props RunCardProps
---@field children CardChild[]

---@class RunListGrid
---@field type "grid"
---@field columns integer Number of columns
---@field children RunCard[]

---@class RunModule
local M = {}

---Render a workflow run card
---@param run WorkflowRun Workflow run data
---@return RunCard
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

---Render a list of workflow runs as a grid
---@param runs WorkflowRun[] Array of workflow runs
---@return RunListGrid
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
