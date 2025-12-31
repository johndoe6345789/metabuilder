--- Reset step IDs to sequential order
---@param steps Step[] Array of steps
---@return Step[] Steps with reset IDs
local function reset_ordering(steps)
  local result = {}
  for i, step in ipairs(steps) do
    local resetStep = {}
    for k, v in pairs(step) do
      resetStep[k] = v
    end
    resetStep.id = "step_" .. tostring(i)
    result[i] = resetStep
  end
  return result
end

return reset_ordering
