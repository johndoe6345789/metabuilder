# Declarative Component System

## Overview

MetaBuilder now supports **declarative components** - components defined via JSON configuration and Lua scripts instead of traditional TSX files. This enables:

- **Package-based components**: Components can be distributed as part of packages
- **Dynamic loading**: Components are loaded at runtime from the package catalog
- **Better separation**: Logic (Lua), UI (JSON), and rendering (React) are cleanly separated
- **No code deployment**: New components can be added without code changes

## Architecture

### 1. Component Definition (JSON)

Components are defined in package catalogs with:

```typescript
{
  type: 'IRCWebchat',           // Component type identifier
  category: 'social',            // Category for organization
  label: 'IRC Webchat',         // Display name
  description: '...',            // Description
  icon: '💬',                    // Icon
  props: [...],                  // Prop schema
  config: {                      // UI structure
    layout: 'Card',
    styling: { className: '...' },
    children: [...]              // Nested component tree
  }
}
```

### 2. Business Logic (Lua)

Lua scripts handle component logic:

```lua
-- Send IRC Message
function sendMessage(channelId, username, userId, message)
  local msgId = "msg_" .. tostring(os.time()) .. "_" .. math.random(1000, 9999)
  local msg = {
    id = msgId,
    channelId = channelId,
    username = username,
    userId = userId,
    message = message,
    type = "message",
    timestamp = os.time() * 1000
  }
  log("Sending message: " .. message)
  return msg
end

return sendMessage
```

### 3. Component Renderer (React)

The renderer bridges JSON config, Lua scripts, and React:

```typescript
import { IRCWebchatDeclarative } from './IRCWebchatDeclarative'
import { getDeclarativeRenderer } from '@/lib/declarative-component-renderer'

// Check if component is declarative
const renderer = getDeclarativeRenderer()
if (renderer.hasComponentConfig('IRCWebchat')) {
  return <IRCWebchatDeclarative {...props} />
}
```

## IRC Webchat Example

The IRC Webchat has been fully rewritten as a declarative component:

### Package Definition

Located in `src/lib/package-catalog.ts`:

```typescript
'irc-webchat': {
  manifest: {
    id: 'irc-webchat',
    name: 'IRC-Style Webchat',
    // ... metadata
  },
  content: {
    schemas: [
      // ChatChannel, ChatMessage, ChatUser schemas
    ],
    pages: [
      // Page configuration
    ],
    luaScripts: [
      {
        id: 'lua_irc_send_message',
        name: 'Send IRC Message',
        code: '...',
        parameters: [...],
        returnType: 'table'
      },
      {
        id: 'lua_irc_handle_command',
        name: 'Handle IRC Command',
        // Processes /help, /users, /clear, /me
      },
      {
        id: 'lua_irc_format_time',
        // Formats timestamps
      },
      {
        id: 'lua_irc_user_join',
        // Handles user joining
      },
      {
        id: 'lua_irc_user_leave',
        // Handles user leaving
      }
    ],
    componentConfigs: {
      IRCWebchat: {
        // Full component configuration
      }
    }
  }
}
```

### Component Implementation

`src/components/IRCWebchatDeclarative.tsx`:

```typescript
export function IRCWebchatDeclarative({ user, channelName = 'general', onClose }) {
  const renderer = getDeclarativeRenderer()
  
  // Execute Lua script for sending messages
  const handleSendMessage = async () => {
    const newMessage = await renderer.executeLuaScript('lua_irc_send_message', [
      `chat_${channelName}`,
      user.username,
      user.id,
      trimmed,
    ])
    
    if (newMessage) {
      setMessages((current) => [...(current || []), newMessage])
    }
  }
  
  // Execute Lua script for commands
  const handleCommand = async (command: string) => {
    const response = await renderer.executeLuaScript('lua_irc_handle_command', [
      command,
      `chat_${channelName}`,
      user.username,
      onlineUsers || [],
    ])
    
    if (response.message === 'CLEAR_MESSAGES') {
      setMessages([])
    } else {
      setMessages((current) => [...(current || []), response])
    }
  }
  
  // UI rendering with shadcn components
  return <Card>...</Card>
}
```

