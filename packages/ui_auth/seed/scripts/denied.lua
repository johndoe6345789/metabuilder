local M = {}

function M.render(props)
  return {
    type = "Stack",
    props = { spacing = 2, className = "items-center justify-center min-h-[50vh] text-center" },
    children = {
      { type = "Icon", props = { name = "lock", size = 48, className = "text-muted-foreground" } },
      { type = "Typography", props = { variant = "h5", text = props.title or "Access restricted" } },
      { type = "Typography", props = { variant = "body2", text = props.description or "You don't have permission.", className = "text-muted-foreground" } },
      props.actionLabel and {
        type = "Button",
        props = { variant = "contained", text = props.actionLabel, onClick = props.onAction or "goBack" }
      } or nil
    }
  }
end

return M
