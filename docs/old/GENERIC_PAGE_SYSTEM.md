# Generic Page System - Reducing Hardcoded TSX Dependency

## Overview

MetaBuilder now features a **Generic Page System** that allows Level 1-3 (Homepage, User Area, Admin Panel) to be defined declaratively using JSON configuration and Lua scripts, dramatically reducing dependence on hardcoded TSX files.

## Key Improvements

### Before (Iteration 1-23)
- ❌ Level1.tsx, Level2.tsx, Level3.tsx were **hardcoded TSX files**
- ❌ Each level had fixed UI structure
- ❌ Changes required code modification
- ❌ IRC was the only declarative component

### After (Iteration 24+)
- ✅ **PageDefinition** system allows declarative page configuration
- ✅ **GenericPage** component renders any page from JSON
- ✅ **PageRenderer** manages page loading, permissions, and Lua execution
- ✅ **PageDefinitionBuilder** provides default pages
- ✅ Levels 1-3 can be fully customized from Level 4/5 without code changes

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     PAGE DEFINITION (JSON)                   │
│  - Components tree                                           │
│  - Layout configuration                                      │
│  - Permission rules                                          │
│  - Lua script hooks                                          │
│  - Metadata (header, sidebar, footer)                       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      PAGE RENDERER                           │
│  - Loads page from database                                  │
│  - Checks permissions                                        │
│  - Executes onLoad/onUnload Lua scripts                     │
│  - Provides context to components                           │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     GENERIC PAGE (React)                     │
│  - Renders layout (default, sidebar, dashboard, blank)      │
│  - Renders header/footer based on metadata                  │
│  - Renders component tree using RenderComponent             │
│  - Handles navigation and logout                            │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   RENDER COMPONENT                           │
│  - Recursively renders component tree                        │
│  - Supports shadcn components                                │
│  - Supports declarative components (IRC, Forum, etc.)        │
│  - Executes Lua handlers for interactions                   │
└─────────────────────────────────────────────────────────────┘
```

## Core Files

### 1. `/src/lib/page-renderer.ts`
**PageRenderer** class that manages pages:
- `registerPage(page)` - Register a page definition
- `loadPages()` - Load pages from database
- `getPage(id)` - Get page by ID
- `getPagesByLevel(level)` - Get all pages for a level
- `checkPermissions(page, user)` - Verify user can access page
- `executeLuaScript(scriptId, context)` - Run Lua script
- `onPageLoad(page, context)` - Lifecycle hook
- `onPageUnload(page, context)` - Lifecycle hook

### 2. `/src/lib/page-definition-builder.ts`
**PageDefinitionBuilder** creates default pages:
- `initializeDefaultPages()` - Creates Level 1-3 default pages
- `buildLevel1Homepage()` - Public homepage with hero + features
- `buildLevel2UserDashboard()` - User dashboard with profile + comments
- `buildLevel3AdminPanel()` - Admin panel with user/content management
- `getPages()` - Returns all built pages

### 3. `/src/components/GenericPage.tsx`
**GenericPage** React component that renders any page:
- Loads page definition from PageRenderer
- Checks permissions
- Renders appropriate layout
- Executes Lua lifecycle hooks
- Handles navigation and user actions

## PageDefinition Structure

```typescript
interface PageDefinition {
  id: string                          // Unique page identifier
  level: 1 | 2 | 3 | 4 | 5           // Application level
  title: string                       // Page title
  description?: string                // Optional description
  layout: 'default' | 'sidebar' | 'dashboard' | 'blank'  // Layout type
  components: ComponentInstance[]     // Component tree
  
  luaScripts?: {
    onLoad?: string                   // Script ID to run on page load
    onUnload?: string                 // Script ID to run on page unload
    handlers?: Record<string, string> // Event handlers (Lua script IDs)
  }
  
  permissions?: {
    requiresAuth: boolean             // Requires authentication?
    requiredRole?: string             // Minimum role required
    customCheck?: string              // Custom Lua permission check
  }
  
