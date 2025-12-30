-- LuaCATS type definitions for dbal_demo package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Connection Types
--------------------------------------------------------------------------------

---@class ConnectResult
---@field success boolean Whether connection succeeded
---@field endpoint? string The endpoint connected to
---@field api_key? string Masked API key or status
---@field timestamp? string Connection timestamp
---@field message string Status message
---@field error? string Error message if failed

---@class DisconnectResult
---@field success boolean Whether disconnection succeeded
---@field message string Status message

---@class ConnectionStatus
---@field status "connected"|"disconnected" Current status
---@field is_connected boolean Whether currently connected

---@class LogsResult
---@field logs string[] Array of log entries
---@field count number Number of log entries

---@class ClearLogsResult
---@field success boolean Whether logs were cleared
---@field message string Status message

---@class LogEntryResult
---@field success boolean Whether log was added
---@field entry string The formatted log entry

--------------------------------------------------------------------------------
-- Key-Value Operations
--------------------------------------------------------------------------------

---@class KvGetResult
---@field success boolean Operation succeeded
---@field key string Key that was read
---@field value? any Retrieved value
---@field error? string Error message

---@class KvSetResult
---@field success boolean Operation succeeded
---@field key string Key that was set
---@field value any Value that was stored
---@field error? string Error message

---@class KvDeleteResult
---@field success boolean Operation succeeded
---@field key string Key that was deleted
---@field error? string Error message

---@class KvListResult
---@field success boolean Operation succeeded
---@field keys string[] List of keys
---@field count number Number of keys
---@field error? string Error message

--------------------------------------------------------------------------------
-- Blob Operations
--------------------------------------------------------------------------------

---@class BlobUploadResult
---@field success boolean Upload succeeded
---@field blob_id? string Blob identifier
---@field size? number Blob size in bytes
---@field content_type? string MIME type
---@field error? string Error message

---@class BlobDownloadResult
---@field success boolean Download succeeded
---@field blob_id string Blob identifier
---@field data? string Blob data (base64 encoded)
---@field size? number Blob size
---@field error? string Error message

---@class BlobDeleteResult
---@field success boolean Delete succeeded
---@field blob_id string Deleted blob ID
---@field error? string Error message

---@class BlobMetadata
---@field id string Blob ID
---@field size number Size in bytes
---@field content_type string MIME type
---@field created_at string ISO timestamp
---@field updated_at string ISO timestamp

--------------------------------------------------------------------------------
-- Cache Operations
--------------------------------------------------------------------------------

---@class CacheGetResult
---@field success boolean Operation succeeded
---@field key string Cache key
---@field value? any Cached value
---@field hit boolean Whether cache hit occurred
---@field ttl? number Time to live remaining
---@field error? string Error message

---@class CacheSetResult
---@field success boolean Operation succeeded
---@field key string Cache key
---@field ttl? number Time to live in seconds
---@field error? string Error message

---@class CacheDeleteResult
---@field success boolean Operation succeeded
---@field key string Cache key
---@field error? string Error message

---@class CacheStats
---@field hits number Cache hits
---@field misses number Cache misses
---@field keys number Total keys
---@field memory_used number Memory in bytes

--------------------------------------------------------------------------------
-- DBAL Modules
--------------------------------------------------------------------------------

---@class ConnectionModule
---@field logs string[] Connection logs
---@field status string Current connection status
---@field connect fun(endpoint: string, api_key?: string): ConnectResult
---@field disconnect fun(): DisconnectResult
---@field get_status fun(): ConnectionStatus
---@field get_logs fun(): LogsResult
---@field clear_logs fun(): ClearLogsResult
---@field log fun(message: string): LogEntryResult

---@class KvOperationsModule
---@field get fun(key: string): KvGetResult
---@field set fun(key: string, value: any): KvSetResult
---@field delete fun(key: string): KvDeleteResult
---@field list fun(prefix?: string): KvListResult
---@field exists fun(key: string): boolean

---@class BlobOperationsModule
---@field upload fun(data: string, content_type?: string): BlobUploadResult
---@field download fun(blob_id: string): BlobDownloadResult
---@field delete fun(blob_id: string): BlobDeleteResult
---@field get_metadata fun(blob_id: string): BlobMetadata|nil
---@field list fun(prefix?: string): BlobMetadata[]

---@class CacheOperationsModule
---@field get fun(key: string): CacheGetResult
---@field set fun(key: string, value: any, ttl?: number): CacheSetResult
---@field delete fun(key: string): CacheDeleteResult
---@field clear fun(): boolean
---@field stats fun(): CacheStats

return {}
