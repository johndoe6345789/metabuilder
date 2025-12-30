local create_step = require("create_step")

--- Add a new step to the list
---@param steps Step[] Array of steps
---@return Step[] Updated steps array
---@return Step New step that was added
local function add_step(steps)
  local newStep = create_step()
  local result = {}
  for i, step in ipairs(steps) do
    result[i] = step
  end
  result[#result + 1] = newStep
  return result, newStep
end

return add_step
