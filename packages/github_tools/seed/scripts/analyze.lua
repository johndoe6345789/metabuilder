-- Analyze workflow run statistics

---@class AnalyzeModule
local M = {}

---Calculate statistics from a list of runs
---@param runs WorkflowRun[] Array of workflow runs
---@return RunStats
function M.calculateStats(runs)
  local total = #runs
  local success = 0
  local failure = 0
  local pending = 0
  local total_duration = 0
  local completed_runs = 0
  
  for _, run in ipairs(runs) do
    if run.conclusion == "success" then
      success = success + 1
    elseif run.conclusion == "failure" then
      failure = failure + 1
    elseif run.status == "pending" or run.status == "in_progress" then
      pending = pending + 1
    end
    
    -- Calculate duration if completed
    if run.created_at and run.updated_at then
      -- Duration calculation would parse ISO dates
      -- Placeholder for now
      completed_runs = completed_runs + 1
    end
  end
  
  local success_rate = 0
  if total > 0 then
    success_rate = (success / total) * 100
  end
  
  local avg_duration = 0
  if completed_runs > 0 then
    avg_duration = total_duration / completed_runs
  end
  
  return {
    total = total,
    success = success,
    failure = failure,
    pending = pending,
    success_rate = math.floor(success_rate * 10) / 10,
    avg_duration = avg_duration
  }
end

---Get trend data for success rate over time
---@param runs WorkflowRun[] Array of workflow runs
---@param buckets number Number of time buckets (default 7)
---@return table[] Array of {date, success_rate} pairs
function M.getSuccessTrend(runs, buckets)
  buckets = buckets or 7
  local trend = {}
  
  -- Group runs by date and calculate daily success rate
  -- Placeholder implementation
  for i = 1, buckets do
    table.insert(trend, {
      date = "Day " .. i,
      success_rate = 0
    })
  end
  
  return trend
end

---Get failure breakdown by type
---@param runs WorkflowRun[] Array of workflow runs
---@return table<string, number> Map of failure type to count
function M.getFailureBreakdown(runs)
  local breakdown = {
    build_failure = 0,
    test_failure = 0,
    timeout = 0,
    cancelled = 0,
    other = 0
  }
  
  for _, run in ipairs(runs) do
    if run.conclusion == "failure" then
      -- Would analyze job names to categorize
      breakdown.other = breakdown.other + 1
    elseif run.conclusion == "timed_out" then
      breakdown.timeout = breakdown.timeout + 1
    elseif run.conclusion == "cancelled" then
      breakdown.cancelled = breakdown.cancelled + 1
    end
  end
  
  return breakdown
end

return M
