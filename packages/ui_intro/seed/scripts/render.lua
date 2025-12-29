local M = {}

function M.render(props)
  return {
    type = "Stack",
    props = { spacing = 2 },
    children = {
      props.eyebrow and {
        type = "Typography",
        props = { variant = "overline", text = props.eyebrow, className = "text-primary" }
      } or nil,
      {
        type = "Typography",
        props = { variant = "h4", text = props.title or "Welcome" }
      },
      props.description and {
        type = "Typography",
        props = { variant = "body1", text = props.description, className = "text-muted-foreground" }
      } or nil
    }
  }
end

return M
