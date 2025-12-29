-- Action column definition
local function action_column(id, actions)
  return {
    type = "actions",
    id = id,
    label = "",
    width = "120px",
    actions = actions or {}
  }
end

return action_column
