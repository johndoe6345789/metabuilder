---@meta
-- Type definitions for notification_center package

---@alias NotificationSeverity "info" | "success" | "warning" | "error"

---@class Notification
---@field id string|number Notification ID
---@field title string Title text
---@field message string Message content
---@field created_at string|number Creation timestamp
---@field read? boolean Whether notification has been read
---@field icon? string Icon name

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? table[] Child components
---@field content? string Text content
---@field variant? string Variant name

---@class NotificationItemComponent
---@field type "notification_item"
---@field props NotificationItemProps

---@class NotificationItemProps
---@field id string|number
---@field title string
---@field message string
---@field time string|number
---@field read boolean
---@field icon string

---@class NotificationListComponent
---@field type "notification_list"
---@field children NotificationItemComponent[]

---@class BadgeComponent
---@field type "badge"
---@field content string
---@field variant string

---@class Toast
---@field type "toast"
---@field variant NotificationSeverity
---@field message string
---@field duration number
---@field icon string

---@class SummaryItem
---@field label string Item label
---@field count? number Item count
---@field severity? NotificationSeverity Severity level
---@field hint? string Hint text

---@class EnrichedSummaryItem
---@field label string
---@field count number
---@field severity NotificationSeverity
---@field hint? string
---@field classes string

---@class SummaryProps
---@field title? string Summary title
---@field subtitle? string Summary subtitle
---@field totalLabel? string Total label
---@field items? SummaryItem[] Summary items

---@class SummaryData
---@field title string
---@field subtitle? string
---@field totalLabel string
---@field total number
---@field items EnrichedSummaryItem[]

---@class NotificationCenterInfo
---@field name string
---@field version string
---@field loaded boolean

return {}
