-- Level 3 admin content area
local function admin_content(children)
  return {
    type = "admin_content",
    padding = 24,
    children = children or {}
  }
end

return admin_content
