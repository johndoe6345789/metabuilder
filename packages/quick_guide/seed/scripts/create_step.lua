local generate_step_id = require("generate_step_id")

--- Create a new empty step
---@return Step New step with default values
local function create_step()
  return {
    id = generate_step_id(),
    title = "New step",
    description = "Describe what happens in this step.",
    duration = "1-2 min",
    mediaUrl = nil
  }
end

return create_step
