-- Type definitions for form_builder package
-- Central types file for form construction and validation
-- @meta

---@alias FieldType
---| "text"
---| "email"
---| "password"
---| "number"
---| "textarea"
---| "select"
---| "checkbox"
---| "radio"
---| "date"
---| "datetime"
---| "time"
---| "file"
---| "hidden"
---| "color"
---| "range"
---| "url"
---| "tel"

---@class ValidationRule
---@field type "required"|"minLength"|"maxLength"|"pattern"|"min"|"max"|"email"|"url"|"custom"
---@field value any Rule value (e.g., min length number, regex pattern)
---@field message string Error message when validation fails

---@class FieldOption
---@field value string|number Option value
---@field label string Display label
---@field disabled? boolean Whether option is disabled

---@class FieldDefinition
---@field id string Unique field identifier
---@field name string Field name for form submission
---@field type FieldType Field input type
---@field label string Display label
---@field placeholder? string Placeholder text
---@field defaultValue? any Default field value
---@field required? boolean Whether field is required
---@field disabled? boolean Whether field is disabled
---@field readonly? boolean Whether field is readonly
---@field validation? ValidationRule[] Validation rules
---@field options? FieldOption[] Options for select/radio/checkbox
---@field min? number Minimum value (for number/date)
---@field max? number Maximum value (for number/date)
---@field step? number Step value (for number/range)
---@field rows? number Number of rows (for textarea)
---@field cols? number Number of columns (for textarea)
---@field accept? string Accepted file types (for file)
---@field multiple? boolean Allow multiple values (for select/file)
---@field pattern? string Regex pattern for validation
---@field autoComplete? string Autocomplete hint
---@field helpText? string Help text displayed below field
---@field errorText? string Custom error text

---@class FormSection
---@field id string Section identifier
---@field title string Section title
---@field description? string Section description
---@field fields FieldDefinition[] Fields in this section
---@field collapsible? boolean Whether section can be collapsed
---@field collapsed? boolean Initial collapsed state

---@class FormLayout
---@field columns number Number of columns (1-4)
---@field gap? number Gap between fields in pixels
---@field labelPosition "top"|"left"|"right" Label position
---@field labelWidth? number Label width in pixels (for left/right position)

---@class FormProps
---@field id string Form identifier
---@field title? string Form title
---@field description? string Form description
---@field sections FormSection[] Form sections
---@field layout? FormLayout Layout configuration
---@field submitLabel? string Submit button label
---@field cancelLabel? string Cancel button label
---@field onSubmit fun(data: table): void Submit callback
---@field onCancel? fun(): void Cancel callback
---@field onChange? fun(field: string, value: any): void Change callback
---@field initialValues? table<string, any> Initial field values

---@class ValidationResult
---@field valid boolean Whether validation passed
---@field errors table<string, string> Field errors (fieldId -> errorMessage)

---@class FormState
---@field values table<string, any> Current field values
---@field errors table<string, string> Current field errors
---@field touched table<string, boolean> Fields that have been touched
---@field dirty boolean Whether form has been modified
---@field submitting boolean Whether form is submitting

---@class ContactFormData
---@field name string Contact name
---@field email string Contact email
---@field subject string Message subject
---@field message string Message body
---@field phone? string Optional phone number

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
