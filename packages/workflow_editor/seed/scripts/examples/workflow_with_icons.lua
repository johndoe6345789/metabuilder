-- Example: Workflow editor with node icons
local icons = require("icons")
local action_node = require("nodes.action")
local condition = require("nodes.condition")
local start_node = require("nodes.start")
local end_node = require("nodes.end")

---@class WorkflowExample
local M = {}

---Create example workflow with icons
---@return table
function M.create_example_workflow()
  return {
    nodes = {
      start_node("start", "Start Process", icons.get("PLAY_ARROW")),
      action_node("validate", "Validate Data", "validation", icons.get("CHECK_CIRCLE")),
      condition("check_status", "Check Status", icons.get("CALL_SPLIT")),
      action_node("process_success", "Process Success", "transform", icons.get("DONE")),
      action_node("process_error", "Handle Error", "error_handler", icons.get("ERROR")),
      end_node("end", "End Process", icons.get("STOP"))
    },
    edges = {
      { from = "start", to = "validate" },
      { from = "validate", to = "check_status" },
      { from = "check_status", to = "process_success", condition = "success" },
      { from = "check_status", to = "process_error", condition = "error" },
      { from = "process_success", to = "end" },
      { from = "process_error", to = "end" }
    }
  }
end

---Create workflow toolbar with icons
---@return UIComponent
function M.create_workflow_toolbar()
  return {
    type = "Stack",
    props = { direction = "row", spacing = 1, className = "border-b p-2" },
    children = {
      {
        type = "IconButton",
        props = {
          onClick = "save_workflow",
          title = "Save"
        },
        children = {
          { type = "Icon", props = { name = icons.get("SAVE") } }
        }
      },
      {
        type = "IconButton",
        props = {
          onClick = "undo",
          title = "Undo"
        },
        children = {
          { type = "Icon", props = { name = icons.get("UNDO") } }
        }
      },
      {
        type = "IconButton",
        props = {
          onClick = "redo",
          title = "Redo"
        },
        children = {
          { type = "Icon", props = { name = icons.get("REDO") } }
        }
      },
      { type = "Divider", props = { orientation = "vertical" } },
      {
        type = "IconButton",
        props = {
          onClick = "zoom_in",
          title = "Zoom In"
        },
        children = {
          { type = "Icon", props = { name = icons.get("ZOOM_IN") } }
        }
      },
      {
        type = "IconButton",
        props = {
          onClick = "zoom_out",
          title = "Zoom Out"
        },
        children = {
          { type = "Icon", props = { name = icons.get("ZOOM_OUT") } }
        }
      },
      {
        type = "IconButton",
        props = {
          onClick = "center_view",
          title = "Center View"
        },
        children = {
          { type = "Icon", props = { name = icons.get("CENTER_FOCUS") } }
        }
      }
    }
  }
end

return M
