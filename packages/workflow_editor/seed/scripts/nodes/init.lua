-- Workflow nodes module
local nodes = {
  start = require("nodes.start"),
  ["end"] = require("nodes.end"),
  action = require("nodes.action"),
  condition = require("nodes.condition")
}

return nodes
