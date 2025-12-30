---@meta
-- Type definitions for social_hub package
-- Provides types for social feeds, posts, comments, and user interactions

--------------------------------------------------------------------------------
-- Enums and Aliases
--------------------------------------------------------------------------------

---@alias PostStatus
---| "draft" Post is a draft
---| "published" Post is published
---| "archived" Post is archived
---| "deleted" Post is deleted (soft delete)

---@alias MediaType
---| "image" Image attachment
---| "video" Video attachment
---| "audio" Audio attachment
---| "link" External link preview
---| "embed" Embedded content

---@alias ReactionType
---| "like" Like reaction
---| "love" Love reaction
---| "laugh" Laugh reaction
---| "wow" Wow reaction
---| "sad" Sad reaction
---| "angry" Angry reaction

---@alias FeedSortOrder
---| "recent" Most recent first
---| "popular" Most popular first
---| "trending" Trending posts
---| "relevance" Personalized relevance

---@alias ContentVisibility
---| "public" Visible to everyone
---| "followers" Visible to followers only
---| "private" Visible only to author
---| "mentioned" Visible to mentioned users

--------------------------------------------------------------------------------
-- User Types
--------------------------------------------------------------------------------

---@class User
---@field id string User ID (UUID)
---@field name string Display name
---@field username string Unique username handle
---@field avatar? string Avatar URL
---@field bio? string User biography
---@field verified? boolean Whether user is verified
---@field follower_count? number Number of followers
---@field following_count? number Number following
---@field post_count? number Total posts
---@field joined_at? string ISO timestamp of account creation

---@class UserMention
---@field user_id string Mentioned user ID
---@field username string Mentioned username
---@field start_index number Start position in content
---@field end_index number End position in content

--------------------------------------------------------------------------------
-- Post Types
--------------------------------------------------------------------------------

---@class Post
---@field id string Post ID (UUID)
---@field author_id string Author user ID
---@field author string Author display name
---@field author_username? string Author username handle
---@field avatar? string Author avatar URL
---@field content string Post text content
---@field status PostStatus Post status
---@field visibility ContentVisibility Content visibility
---@field created_at string ISO timestamp of creation
---@field updated_at? string ISO timestamp of last edit
---@field likes number Like count
---@field comments number Comment count
---@field shares? number Share/repost count
---@field reactions? ReactionCounts Reaction breakdown
---@field media? MediaAttachment[] Media attachments
---@field mentions? UserMention[] User mentions in content
---@field hashtags? string[] Hashtags in content
---@field parent_id? string Parent post ID (for replies/reposts)
---@field thread_id? string Thread root post ID

---@class ReactionCounts
---@field like number Like count
---@field love number Love count
---@field laugh number Laugh count
---@field wow number Wow count
---@field sad number Sad count
---@field angry number Angry count
---@field total number Total reactions

---@class MediaAttachment
---@field id string Media ID
---@field type MediaType Media type
---@field url string Media URL
---@field thumbnail_url? string Thumbnail URL (for video)
---@field alt_text? string Accessibility text
---@field width? number Width in pixels
---@field height? number Height in pixels
---@field duration? number Duration in seconds (for video/audio)
---@field mime_type? string MIME type

---@class Comment
---@field id string Comment ID
---@field post_id string Parent post ID
---@field author_id string Author user ID
---@field author string Author display name
---@field avatar? string Author avatar URL
---@field content string Comment text
---@field created_at string ISO timestamp
---@field updated_at? string ISO timestamp if edited
---@field likes number Like count
---@field replies? number Reply count
---@field parent_comment_id? string Parent comment ID (for nested replies)

--------------------------------------------------------------------------------
-- Feed and Filter Types
--------------------------------------------------------------------------------

---@class FeedFilter
---@field author_id? string Filter by author
---@field hashtag? string Filter by hashtag
---@field has_media? boolean Filter posts with media
---@field media_type? MediaType Filter by media type
---@field min_likes? number Minimum like count
---@field min_comments? number Minimum comment count
---@field visibility? ContentVisibility Filter by visibility
---@field created_after? string Filter by creation date
---@field created_before? string Filter by creation date

---@class FeedPagination
---@field cursor? string Cursor for pagination
---@field limit number Items per page (max 50)
---@field sort FeedSortOrder Sort order

---@class FeedOptions
---@field filter? FeedFilter Filter criteria
---@field pagination? FeedPagination Pagination options
---@field include_replies? boolean Include reply posts
---@field include_reposts? boolean Include reposts

---@class PaginatedFeed
---@field posts Post[] Posts for current page
---@field next_cursor? string Cursor for next page
---@field has_more boolean Whether more posts exist
---@field total? number Total matching posts (if available)

--------------------------------------------------------------------------------
-- Action Types
--------------------------------------------------------------------------------

---@class PostCreateData
---@field content string Post content (max 5000 chars)
---@field visibility? ContentVisibility Visibility setting
---@field media? MediaUploadData[] Media to attach
---@field mentions? string[] User IDs to mention
---@field parent_id? string Parent post ID (for replies)

---@class MediaUploadData
---@field file_data string Base64 encoded file or URL
---@field type MediaType Media type
---@field alt_text? string Accessibility text

---@class PostUpdateData
---@field content? string New content
---@field visibility? ContentVisibility New visibility
---@field add_media? MediaUploadData[] Media to add
---@field remove_media? string[] Media IDs to remove

