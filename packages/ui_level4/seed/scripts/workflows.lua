local M = {}

function M.render(ctx)
  local items = {}
  for _, w in ipairs(ctx.workflows or {}) do
    items[#items + 1] = {
      type = "Card",
      children = {
        { type = "CardHeader", children = { { type = "CardTitle", props = { text = w.name } } } },
        { type = "CardContent", children = {
          { type = "Typography", props = { text = w.description or "No description" } },
          { type = "Badge", props = { text = #(w.steps or {}) .. " steps" } }
        }},
        { type = "CardFooter", children = {
          { type = "Button", props = { text = "Edit", onClick = "editWorkflow", data = w.id } },
          { type = "Button", props = { variant = "outline", text = "Run", onClick = "runWorkflow", data = w.id } }
        }}
      }
    }
  end
  return {
    type = "Stack",
    props = { spacing = 4 },
    children = {
      { type = "Button", props = { text = "Add Workflow", onClick = "addWorkflow" } },
      { type = "Grid", props = { cols = 2, gap = 4 }, children = items }
    }
  }
end

function M.addWorkflow()
  return { success = true, action = "open_workflow_dialog" }
end

return M
