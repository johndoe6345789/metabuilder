-- LuaCATS type definitions for ui_pages package
-- See: https://luals.github.io/wiki/annotations/

--------------------------------------------------------------------------------
-- Page Definition Types
--------------------------------------------------------------------------------

---@class PageDefinition
---@field id string Page identifier
---@field path string Route path
---@field title string Page title
---@field description? string Page description
---@field level number Required permission level (1-6)
---@field component UIComponent Root component
---@field meta? PageMeta SEO/meta information
---@field layout? string Layout template name

---@class PageMeta
---@field title? string Browser title
---@field description? string Meta description
---@field keywords? string[] Meta keywords
---@field ogImage? string Open Graph image
---@field noIndex? boolean Hide from search engines

---@class PageRoute
---@field path string Route path
---@field pageId string Associated page ID
---@field exact? boolean Exact match only
---@field redirect? string Redirect destination

--------------------------------------------------------------------------------
-- Page Registry Types
--------------------------------------------------------------------------------

---@class PageRegistry
---@field pages table<string, PageDefinition> Pages by ID
---@field routes PageRoute[] Route definitions
---@field layouts table<string, LayoutDefinition> Available layouts

---@class LayoutDefinition
---@field id string Layout identifier
---@field name string Layout name
---@field regions LayoutRegion[] Layout regions
---@field defaultProps? table Default props

---@class LayoutRegion
---@field id string Region identifier
---@field name string Region name
---@field slot string Slot name for content
---@field required? boolean Content required

--------------------------------------------------------------------------------
-- Page Rendering Types
--------------------------------------------------------------------------------

---@class RenderPageOptions
---@field user? User Current user
---@field params? table<string, string> Route parameters
---@field query? table<string, string> Query parameters

---@class RenderPageResult
---@field success boolean Render succeeded
---@field page? UIComponent Rendered page
---@field title? string Page title
---@field error? string Error message
---@field statusCode? number HTTP status code

--------------------------------------------------------------------------------
-- User Types
--------------------------------------------------------------------------------

---@class User
---@field id string User ID
---@field username string Username
---@field level number Permission level (1-6)

--------------------------------------------------------------------------------
-- UI Components
--------------------------------------------------------------------------------

---@class UIComponent
---@field type string Component type name
---@field props? table<string, any> Component props
---@field children? UIComponent[] Nested children

--------------------------------------------------------------------------------
-- Page Module Functions
--------------------------------------------------------------------------------

---@class PagesModule
---@field register fun(page: PageDefinition): boolean Register a page
---@field unregister fun(pageId: string): boolean Unregister a page
---@field get fun(pageId: string): PageDefinition|nil Get page by ID
---@field getByPath fun(path: string): PageDefinition|nil Get page by path
---@field list fun(filter?: PageFilter): PageDefinition[] List pages
---@field render fun(pageId: string, options?: RenderPageOptions): RenderPageResult

---@class PageFilter
---@field level? number Filter by required level
---@field search? string Search title/description
---@field layout? string Filter by layout

return {}