---@class CommentCreateData
---@field post_id string Post to comment on
---@field content string Comment content (max 1000 chars)
---@field parent_comment_id? string Parent comment (for nested replies)

---@class ReactionData
---@field post_id string Post to react to
---@field reaction_type ReactionType Type of reaction
---@field remove? boolean Remove existing reaction

--------------------------------------------------------------------------------
-- Result Types
--------------------------------------------------------------------------------

---@class PostActionResult
---@field success boolean Whether action succeeded
---@field post? Post Created/updated post
---@field error? string Error message
---@field code? string Error code

---@class CommentActionResult
---@field success boolean Whether action succeeded
---@field comment? Comment Created/updated comment
---@field error? string Error message

---@class ReactionResult
---@field success boolean Whether action succeeded
---@field new_counts ReactionCounts Updated reaction counts
---@field user_reaction? ReactionType User's current reaction

---@class MediaUploadResult
---@field success boolean Whether upload succeeded
---@field media? MediaAttachment Uploaded media info
---@field error? string Error message

---@class ValidationResult
---@field valid boolean Whether validation passed
---@field error? string Error message if invalid
---@field field? string Field that failed validation

--------------------------------------------------------------------------------
-- Component Types
--------------------------------------------------------------------------------

---@class PostComponent
---@field type "Post" Component type
---@field props PostProps Component properties

---@class PostProps
---@field id string Post ID
---@field author string Author display name
---@field avatar? string Author avatar URL
---@field content string Post content
---@field timestamp string Formatted timestamp
---@field likes number Like count
---@field comments number Comment count
---@field media? MediaAttachment[] Media attachments
---@field actions string[] Available actions
---@field user_liked? boolean Whether current user liked

---@class FeedComponent
---@field type "Stack" Component type
---@field props FeedProps Component properties
---@field children PostComponent[] Post components

---@class FeedProps
---@field spacing number Spacing between posts
---@field loading? boolean Whether loading more

---@class ComposerComponent
---@field type "Card" Component type
---@field props ComposerProps Component properties
---@field children table[] Child components

---@class ComposerProps
---@field placeholder string Input placeholder text
---@field max_length number Maximum content length
---@field allow_media boolean Whether media upload allowed
---@field submit_label string Submit button text

---@class EmptyStateComponent
---@field type "Box" Component type
---@field props EmptyStateProps Component properties

---@class EmptyStateProps
---@field icon string Icon name
---@field title string Title text
---@field message string Message text
---@field action? string Action button text

---@class StatCardComponent
---@field type "Card" Component type
---@field props StatCardProps Component properties

---@class StatCardProps
---@field label string Stat label
---@field value number|string Stat value
---@field icon string Icon name
---@field trend? "up"|"down"|"neutral" Trend direction

---@class StatsGridComponent
---@field type "Grid" Component type
---@field props StatsGridProps Component properties
---@field children StatCardComponent[] Stat cards

---@class StatsGridProps
---@field columns number Grid columns
---@field spacing number Grid spacing

---@class HeroSectionComponent
---@field type "Box" Component type
---@field props HeroProps Component properties
---@field children table[] Child components

---@class HeroProps
---@field background? string Background image URL
---@field overlay? boolean Show gradient overlay

---@class SubmitAction
---@field action "submit_post" Action type
---@field data SubmitData Action data

---@class SubmitData
---@field content string Post content
---@field media string[] Media URLs
---@field visibility? ContentVisibility Visibility setting

--------------------------------------------------------------------------------
-- Module Interface
--------------------------------------------------------------------------------

---@class SocialHubModule
---@field get_feed fun(options?: FeedOptions): PaginatedFeed Get feed posts
---@field get_post fun(id: string): Post|nil Get single post by ID
---@field create_post fun(data: PostCreateData): PostActionResult Create a new post
---@field update_post fun(id: string, data: PostUpdateData): PostActionResult Update a post
---@field delete_post fun(id: string): PostActionResult Delete a post (soft delete)
---@field get_comments fun(post_id: string, cursor?: string): Comment[] Get comments for a post
---@field create_comment fun(data: CommentCreateData): CommentActionResult Create a comment
---@field delete_comment fun(id: string): CommentActionResult Delete a comment
---@field react fun(data: ReactionData): ReactionResult Add/remove reaction
---@field upload_media fun(data: MediaUploadData): MediaUploadResult Upload media file
---@field validate_post fun(data: PostCreateData): ValidationResult Validate post data
---@field validate_comment fun(data: CommentCreateData): ValidationResult Validate comment data
---@field get_user_profile fun(user_id: string): User|nil Get user profile
---@field follow fun(user_id: string): boolean Follow a user
---@field unfollow fun(user_id: string): boolean Unfollow a user
---@field get_user_stats fun(user_id: string): UserStats Get user statistics
---@field build_feed_component fun(posts: Post[]): FeedComponent Build feed UI config
---@field build_composer fun(): ComposerComponent Build composer UI config
---@field build_empty_state fun(type: string): EmptyStateComponent Build empty state UI

---@class UserStats
---@field posts_today number Posts created today
---@field posts_this_week number Posts this week
---@field engagement_rate number Engagement rate percentage
---@field top_post_id? string ID of most popular post

---@class FeedPostConfig
---@field type string Component type
---@field author string Author name
---@field content string Post content
---@field timestamp string Formatted time
---@field actions string[] Available actions

---@class FeedListConfig
---@field type string Component type
---@field layout string Layout type
---@field children FeedPostConfig[] Child post configs

return {}
