local check = require("check")
local M = {}

function M.render(props)
  local items = {}
  for _, item in ipairs(props.items or {}) do
    if M.can_show(props.user, item) then
      items[#items + 1] = M.item(item)
    end
  end
  return {
    type = "Flex",
    props = { className = "items-center gap-4" },
    children = items
  }
end

function M.can_show(user, item)
  if not item.minLevel then return true end
  return check.can_access(user, item.minLevel)
end

function M.item(item)
  if item.children then
    return {
      type = "DropdownMenu",
      children = {
        { type = "DropdownMenuTrigger", props = { text = item.label } },
        { type = "DropdownMenuContent", children = M.sub_items(item.children) }
      }
    }
  end
  return { type = "Button", props = { variant = "ghost", text = item.label, onClick = "navigate", data = item.path } }
end

function M.sub_items(children)
  local items = {}
  for _, c in ipairs(children) do
    items[#items + 1] = { type = "DropdownMenuItem", props = { text = c.label, onClick = "navigate", data = c.path } }
  end
  return items
end

return M
