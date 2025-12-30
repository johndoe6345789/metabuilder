--- Remove a step from the list
---@param steps Step[] Array of steps
---@param stepId string ID of step to remove
---@return Step[] Updated steps array
local function remove_step(steps, stepId)
  local result = {}
  for _, step in ipairs(steps) do
    if step.id ~= stepId then
      result[#result + 1] = step
    end
  end
  return result
end

return remove_step
