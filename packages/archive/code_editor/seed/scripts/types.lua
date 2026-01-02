-- LuaCATS type definitions for code_editor package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Editor Types
--------------------------------------------------------------------------------

---@alias EditorLanguage "lua"|"json"|"javascript"|"typescript"|"html"|"css"|"yaml"|"markdown"|"sql"

---@class EditorOptions
---@field language? EditorLanguage Code language
---@field read_only? boolean Disable editing
---@field line_numbers? boolean Show line numbers
---@field word_wrap? boolean Enable word wrap
---@field minimap? boolean Show minimap
---@field theme? "dark"|"light" Editor theme
---@field font_size? number Font size in pixels
---@field tab_size? number Tab width in spaces
---@field show_snippets? boolean Show snippet suggestions

---@class EditorState
---@field value string Current editor content
---@field language EditorLanguage Active language
---@field cursorPosition CursorPosition Cursor location
---@field selection? Selection Selected text range
---@field dirty boolean Has unsaved changes

---@class CursorPosition
---@field line number Line number (1-indexed)
---@field column number Column number (1-indexed)

---@class Selection
---@field startLine number Start line
---@field startColumn number Start column
---@field endLine number End line
---@field endColumn number End column

--------------------------------------------------------------------------------
-- Validation Types
--------------------------------------------------------------------------------

---@class ValidationResult
---@field valid boolean Is code valid
---@field errors ValidationError[] Syntax errors
---@field warnings ValidationWarning[] Warnings

---@class ValidationError
---@field line number Error line
---@field column number Error column
---@field message string Error message
---@field severity "error" Severity level

---@class ValidationWarning
---@field line number Warning line
---@field column number Warning column
---@field message string Warning message
---@field severity "warning" Severity level

--------------------------------------------------------------------------------
-- Execution Types
--------------------------------------------------------------------------------

---@class SandboxAction
---@field action "execute"|"validate"|"format" Action type
---@field sandbox boolean Run in sandbox
---@field context table<string, any> Execution context

---@class ExecutionResult
---@field success boolean Execution succeeded
---@field output? any Return value
---@field error? string Error message
---@field logs string[] Console output
---@field executionTime number Time in milliseconds

--------------------------------------------------------------------------------
-- Theme Types
--------------------------------------------------------------------------------

---@class EditorTheme
---@field name string Theme name
---@field type "dark"|"light" Theme type
---@field colors ThemeColors Color palette

---@class ThemeColors
---@field background string Background color
---@field foreground string Text color
---@field lineNumbers string Line number color
---@field selection string Selection highlight
---@field cursor string Cursor color
---@field keywords string Keyword color
---@field strings string String color
---@field comments string Comment color
---@field numbers string Number color
---@field functions string Function color

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

--------------------------------------------------------------------------------
-- Editor Modules
--------------------------------------------------------------------------------

---@class LuaEditorModule
---@field render fun(value?: string, options?: EditorOptions): UIComponent Render Lua editor
---@field validate fun(lua_code: string): ValidationResult Validate Lua syntax
---@field run_sandbox fun(lua_code: string, context?: table): SandboxAction Execute in sandbox

---@class JsonEditorModule
---@field render fun(value?: string, options?: EditorOptions): UIComponent Render JSON editor
---@field validate fun(json_code: string): ValidationResult Validate JSON syntax
---@field format fun(json_code: string, indent?: number): string Format JSON

---@class ThemeModule
---@field getTheme fun(name: string): EditorTheme Get theme by name
---@field listThemes fun(): string[] List available themes
---@field applyTheme fun(theme: EditorTheme): boolean Apply theme to editor

return {}
