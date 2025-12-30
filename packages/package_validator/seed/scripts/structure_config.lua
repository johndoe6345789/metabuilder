--- Structure configuration constants
---@type StructureConfig
local REQUIRED_STRUCTURE = {
  ["seed/metadata.json"] = true,
  ["seed/components.json"] = true
}

---@type StructureConfig
local OPTIONAL_STRUCTURE = {
  ["seed/scripts/"] = "directory",
  ["seed/scripts/init.lua"] = "file",
  ["seed/scripts/tests/"] = "directory",
  ["static_content/"] = "directory",
  ["static_content/icon.svg"] = "file",
  ["README.md"] = "file",
  ["examples/"] = "directory"
}

return {
  REQUIRED = REQUIRED_STRUCTURE,
  OPTIONAL = OPTIONAL_STRUCTURE
}
