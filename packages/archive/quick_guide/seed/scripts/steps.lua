-- Steps editor logic for quick guides

---@class Step
---@field id string Unique step identifier
---@field title string Step title
---@field description string Step description
---@field duration string Estimated duration
---@field mediaUrl? string Optional media URL

---@class StepValidationErrors
---@field title? string Title error message
---@field description? string Description error message

---@class StepValidationResult
---@field valid boolean Whether step is valid
---@field errors StepValidationErrors Validation errors

---@class AllStepsValidationResult
---@field valid boolean Whether all steps are valid
---@field errors table<string, StepValidationErrors> Errors by step ID

---@class StepsModule
local M = {}

---Generate a unique step ID
---@return string Unique step identifier
function M.generateStepId()
  return "step_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999)
end

---Create a new empty step
---@return Step New step with default values
function M.createStep()
  return {
    id = M.generateStepId(),
    title = "New step",
    description = "Describe what happens in this step.",
    duration = "1-2 min",
    mediaUrl = nil
  }
end

---Update a step in the list
---@param steps Step[] Array of steps
---@param stepId string ID of step to update
---@param updates table Partial step updates
---@return Step[] Updated steps array
function M.updateStep(steps, stepId, updates)
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

---Remove a step from the list
---@param steps Step[] Array of steps
---@param stepId string ID of step to remove
---@return Step[] Updated steps array
function M.removeStep(steps, stepId)
  local result = {}
  for _, step in ipairs(steps) do
    if step.id ~= stepId then
      result[#result + 1] = step
    end
  end
  return result
end

---Add a new step to the list
---@param steps Step[] Array of steps
---@return Step[] Updated steps array
---@return Step New step that was added
function M.addStep(steps)
  local newStep = M.createStep()
  local result = {}
  for i, step in ipairs(steps) do
    result[i] = step
  end
  result[#result + 1] = newStep
  return result, newStep
end

---Reset step IDs to sequential order
---@param steps Step[] Array of steps
---@return Step[] Steps with reset IDs
function M.resetOrdering(steps)
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

---Validate a single step
---@param step Step Step to validate
---@return StepValidationResult Validation result
function M.validateStep(step)
  local errors = {}
  
  if not step.title or step.title == "" then
    errors.title = "Title is required"
  end
  
  if not step.description or step.description == "" then
    errors.description = "Description is required"
  end
  
  return { valid = next(errors) == nil, errors = errors }
end

---Validate all steps
---@param steps Step[] Array of steps to validate
---@return AllStepsValidationResult Validation result for all steps
function M.validateAllSteps(steps)
  local allErrors = {}
  local valid = true
  
  for i, step in ipairs(steps) do
    local result = M.validateStep(step)
    if not result.valid then
      valid = false
      allErrors[step.id] = result.errors
    end
  end
  
  return { valid = valid, errors = allErrors }
end

return M
