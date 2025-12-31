-- Type definitions for workflow_editor package
-- Central types file for visual workflow editing
-- @meta

-- Re-export module types
local editor_types = require("editor.types")

---@alias NodeType "trigger"|"action"|"condition"|"loop"|"delay"|"parallel"|"end"|"custom"

---@alias ExecutionStatus "pending"|"running"|"completed"|"failed"|"skipped"|"cancelled"

---@alias TriggerType "manual"|"schedule"|"webhook"|"event"|"database"

---@class Position
---@field x number X coordinate on canvas
---@field y number Y coordinate on canvas

---@class NodeSize
---@field width number Node width in pixels
---@field height number Node height in pixels

---@class WorkflowNode
---@field id string Unique node identifier
---@field type NodeType Node type
---@field name string Display name
---@field description? string Node description
---@field position Position Canvas position
---@field size? NodeSize Optional custom size
---@field config table<string, any> Node-specific configuration
---@field inputs string[] Input port names
---@field outputs string[] Output port names
---@field disabled? boolean Whether node is disabled
---@field validation? ValidationResult Last validation result

---@class TriggerNode : WorkflowNode
---@field type "trigger"
---@field triggerType TriggerType Type of trigger
---@field schedule? string Cron expression for scheduled triggers
---@field webhookUrl? string Webhook URL for webhook triggers
---@field eventName? string Event name for event triggers

---@class ActionNode : WorkflowNode
---@field type "action"
---@field actionType string Type of action (e.g., "http", "email", "database")
---@field retryCount? number Number of retries on failure
---@field retryDelay? number Delay between retries in ms
---@field timeout? number Timeout in ms

---@class ConditionNode : WorkflowNode
---@field type "condition"
---@field expression string Condition expression
---@field trueOutput string Output for true condition
---@field falseOutput string Output for false condition

---@class LoopNode : WorkflowNode
---@field type "loop"
---@field collection string Variable name containing items
---@field itemVariable string Variable name for current item
---@field maxIterations? number Maximum iterations

---@class Connection
---@field id string Connection identifier
---@field source string Source node ID
---@field sourceOutput string Source output port
---@field target string Target node ID
---@field targetInput string Target input port
---@field condition? string Optional condition expression
---@field label? string Connection label

---@class Workflow
---@field id string Workflow identifier
---@field name string Workflow name
---@field description? string Workflow description
---@field version string Workflow version
---@field nodes WorkflowNode[] Workflow nodes
---@field connections Connection[] Node connections
---@field variables table<string, any> Workflow variables
---@field enabled boolean Whether workflow is enabled
---@field createdAt number Creation timestamp
---@field updatedAt number Last update timestamp

---@class WorkflowExecution
---@field id string Execution identifier
---@field workflowId string Workflow being executed
---@field status ExecutionStatus Overall execution status
---@field startedAt number Start timestamp
---@field finishedAt? number Finish timestamp
---@field nodeStates table<string, NodeExecutionState> State per node
---@field variables table<string, any> Runtime variables
---@field error? string Error message if failed
---@field triggeredBy string What triggered this execution

---@class NodeExecutionState
---@field nodeId string Node identifier
---@field status ExecutionStatus Node execution status
---@field startedAt? number Start timestamp
---@field finishedAt? number Finish timestamp
---@field input? table Input data
---@field output? table Output data
---@field error? string Error message if failed
---@field attempts number Number of execution attempts

---@class WorkflowEditorConfig
---@field workflow Workflow Workflow being edited
---@field readonly? boolean Read-only mode
---@field showMinimap? boolean Show minimap
---@field showToolbar? boolean Show toolbar
---@field snapToGrid? boolean Snap nodes to grid
---@field gridSize? number Grid size in pixels
---@field canvasWidth? number Canvas width
---@field canvasHeight? number Canvas height
---@field zoom? number Initial zoom level
---@field onSave? fun(workflow: Workflow): void Save callback
---@field onExecute? fun(workflow: Workflow): void Execute callback
---@field onCancel? fun(): void Cancel callback

---@class WorkflowEditorState
---@field workflow Workflow Current workflow state
---@field selectedNodes string[] Selected node IDs
---@field selectedConnection string|nil Selected connection ID
---@field clipboard WorkflowNode[] Copied nodes
---@field undoStack Workflow[] Undo history
---@field redoStack Workflow[] Redo history
---@field zoom number Current zoom level
---@field pan Position Canvas pan offset
---@field isDirty boolean Has unsaved changes

---@class ValidationResult
---@field valid boolean Whether node is valid
---@field errors string[] Validation errors
---@field warnings string[] Validation warnings

---@class NodePalette
---@field category string Category name
---@field nodes NodeTemplate[] Available node templates

---@class NodeTemplate
---@field type NodeType Node type
---@field name string Display name
---@field description string Template description
---@field icon string Icon name
---@field defaultConfig table Default configuration

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
