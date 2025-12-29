local M = {}

function M.render(props)
  local text = props.text or "© 2024 MetaBuilder. Built with visual workflows."
  return {
    type = "Box",
    props = { className = "border-t bg-muted/30 py-8 mt-20" },
    children = {
      {
        type = "Container",
        props = { className = "text-center text-sm text-muted-foreground" },
        children = {
          { type = "Typography", props = { text = text } }
        }
      }
    }
  }
end

return M
