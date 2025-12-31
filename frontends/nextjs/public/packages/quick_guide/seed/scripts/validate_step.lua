--- Validate a single step
---@param step Step Step to validate
---@return StepValidationResult Validation result
local function validate_step(step)
  local errors = {}
  
  if not step.title or step.title == "" then
    errors.title = "Title is required"
  end
  
  if not step.description or step.description == "" then
    errors.description = "Description is required"
  end
  
  return { valid = next(errors) == nil, errors = errors }
end

return validate_step