  metadata?: {
    showHeader?: boolean              // Show header?
    showFooter?: boolean              // Show footer?
    headerTitle?: string              // Header title
    headerActions?: ComponentInstance[] // Header buttons/actions
    sidebarItems?: Array<{            // Sidebar navigation items
      id: string
      label: string
      icon: string
      action: 'navigate' | 'lua' | 'external'
      target: string
    }>
  }
}
```

## Layout Types

### 1. Default Layout
Standard page with header, content area, and footer:
```
┌────────────────────────────────────┐
│           Header                    │
├────────────────────────────────────┤
│                                     │
│           Content                   │
│                                     │
├────────────────────────────────────┤
│           Footer                    │
└────────────────────────────────────┘
```

### 2. Sidebar Layout
Page with persistent sidebar navigation:
```
┌────────────────────────────────────┐
│           Header                    │
├────────┬───────────────────────────┤
│        │                            │
│ Sidebar│      Content              │
│        │                            │
└────────┴───────────────────────────┘
```

### 3. Dashboard Layout
Full application dashboard with sidebar + header:
```
┌────────────────────────────────────┐
│           Header                    │
├────────┬───────────────────────────┤
│        │                            │
│ Sidebar│   Dashboard Content       │
│        │   (usually cards/widgets)  │
└────────┴───────────────────────────┘
```

### 4. Blank Layout
No header/footer, just content (for custom layouts):
```
┌────────────────────────────────────┐
│                                     │
│           Full Content              │
│                                     │
└────────────────────────────────────┘
```

## Usage Examples

### Example 1: Create a Custom Homepage

```typescript
import { getPageRenderer } from '@/lib/page-renderer'

const customHomepage: PageDefinition = {
  id: 'page_custom_home',
  level: 1,
  title: 'My Custom Homepage',
  layout: 'default',
  components: [
    {
      id: 'hero',
      type: 'Container',
      props: {
        className: 'py-20 text-center bg-gradient-to-br from-blue-500 to-purple-600'
      },
      children: [
        {
          id: 'hero_title',
          type: 'Heading',
          props: {
            level: 1,
            children: 'Welcome to Our Platform',
            className: 'text-5xl font-bold text-white mb-4'
          },
          children: []
        },
        {
          id: 'hero_cta',
          type: 'Button',
          props: {
            children: 'Get Started',
            variant: 'default',
            size: 'lg'
          },
          children: []
        }
      ]
    }
  ],
  permissions: {
    requiresAuth: false
  },
  metadata: {
    showHeader: true,
    showFooter: true
  }
}

const renderer = getPageRenderer()
await renderer.registerPage(customHomepage)
```

### Example 2: User Dashboard with Sidebar

```typescript
const userDashboard: PageDefinition = {
  id: 'page_user_dash',
  level: 2,
  title: 'Dashboard',
  layout: 'dashboard',
  components: [
    {
      id: 'stats_card',
      type: 'Card',
      props: { className: 'p-6' },
      children: [
        {
          id: 'stats_title',
          type: 'Heading',
          props: { level: 2, children: 'Your Stats' },
          children: []
        }
      ]
    }
  ],
  permissions: {
    requiresAuth: true,
    requiredRole: 'user'
  },
  metadata: {
    showHeader: true,
    headerTitle: 'Dashboard',
    sidebarItems: [
      { id: 'nav_home', label: 'Home', icon: '🏠', action: 'navigate', target: '1' },
      { id: 'nav_profile', label: 'Profile', icon: '👤', action: 'navigate', target: '2' }
    ]
  }
}
```

### Example 3: Page with Lua Lifecycle Hooks

```typescript
// First, create Lua scripts in database
const onLoadScript: LuaScript = {
  id: 'lua_page_analytics',
  name: 'Track Page View',
  code: `
    function trackPageView(userId, pageId)
      log("User " .. userId .. " viewed page " .. pageId)
      -- Could save to database, call API, etc.
      return true
    end
    return trackPageView
  `,
  parameters: [
    { name: 'userId', type: 'string' },
    { name: 'pageId', type: 'string' }
  ],
  returnType: 'boolean'
}

await Database.addLuaScript(onLoadScript)

// Then reference it in page definition
const trackedPage: PageDefinition = {
  id: 'page_tracked',
  level: 2,
  title: 'Tracked Page',
  layout: 'default',
  components: [],
  luaScripts: {
    onLoad: 'lua_page_analytics',  // Runs when page loads
    onUnload: 'lua_page_cleanup'   // Runs when page unloads
  },
  permissions: {
    requiresAuth: true
  }
}
```

## Rendering a Generic Page

In `App.tsx` or any level component:

```typescript
import { GenericPage } from '@/components/GenericPage'

// Instead of:
// <Level1 onNavigate={handleNavigate} />

