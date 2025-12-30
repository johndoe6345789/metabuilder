-- Level 4 God panel toolbar
local function god_toolbar(actions)
  return {
    type = "god_toolbar",
    actions = actions or {},
    showSystemStatus = true
  }
end

return god_toolbar
