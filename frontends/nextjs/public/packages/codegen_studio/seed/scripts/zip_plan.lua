---@class ZipPlan
local M = {}

---@class BlueprintFile
---@field path string
---@field content? string

---@class Blueprint
---@field name? string
---@field files? BlueprintFile[]

---@class ZipEntry
---@field path string
---@field size number

---@class ZipPlanOutput
---@field name string
---@field entries ZipEntry[]

---@param blueprint Blueprint
---@return ZipPlanOutput
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
