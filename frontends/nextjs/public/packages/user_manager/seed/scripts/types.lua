---@meta
-- Type definitions for user_manager package
-- Provides types for user CRUD operations, filtering, and bulk actions

--------------------------------------------------------------------------------
-- Enums and Aliases
--------------------------------------------------------------------------------

---@alias UserLevel 1|2|3|4|5|6 Access level (Public to Supergod)
---@alias UserActionType
---| "create" Create a new user
---| "update" Update an existing user
---| "delete" Delete a user
---| "activate" Activate a user account
---| "deactivate" Deactivate a user account
---| "promote" Increase user level
---| "demote" Decrease user level
---| "reset_password" Reset user password
---| "bulk_delete" Delete multiple users
---| "bulk_activate" Activate multiple users
---| "bulk_deactivate" Deactivate multiple users

---@alias SortDirection "asc" | "desc"
---@alias UserSortField "username" | "email" | "level" | "created_at" | "updated_at"

--------------------------------------------------------------------------------
-- Core Data Types
--------------------------------------------------------------------------------

---@class User
---@field id string Unique user identifier (UUID)
---@field username string Username (unique, 3-50 chars)
---@field email string Email address (unique)
---@field role string User role name
---@field level UserLevel Access level (1=Public, 6=Supergod)
---@field active boolean Whether user account is active
---@field created_at? string ISO timestamp of creation
---@field updated_at? string ISO timestamp of last update
---@field last_login? string ISO timestamp of last login

---@class UserAction
---@field action UserActionType Action type to perform
---@field user_id? string Target user ID (required for single-user actions)
---@field user_ids? string[] Target user IDs (for bulk actions)
---@field data? UserCreateData|UserUpdateData Action payload data
---@field confirm? boolean Whether action requires user confirmation
---@field level? UserLevel Target access level (for promote/demote)
---@field active? boolean Target active status

--------------------------------------------------------------------------------
-- Filter and Pagination Types
--------------------------------------------------------------------------------

---@class UserFilter
---@field search? string Search term (matches username or email)
---@field level? UserLevel Filter by exact level
---@field min_level? UserLevel Filter by minimum level
---@field max_level? UserLevel Filter by maximum level
---@field active? boolean Filter by active status
---@field role? string Filter by role name
---@field created_after? string Filter users created after ISO date
---@field created_before? string Filter users created before ISO date

---@class UserSort
---@field field UserSortField Field to sort by
---@field direction SortDirection Sort direction

---@class UserPagination
---@field page number Current page (1-indexed)
---@field page_size number Items per page (default 20, max 100)

---@class UserListOptions
---@field filter? UserFilter Filter criteria
---@field sort? UserSort Sort options
---@field pagination? UserPagination Pagination options

--------------------------------------------------------------------------------
-- CRUD Operation Types
--------------------------------------------------------------------------------

---@class UserCreateData
---@field username string Username (3-50 chars, alphanumeric + underscore)
---@field email string Valid email address
---@field password string Password (min 8 chars)
---@field level? UserLevel Initial access level (default 1)
---@field role? string Initial role name
---@field active? boolean Initial active status (default true)

---@class UserUpdateData
---@field username? string New username
---@field email? string New email
---@field password? string New password
---@field level? UserLevel New access level
---@field role? string New role name
---@field active? boolean New active status

---@class UserActionResult
---@field success boolean Whether action succeeded
---@field user? User Updated/created user (on success)
---@field error? string Error message (on failure)
---@field code? string Error code for programmatic handling

---@class BulkActionResult
---@field success boolean Whether all actions succeeded
---@field total number Total items processed
---@field succeeded number Number of successful operations
---@field failed number Number of failed operations
---@field errors? BulkActionError[] Individual errors (if any)

---@class BulkActionError
---@field user_id string User ID that failed
---@field error string Error message
---@field code? string Error code

--------------------------------------------------------------------------------
-- Paginated Response Types
--------------------------------------------------------------------------------

---@class PaginatedUsers
---@field items User[] User records for current page
---@field total number Total matching users
---@field page number Current page number
---@field page_size number Items per page
---@field total_pages number Total number of pages
---@field has_next boolean Whether more pages exist
---@field has_prev boolean Whether previous pages exist

--------------------------------------------------------------------------------
-- Table Component Types
--------------------------------------------------------------------------------

---@class TableColumn
---@field id string Column identifier
---@field label string Column header label
---@field sortable? boolean Whether column is sortable
---@field type? "text"|"badge"|"actions"|"date"|"level" Column type
---@field width? string Column width (CSS value)
---@field align? "left"|"center"|"right" Text alignment

---@class TableRow
---@field id string Row identifier (user ID)
---@field username string Username display
---@field email string Email display
---@field role string Role badge text
---@field level number Access level number
---@field level_label string Access level label
---@field active string Status badge text ("Active"/"Inactive")
---@field actions string[] Available action buttons
---@field created_at? string Formatted creation date

---@class DataTableConfig
---@field type "DataTable" Component type
---@field columns TableColumn[] Column definitions
---@field rows TableRow[] Row data
---@field sortable? boolean Enable sorting
---@field selectable? boolean Enable row selection
---@field pagination? TablePaginationConfig Pagination config

---@class TablePaginationConfig
---@field enabled boolean Enable pagination
---@field page number Current page
---@field page_size number Items per page
---@field total number Total items

--------------------------------------------------------------------------------
-- Module Interface
--------------------------------------------------------------------------------

---@class UserManagerModule
---@field list fun(options?: UserListOptions): PaginatedUsers List users with filtering/sorting/pagination
---@field get fun(id: string): UserActionResult Get a single user by ID
---@field create fun(data: UserCreateData): UserActionResult Create a new user
---@field update fun(id: string, data: UserUpdateData): UserActionResult Update an existing user
---@field delete fun(id: string): UserActionResult Delete a user
---@field activate fun(id: string): UserActionResult Activate a user account
---@field deactivate fun(id: string): UserActionResult Deactivate a user account
---@field promote fun(id: string, level?: UserLevel): UserActionResult Increase user level
---@field demote fun(id: string, level?: UserLevel): UserActionResult Decrease user level
---@field reset_password fun(id: string): UserActionResult Send password reset
---@field bulk_delete fun(ids: string[]): BulkActionResult Delete multiple users
---@field bulk_activate fun(ids: string[]): BulkActionResult Activate multiple users
---@field bulk_deactivate fun(ids: string[]): BulkActionResult Deactivate multiple users
---@field build_table fun(users: User[], options?: TableBuildOptions): DataTableConfig Build table config from users
---@field validate_create fun(data: UserCreateData): ValidationResult Validate creation data
---@field validate_update fun(data: UserUpdateData): ValidationResult Validate update data

---@class TableBuildOptions
---@field show_actions? boolean Include action buttons
---@field selectable? boolean Enable row selection
---@field columns? string[] Specific columns to include

---@class ValidationResult
---@field valid boolean Whether validation passed
---@field errors? ValidationError[] Validation errors

---@class ValidationError
---@field field string Field name with error
---@field message string Error message
---@field code string Error code

return {}
