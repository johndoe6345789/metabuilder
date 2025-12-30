---@meta
-- Type definitions for social_hub package

---@class Post
---@field id string Post ID
---@field author string Author name
---@field avatar? string Author avatar URL
---@field content string Post content
---@field created_at string Timestamp
---@field likes? number Like count
---@field comments? number Comment count

---@class PostComponent
---@field type string Component type
---@field props PostProps Component properties

---@class PostProps
---@field id string
---@field author string
---@field avatar? string
---@field content string
---@field timestamp string
---@field likes number
---@field comments number

---@class FeedComponent
---@field type string Component type
---@field children PostComponent[] Post components

---@class EmptyStateComponent
---@field type string Component type
---@field props EmptyStateProps Component properties

---@class EmptyStateProps
---@field icon string Icon name
---@field title string Title text
---@field message string Message text

---@class ComposerComponent
---@field type string Component type
---@field children table[] Child components

---@class ValidationResult
---@field valid boolean Whether validation passed
---@field error? string Error message if invalid

---@class SubmitAction
---@field action string Action type
---@field data SubmitData Action data

---@class SubmitData
---@field content string Post content
---@field media string[] Media URLs

---@class StatCardComponent
---@field type string Component type
---@field props StatCardProps Component properties

---@class StatCardProps
---@field label string Stat label
---@field value number Stat value
---@field icon string Icon name

---@class StatsGridComponent
---@field type string Component type
---@field columns number Grid columns
---@field children StatCardComponent[] Stat cards

---@class User
---@field id string User ID
---@field name string Display name
---@field avatar? string Avatar URL
---@field bio? string User bio

---@class HeroSectionComponent
---@field type string Component type
---@field children table[] Child components

---@class FeedPostConfig
---@field type string
---@field author string
---@field content string
---@field timestamp string
---@field actions string[]

---@class FeedListConfig
---@field type string
---@field layout string
---@field children FeedPostConfig[]

return {}
