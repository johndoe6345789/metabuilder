---@meta
-- Type definitions for notification_center package
-- Provides types for notifications, toasts, and notification management

--------------------------------------------------------------------------------
-- Enums and Aliases
--------------------------------------------------------------------------------

---@alias NotificationSeverity
---| "info" Informational notification
---| "success" Success notification
---| "warning" Warning notification
---| "error" Error notification

---@alias NotificationPriority
---| "low" Low priority (background)
---| "normal" Normal priority (default)
---| "high" High priority (important)
---| "urgent" Urgent (requires immediate attention)

---@alias NotificationCategory
---| "system" System notifications
---| "security" Security alerts
---| "social" Social interactions
---| "activity" User activity
---| "marketing" Marketing/promotional
---| "updates" App updates

---@alias ToastPosition
---| "top-left" Top left corner
---| "top-center" Top center
---| "top-right" Top right corner
---| "bottom-left" Bottom left corner
---| "bottom-center" Bottom center
---| "bottom-right" Bottom right corner

---@alias DeliveryChannel
---| "in_app" In-app notification
---| "email" Email notification
---| "push" Push notification
---| "sms" SMS notification

--------------------------------------------------------------------------------
-- Core Notification Types
--------------------------------------------------------------------------------

---@class Notification
---@field id string|number Unique notification ID
---@field title string Title text
---@field message string Message content
---@field severity NotificationSeverity Severity level
---@field priority NotificationPriority Priority level
---@field category NotificationCategory Notification category
---@field created_at string|number Creation timestamp (ISO or Unix)
---@field read boolean Whether notification has been read
---@field seen boolean Whether notification has been seen
---@field dismissed boolean Whether notification was dismissed
---@field icon? string Icon name
---@field image? string Image URL (for rich notifications)
---@field action_url? string URL to navigate to on click
---@field action_label? string Action button label
---@field metadata? table<string, any> Additional custom data
---@field expires_at? string|number Expiration timestamp
---@field source? string Source system/package

---@class NotificationGroup
---@field id string Group identifier
---@field title string Group title
---@field notifications Notification[] Notifications in group
---@field count number Total notifications
---@field unread_count number Unread notifications
---@field latest_at string|number Latest notification timestamp

--------------------------------------------------------------------------------
-- Toast Types
--------------------------------------------------------------------------------

---@class Toast
---@field type "toast" Component type
---@field variant NotificationSeverity Toast severity
---@field message string Toast message
---@field title? string Optional toast title
---@field duration number Display duration in ms (0 = persistent)
---@field icon? string Icon name
---@field action? ToastAction Optional action button
---@field dismissable boolean Whether user can dismiss
---@field position ToastPosition Screen position

---@class ToastAction
---@field label string Action button label
---@field action string Action identifier
---@field data? table Action payload

---@class ToastConfig
---@field message string Toast message
---@field title? string Optional title
---@field severity? NotificationSeverity Severity (default: info)
---@field duration? number Duration in ms (default: 5000)
---@field position? ToastPosition Position (default: bottom-right)
---@field dismissable? boolean Allow dismiss (default: true)
---@field action? ToastAction Optional action

--------------------------------------------------------------------------------
-- Filter and Query Types
--------------------------------------------------------------------------------

---@class NotificationFilter
---@field severity? NotificationSeverity|NotificationSeverity[] Filter by severity
---@field category? NotificationCategory|NotificationCategory[] Filter by category
---@field priority? NotificationPriority Filter by minimum priority
---@field read? boolean Filter by read status
---@field seen? boolean Filter by seen status
---@field dismissed? boolean Filter by dismissed status
---@field created_after? string|number Filter by creation date
---@field created_before? string|number Filter by creation date
---@field source? string Filter by source system

---@class NotificationPagination
---@field cursor? string Pagination cursor
---@field limit number Items per page (max 100)
---@field sort_order? "asc"|"desc" Sort order (default: desc)

---@class NotificationQuery
---@field filter? NotificationFilter Filter criteria
---@field pagination? NotificationPagination Pagination options
---@field group_by? "category"|"date"|"source" Group results

---@class PaginatedNotifications
---@field notifications Notification[] Notifications for current page
---@field groups? NotificationGroup[] Grouped notifications (if group_by set)
---@field total number Total matching notifications
---@field unread_count number Total unread
---@field next_cursor? string Cursor for next page
---@field has_more boolean Whether more exist

--------------------------------------------------------------------------------
-- Action Types
--------------------------------------------------------------------------------

---@class CreateNotificationData
---@field title string Title text
---@field message string Message content
---@field severity? NotificationSeverity Severity (default: info)
---@field priority? NotificationPriority Priority (default: normal)
---@field category? NotificationCategory Category
---@field icon? string Icon name
---@field action_url? string Action URL
---@field action_label? string Action label
---@field channels? DeliveryChannel[] Delivery channels
---@field user_ids? string[] Target user IDs (for targeted notifications)
---@field expires_at? string|number Expiration time
---@field metadata? table<string, any> Custom metadata

---@class NotificationActionResult
---@field success boolean Whether action succeeded
---@field notification? Notification Affected notification
---@field error? string Error message

---@class BulkActionResult
---@field success boolean Whether all actions succeeded
---@field affected_count number Number of affected notifications
---@field errors? BulkActionError[] Individual errors

---@class BulkActionError
---@field notification_id string|number Notification ID
---@field error string Error message

