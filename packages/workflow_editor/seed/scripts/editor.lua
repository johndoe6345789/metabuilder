-- Workflow editor rendering
local M = {}

function M.render(workflow)
  return {
    type = "workflow_editor",
    props = {
      id = workflow and workflow.id,
      name = workflow and workflow.name or "New Workflow",
      steps = workflow and workflow.steps or {}
    }
  }
end

function M.add_step(step_type, config)
  return {
    type = "workflow_step",
    step_type = step_type,
    config = config or {},
    position = { x = 0, y = 0 }
  }
end

function M.connect_steps(from_id, to_id, condition)
  return {
    type = "connection",
    from = from_id,
    to = to_id,
    condition = condition
  }
end

return M
