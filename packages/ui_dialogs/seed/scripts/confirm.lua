local M = {}

function M.render(props)
  return {
    type = "Dialog",
    props = { open = props.open },
    children = {
      {
        type = "DialogContent",
        children = {
          { type = "DialogHeader", children = {
            { type = "DialogTitle", props = { text = props.title or "Confirm" } },
            { type = "DialogDescription", props = { text = props.message } }
          }},
          { type = "DialogFooter", children = {
            { type = "Button", props = { variant = "outline", text = "Cancel", onClick = "onCancel" } },
            { type = "Button", props = { variant = props.destructive and "destructive" or "default", text = props.confirmText or "Confirm", onClick = "onConfirm" } }
          }}
        }
      }
    }
  }
end

return M
