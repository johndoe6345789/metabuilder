local M = {}

function M.prepare_zip(blueprint)
  local entries = {}
  local files = blueprint.files or {}

  for _, file in ipairs(files) do
    local content = file.content or ""
    table.insert(entries, {
      path = file.path,
      size = string.len(content)
    })
  end

  return {
    name = blueprint.name or "project",
    entries = entries
  }
end

return M
