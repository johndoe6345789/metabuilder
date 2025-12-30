-- User table filters
--- @class FilterConfig Filter configuration for table columns
--- @field id string Unique filter identifier
--- @field type "select"|"text"|"date"|"number" Filter input type
--- @field options? string[] Options for select filters
--- @field placeholder? string Placeholder text for text filters

--- Get user table filter configurations
--- @return FilterConfig[] filters Array of filter configurations
local function user_filters()
  return {
    { id = "role", type = "select", options = { "admin", "user", "guest" } },
    { id = "status", type = "select", options = { "active", "inactive" } },
    { id = "search", type = "text", placeholder = "Search users..." }
  }
end

return user_filters