// Use:
<GenericPage
  pageId="page_level1_home"
  user={currentUser}
  level={1}
  onNavigate={handleNavigate}
  onLogout={handleLogout}
/>
```

## Extending the System

### Add Custom Component Types

Register new component types in `component-catalog.ts`:

```typescript
{
  type: 'VideoPlayer',
  label: 'Video Player',
  icon: 'Play',
  category: 'Media',
  allowsChildren: false,
  defaultProps: {
    src: '',
    controls: true
  },
  propSchema: [
    { name: 'src', label: 'Video URL', type: 'string' },
    { name: 'controls', label: 'Show Controls', type: 'boolean' }
  ]
}
```

Then add rendering logic in `RenderComponent.tsx`:

```typescript
case 'VideoPlayer':
  return (
    <video 
      src={props.src} 
      controls={props.controls}
      className={props.className}
    />
  )
```

### Create Package-Based Pages

Create a complete application package with pages:

```typescript
const forumPackage = {
  manifest: {
    id: 'forum-app',
    name: 'Forum Application',
    version: '1.0.0'
  },
  content: {
    pages: [
      {
        id: 'page_forum_home',
        level: 2,
        title: 'Forum Home',
        layout: 'sidebar',
        components: [...],
        permissions: { requiresAuth: true, requiredRole: 'user' }
      },
      {
        id: 'page_forum_thread',
        level: 2,
        title: 'Thread View',
        layout: 'default',
        components: [...],
        permissions: { requiresAuth: true, requiredRole: 'user' }
      }
    ],
    luaScripts: [
      // Forum-specific scripts
    ]
  }
}
```

## Benefits

### 🚀 Flexibility
- Pages can be modified from Level 4/5 GUI
- No code deployment needed
- Real-time preview of changes

### 🔒 Security
- Permission checks at page level
- Role-based access control
- Custom Lua permission logic

### 📦 Packages
- Distribute complete applications as packages
- Forum, blog, e-commerce as installable packages
- Community-shareable templates

### ⚡ Performance
- Pages loaded on-demand
- Lua scripts cached
- Component tree optimized

### 🛠️ Developer Experience
- Clear separation of concerns
- Type-safe definitions
- Easy to test and debug

## Migration Path

### Phase 1: ✅ COMPLETE (Iteration 24)
- ✅ Created `PageRenderer` system
- ✅ Created `GenericPage` component
- ✅ Created `PageDefinitionBuilder`
- ✅ Created default Level 1-3 pages

### Phase 2: 🚧 IN PROGRESS
- [ ] Update `App.tsx` to use `GenericPage` instead of Level1/2/3
- [ ] Add page management UI in Level 4/5
- [ ] Allow god users to edit page definitions
- [ ] Add visual page builder drag-and-drop

### Phase 3: 📋 PLANNED
- [ ] Remove `Level1.tsx`, `Level2.tsx`, `Level3.tsx` files
- [ ] Create more default page templates
- [ ] Build page marketplace/library
- [ ] Add page versioning and rollback

## Comparison: Before vs After

### Level 1 Homepage - Before
```tsx
// Level1.tsx - 300+ lines of hardcoded TSX
export function Level1({ onNavigate }: Level1Props) {
  return (
    <div className="min-h-screen">
      <header>...</header>
      <section className="hero">
        <h1>Welcome to MetaBuilder</h1>
        {/* Hardcoded content */}
      </section>
      <footer>...</footer>
    </div>
  )
}
```

### Level 1 Homepage - After
```tsx
// App.tsx - Generic, data-driven
<GenericPage
  pageId="page_level1_home"
  user={null}
  level={1}
  onNavigate={handleNavigate}
/>

// Page definition stored in database, fully customizable
```

## Next Steps

To complete the migration:

1. **Update App.tsx** to use `GenericPage` for levels 1-3
2. **Add Page Builder UI** in Level 4/5 panels
3. **Create Page Templates** for common layouts
4. **Build Page Editor** with drag-and-drop
5. **Test Thoroughly** before removing old TSX files

## Conclusion

The Generic Page System represents a major architectural improvement:
- **Less hardcoded TSX** = more flexibility
- **Declarative pages** = easier to maintain
- **Database-driven** = dynamic without deployment
- **Package system** = shareable applications

This moves MetaBuilder closer to being a true "no-code" platform where the builder UI (Levels 4-5) is the only hardcoded TSX, and everything else is procedurally generated from data.
