-- Filter workflow runs

---@class FilterModule
local M = {}

---Apply filters to a list of runs
---@param runs WorkflowRun[] Array of workflow runs
---@param filters RunFilters Filter criteria
---@return WorkflowRun[] Filtered runs
function M.filterRuns(runs, filters)
  local result = {}
  
  for _, run in ipairs(runs) do
    local include = true
    
    -- Filter by status
    if filters.status and filters.status ~= "all" then
      if run.status ~= filters.status and run.conclusion ~= filters.status then
        include = false
      end
    end
    
    -- Filter by branch
    if include and filters.branch and filters.branch ~= "" then
      if run.head_branch ~= filters.branch then
        include = false
      end
    end
    
    -- Filter by date range
    if include and filters.dateRange then
      local cutoff = M.getDateCutoff(filters.dateRange)
      if cutoff and run.created_at < cutoff then
        include = false
      end
    end
    
    if include then
      table.insert(result, run)
    end
  end
  
  return result
end

---Get date cutoff for time range filter
---@param range string Time range (1d, 7d, 30d)
---@return string? ISO date string for cutoff
function M.getDateCutoff(range)
  local days = 0
  
  if range == "1d" then
    days = 1
  elseif range == "7d" then
    days = 7
  elseif range == "30d" then
    days = 30
  else
    return nil
  end
  
  -- Calculate cutoff date (placeholder)
  -- Would return ISO date string
  return nil
end

---Apply filters from form data
---@param runs WorkflowRun[] Array of workflow runs
---@param formData table Form data with filter values
---@return WorkflowRun[]
function M.applyFilters(runs, formData)
  local filters = {
    status = formData.status,
    branch = formData.branch,
    dateRange = formData.dateRange
  }
  
  return M.filterRuns(runs, filters)
end

---Sort runs by field
---@param runs WorkflowRun[] Array of workflow runs
---@param field string Field to sort by
---@param ascending boolean Sort ascending if true
---@return WorkflowRun[] Sorted runs
function M.sortRuns(runs, field, ascending)
  local sorted = {}
  for _, run in ipairs(runs) do
    table.insert(sorted, run)
  end
  
  table.sort(sorted, function(a, b)
    local va = a[field]
    local vb = b[field]
    
    if va == nil then return false end
    if vb == nil then return true end
    
    if ascending then
      return va < vb
    else
      return va > vb
    end
  end)
  
  return sorted
end

return M
