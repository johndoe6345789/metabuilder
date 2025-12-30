-- User table columns
--- @class ColumnConfig Column configuration for table display
--- @field id string Unique column identifier
--- @field type "text"|"image"|"badge"|"actions"|"date"|"number" Column data type
--- @field width? string Column width (e.g., "50px", "10%")
--- @field sortable? boolean Whether column is sortable

--- Get user table column configurations
--- @return ColumnConfig[] columns Array of column configurations
local function user_columns()
  return {
    { id = "avatar", type = "image", width = "50px" },
    { id = "name", type = "text", sortable = true },
    { id = "email", type = "text", sortable = true },
    { id = "role", type = "badge" },
    { id = "actions", type = "actions" }
  }
end

return user_columns
