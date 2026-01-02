-- Type definitions for ui_dialogs package
-- Central types for dialog components
-- @meta

---@alias DialogType "alert"|"confirm"|"prompt"|"custom"

---@alias DialogSize "xs"|"sm"|"md"|"lg"|"xl"|"fullscreen"

---@alias DialogSeverity "info"|"success"|"warning"|"error"

---@class DialogButton
---@field label string Button label
---@field variant? "text"|"outlined"|"contained" Button variant
---@field color? "primary"|"secondary"|"error"|"warning"|"info"|"success" Button color
---@field onClick fun(): void Click handler
---@field autoFocus? boolean Auto-focus this button
---@field disabled? boolean Whether button is disabled

---@class AlertDialogProps
---@field open boolean Whether dialog is open
---@field title string Dialog title
---@field message string Alert message
---@field severity? DialogSeverity Alert severity
---@field confirmLabel? string Confirm button label
---@field onClose fun(): void Close callback
---@field onConfirm fun(): void Confirm callback

---@class ConfirmDialogProps
---@field open boolean Whether dialog is open
---@field title string Dialog title
---@field message string Confirmation message
---@field confirmLabel? string Confirm button label
---@field cancelLabel? string Cancel button label
---@field severity? DialogSeverity Dialog severity
---@field onClose fun(): void Close callback
---@field onConfirm fun(): void Confirm callback
---@field onCancel fun(): void Cancel callback

---@class PromptDialogProps
---@field open boolean Whether dialog is open
---@field title string Dialog title
---@field message string Prompt message
---@field placeholder? string Input placeholder
---@field defaultValue? string Default input value
---@field inputType? "text"|"password"|"email"|"number" Input type
---@field confirmLabel? string Confirm button label
---@field cancelLabel? string Cancel button label
---@field validation? fun(value: string): string|nil Validation function
---@field onClose fun(): void Close callback
---@field onConfirm fun(value: string): void Confirm callback
---@field onCancel fun(): void Cancel callback

---@class CustomDialogProps
---@field open boolean Whether dialog is open
---@field title? string Dialog title
---@field size? DialogSize Dialog size
---@field fullWidth? boolean Full width dialog
---@field hideCloseButton? boolean Hide close button
---@field disableBackdropClick? boolean Disable closing on backdrop click
---@field disableEscapeKey? boolean Disable closing on Escape key
---@field actions? DialogButton[] Dialog action buttons
---@field children UIComponent[] Dialog content
---@field onClose fun(): void Close callback

---@class DialogState
---@field type DialogType Dialog type
---@field open boolean Whether dialog is open
---@field props table Dialog props

---@class DialogManager
---@field alert fun(props: AlertDialogProps): void Show alert dialog
---@field confirm fun(props: ConfirmDialogProps): Promise<boolean> Show confirm dialog
---@field prompt fun(props: PromptDialogProps): Promise<string|nil> Show prompt dialog
---@field custom fun(props: CustomDialogProps): void Show custom dialog
---@field close fun(): void Close current dialog

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? UIComponent[] Child components

-- Export all types (no runtime exports, types only)
return {}
