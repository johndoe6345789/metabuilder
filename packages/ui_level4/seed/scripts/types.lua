-- LuaCATS type definitions for ui_level4 package (Admin Panel)
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Render Context
--------------------------------------------------------------------------------

---@class RenderContext
---@field user User Current logged-in user (level 4+)
---@field stats? AdminStats System statistics

---@class User
---@field id string User ID
---@field username string Username
---@field level number Permission level (4 = ADMIN)
---@field tenantId string Admin's tenant ID

---@class AdminStats
---@field totalUsers number Total user count
---@field activeUsers number Active users today
---@field totalWorkflows number Workflow count
---@field totalSchemas number Schema count

--------------------------------------------------------------------------------
-- Schema Types
--------------------------------------------------------------------------------

---@class Schema
---@field id string Schema ID
---@field name string Schema name
---@field description? string Schema description
---@field fields SchemaField[] Schema fields
---@field createdAt string ISO date string
---@field updatedAt string ISO date string

---@class SchemaField
---@field name string Field name
---@field type "string"|"number"|"boolean"|"date"|"reference"|"array" Field type
---@field required? boolean Is required
---@field defaultValue? any Default value
---@field validation? FieldValidation Validation rules

---@class FieldValidation
---@field min? number Minimum value/length
---@field max? number Maximum value/length
---@field pattern? string Regex pattern
---@field enum? any[] Allowed values

--------------------------------------------------------------------------------
-- Workflow Types
--------------------------------------------------------------------------------

---@class Workflow
---@field id string Workflow ID
---@field name string Workflow name
---@field description? string Workflow description
---@field steps WorkflowStep[] Workflow steps
---@field trigger? WorkflowTrigger Trigger configuration
---@field enabled boolean Is workflow active

---@class WorkflowStep
---@field id string Step ID
---@field name string Step name
---@field type "action"|"condition"|"transform"|"lua" Step type
---@field config table<string, any> Step configuration
---@field next? string[] Next step IDs

---@class WorkflowTrigger
---@field type "manual"|"schedule"|"event" Trigger type
---@field config table<string, any> Trigger configuration

---@class WorkflowsRenderContext
---@field workflows? Workflow[] Available workflows

---@class ActionResult
---@field success boolean Whether action succeeded
---@field action string Action identifier
---@field id? string Created/modified ID
---@field error? string Error message

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

---@class CardProps
---@field variant? "default"|"outlined" Card style
---@field className? string CSS classes

--------------------------------------------------------------------------------
-- Admin Modules
--------------------------------------------------------------------------------

---@class SchemasModule
---@field render fun(schemas: Schema[]): UIComponent Render schemas tab
---@field create fun(data: Schema): ActionResult Create new schema
---@field update fun(id: string, data: Schema): ActionResult Update schema
---@field delete fun(id: string): ActionResult Delete schema

---@class WorkflowsModule
---@field render fun(ctx: WorkflowsRenderContext): UIComponent Render workflows tab
---@field addWorkflow fun(): ActionResult Open add workflow dialog
---@field runWorkflow fun(id: string): ActionResult Execute workflow

---@class LayoutModule
---@field render fun(ctx: RenderContext): UIComponent Main layout renderer
---@field tabs fun(): UIComponent Tab navigation component

return {}
