-- Level 5 Supergod panel toolbar
local function supergod_toolbar(actions)
  return {
    type = "supergod_toolbar",
    actions = actions or {},
    showAllTenants = true,
    showSystemMetrics = true
  }
end

return supergod_toolbar