---@class MarkReadOptions
---@field notification_ids? string[]|number[] Specific IDs to mark
---@field filter? NotificationFilter Mark all matching filter
---@field mark_all boolean Mark all notifications

--------------------------------------------------------------------------------
-- Summary Types
--------------------------------------------------------------------------------

---@class SummaryItem
---@field label string Item label
---@field count number Item count
---@field severity? NotificationSeverity Severity level
---@field hint? string Hint/tooltip text
---@field icon? string Icon name

---@class EnrichedSummaryItem
---@field label string Item label
---@field count number Item count
---@field severity NotificationSeverity Severity level
---@field hint? string Hint text
---@field classes string CSS classes
---@field percentage? number Percentage of total

---@class SummaryProps
---@field title? string Summary title
---@field subtitle? string Summary subtitle
---@field totalLabel? string Total label
---@field items? SummaryItem[] Summary items
---@field show_icons? boolean Show item icons

---@class SummaryData
---@field title string Summary title
---@field subtitle? string Subtitle text
---@field totalLabel string Total label
---@field total number Total count
---@field items EnrichedSummaryItem[] Enriched items
---@field by_severity table<NotificationSeverity, number> Counts by severity
---@field by_category table<NotificationCategory, number> Counts by category

---@class NotificationStats
---@field total number Total notifications
---@field unread number Unread count
---@field by_severity table<NotificationSeverity, number> By severity
---@field by_category table<NotificationCategory, number> By category
---@field today number Created today
---@field this_week number Created this week

--------------------------------------------------------------------------------
-- Component Types
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type
---@field props? table Component props
---@field children? table[] Child components
---@field content? string Text content
---@field variant? string Variant name

---@class NotificationItemComponent
---@field type "notification_item" Component type
---@field props NotificationItemProps Component properties

---@class NotificationItemProps
---@field id string|number Notification ID
---@field title string Title text
---@field message string Message text
---@field time string|number Timestamp (formatted or raw)
---@field read boolean Read status
---@field icon string Icon name
---@field severity NotificationSeverity Severity
---@field action_url? string Click action URL
---@field on_dismiss? string Dismiss handler ID

---@class NotificationListComponent
---@field type "notification_list" Component type
---@field props? NotificationListProps List properties
---@field children NotificationItemComponent[] Notification items

---@class NotificationListProps
---@field empty_message? string Message when empty
---@field loading? boolean Whether loading
---@field grouped? boolean Whether items are grouped

---@class BadgeComponent
---@field type "badge" Component type
---@field content string Badge content
---@field variant NotificationSeverity Badge variant
---@field max? number Max value (shows "99+" if exceeded)

---@class NotificationBellComponent
---@field type "notification_bell" Component type
---@field props NotificationBellProps Bell properties

---@class NotificationBellProps
---@field unread_count number Unread count
---@field show_badge boolean Whether to show badge
---@field animate boolean Whether to animate on new

--------------------------------------------------------------------------------
-- Preference Types
--------------------------------------------------------------------------------

---@class NotificationPreferences
---@field enabled boolean Master enable/disable
---@field channels table<DeliveryChannel, boolean> Enabled channels
---@field categories table<NotificationCategory, CategoryPreference> Per-category settings
---@field quiet_hours? QuietHours Quiet hours settings
---@field digest_enabled boolean Enable daily digest
---@field digest_time? string Time for digest (HH:MM)

---@class CategoryPreference
---@field enabled boolean Category enabled
---@field channels DeliveryChannel[] Channels for this category
---@field priority_threshold NotificationPriority Min priority

---@class QuietHours
---@field enabled boolean Whether quiet hours enabled
---@field start string Start time (HH:MM)
---@field end_time string End time (HH:MM)
---@field allow_urgent boolean Allow urgent during quiet

--------------------------------------------------------------------------------
-- Module Interface
--------------------------------------------------------------------------------

---@class NotificationCenterModule
---@field list fun(query?: NotificationQuery): PaginatedNotifications List notifications
---@field get fun(id: string|number): Notification|nil Get notification by ID
---@field create fun(data: CreateNotificationData): NotificationActionResult Create notification
---@field mark_read fun(options: MarkReadOptions): BulkActionResult Mark as read
---@field mark_unread fun(ids: string[]|number[]): BulkActionResult Mark as unread
---@field dismiss fun(id: string|number): NotificationActionResult Dismiss notification
---@field dismiss_all fun(filter?: NotificationFilter): BulkActionResult Dismiss all matching
---@field delete fun(id: string|number): NotificationActionResult Delete notification
---@field delete_all fun(filter?: NotificationFilter): BulkActionResult Delete all matching
---@field get_stats fun(): NotificationStats Get notification statistics
---@field get_summary fun(props?: SummaryProps): SummaryData Get formatted summary
---@field get_preferences fun(): NotificationPreferences Get user preferences
---@field update_preferences fun(prefs: NotificationPreferences): boolean Update preferences
---@field show_toast fun(config: ToastConfig): Toast Show a toast notification
---@field build_list fun(notifications: Notification[]): NotificationListComponent Build list component
---@field build_bell fun(unread: number): NotificationBellComponent Build bell icon component
---@field build_badge fun(count: number, severity?: NotificationSeverity): BadgeComponent Build badge
---@field subscribe fun(callback: fun(n: Notification)) Subscribe to new notifications
---@field unsubscribe fun(callback: fun(n: Notification)) Unsubscribe from notifications

---@class NotificationCenterInfo
---@field name string Package name
---@field version string Package version
---@field loaded boolean Whether package is loaded

return {}
