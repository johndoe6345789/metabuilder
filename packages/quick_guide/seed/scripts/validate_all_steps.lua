local validate_step = require("validate_step")

--- Validate all steps
---@param steps Step[] Array of steps to validate
---@return AllStepsValidationResult Validation result for all steps
local function validate_all_steps(steps)
  local allErrors = {}
  local valid = true
  
  for _, step in ipairs(steps) do
    local result = validate_step(step)
    if not result.valid then
      valid = false
      allErrors[step.id] = result.errors
    end
  end
  
  return { valid = valid, errors = allErrors }
end

return validate_all_steps
