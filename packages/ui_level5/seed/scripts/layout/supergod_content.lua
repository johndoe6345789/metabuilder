-- Level 5 Supergod panel content
local function supergod_content(children)
  return {
    type = "supergod_content",
    fullWidth = true,
    multiTenant = true,
    children = children or {}
  }
end

return supergod_content
