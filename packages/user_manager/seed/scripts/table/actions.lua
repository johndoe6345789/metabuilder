-- User table actions
--- @class ActionConfig Action configuration for table rows
--- @field id string Unique action identifier
--- @field icon string Icon name for the action button
--- @field label string Display label for the action
--- @field confirm? boolean Whether to show confirmation dialog

--- Get user table action configurations
--- @return ActionConfig[] actions Array of action configurations
local function user_actions()
  return {
    { id = "edit", icon = "edit", label = "Edit" },
    { id = "delete", icon = "trash", label = "Delete", confirm = true },
    { id = "impersonate", icon = "user", label = "Impersonate" }
  }
end

return user_actions
