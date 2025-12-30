-- Header actions section
local function actions_section(actions)
  return {
    type = "actions",
    children = actions or {}
  }
end

return actions_section