## Key Files

### Core System

- `src/lib/declarative-component-renderer.ts` - Component renderer and Lua script executor
- `src/lib/package-loader.ts` - Package initialization system
- `src/lib/package-catalog.ts` - Package definitions including IRC
- `src/components/RenderComponent.tsx` - Updated to support declarative components

### IRC Implementation

- `src/components/IRCWebchatDeclarative.tsx` - Declarative IRC component
- ~~`src/components/IRCWebchat.tsx`~~ - **REMOVED** (replaced by declarative version)

### Integration Points

- `src/App.tsx` - Calls `initializePackageSystem()` on startup
- `src/lib/component-catalog.ts` - IRC added to component catalog
- `src/components/Level2.tsx` - Updated to use `IRCWebchatDeclarative`

## Lua Script Execution

Scripts are executed through the declarative renderer:

```typescript
const renderer = getDeclarativeRenderer()

// Parameters are passed as array
const result = await renderer.executeLuaScript('lua_irc_send_message', [
  'channel_id',
  'username',
  'user_id',
  'message text'
])

// Result contains the Lua function's return value
console.log(result) // { id: "msg_...", message: "...", ... }
```

### Parameter Mapping

The renderer wraps Lua code to map parameters:

```typescript
const wrappedCode = `
${script.code}
local fn = ...
if fn then
  local args = {}
  table.insert(args, context.params.channelId)
  table.insert(args, context.params.username)
  // ... more parameters
  return fn(table.unpack(args))
end
`
```

## Benefits

1. **Modularity**: Components are self-contained in packages
2. **Maintainability**: Logic (Lua), UI (JSON), rendering (React) are separated
3. **Extensibility**: New components added without code changes
4. **Testing**: Lua scripts can be tested independently
5. **Distribution**: Packages can be shared as ZIP files
6. **Security**: Lua sandbox prevents malicious code execution

## Future Enhancements

- [ ] Visual component builder for declarative components
- [ ] Hot-reload for component definitions
- [ ] Component marketplace
- [ ] Version management for component definitions
- [ ] Automated testing for Lua scripts
- [ ] TypeScript type generation from JSON schemas
- [ ] More built-in declarative components (Forum, Guestbook, etc.)

## Migration Guide

To convert an existing TSX component to declarative:

1. **Define component config** in package catalog with props, layout, and children structure
2. **Extract business logic** into Lua scripts (functions, event handlers)
3. **Create declarative wrapper** component that uses `getDeclarativeRenderer()`
4. **Register component** in component catalog
5. **Update references** to use new declarative component
6. **Test thoroughly** to ensure parity with original
7. **Remove old TSX file** once verified

## Example: Converting a Simple Component

### Before (TSX):

```tsx
export function SimpleCounter() {
  const [count, setCount] = useState(0)
  
  const increment = () => setCount(c => c + 1)
  
  return (
    <Card>
      <p>Count: {count}</p>
      <Button onClick={increment}>Increment</Button>
    </Card>
  )
}
```

### After (Declarative):

**Package Definition:**
```typescript
{
  componentConfigs: {
    SimpleCounter: {
      type: 'SimpleCounter',
      props: [],
      config: { layout: 'Card', children: [...] }
    }
  },
  luaScripts: [{
    id: 'lua_counter_increment',
    code: 'function increment(count) return count + 1 end; return increment'
  }]
}
```

**Component:**
```typescript
export function SimpleCounterDeclarative() {
  const [count, setCount] = useState(0)
  const renderer = getDeclarativeRenderer()
  
  const increment = async () => {
    const newCount = await renderer.executeLuaScript('lua_counter_increment', [count])
    setCount(newCount)
  }
  
  return <Card>...</Card>
}
```

---

For questions or contributions, see the main project documentation.
