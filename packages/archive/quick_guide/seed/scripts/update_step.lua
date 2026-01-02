--- Update a step in the list
---@param steps Step[] Array of steps
---@param stepId string ID of step to update
---@param updates table Partial step updates
---@return Step[] Updated steps array
local function update_step(steps, stepId, updates)
  local result = {}
  for i, step in ipairs(steps) do
    if step.id == stepId then
      local updatedStep = {}
      for k, v in pairs(step) do
        updatedStep[k] = v
      end
      for k, v in pairs(updates) do
        updatedStep[k] = v
      end
      result[i] = updatedStep
    else
      result[i] = step
    end
  end
  return result
end

return update_step
