# IRC Webchat Package - Declarative Conversion Guide

## Overview

The IRC Webchat component has been successfully converted from a traditional React TypeScript component to a fully declarative JSON and Lua-based package. This conversion demonstrates the power of the MetaBuilder package system, where complex interactive components can be defined entirely through configuration and scripting.

## Package Structure

The IRC Webchat package (`irc-webchat`) is now defined in `/src/lib/package-catalog.ts` and includes:

### 1. Manifest
```json
{
  "id": "irc-webchat",
  "name": "IRC-Style Webchat",
  "version": "1.0.0",
  "category": "social",
  "icon": "💬"
}
```

### 2. Data Schemas

Three database schemas define the chat data structure:

- **ChatChannel**: Chat channels/rooms with name, description, topic
- **ChatMessage**: Individual messages with type (message, system, join, leave)
- **ChatUser**: Online users per channel

### 3. Pages

The package includes a pre-configured `/chat` page at Level 2 (user area) with authentication required.

### 4. Lua Scripts

Five Lua scripts handle all chat logic:

#### `lua_irc_send_message`
Creates a chat message object with unique ID, timestamp, and user information.

```lua
function sendMessage(channelId, username, userId, message)
  -- Returns a message object
end
```

#### `lua_irc_handle_command`
Processes IRC-style commands like `/help`, `/users`, `/clear`, `/me`.

```lua
function handleCommand(command, channelId, username, onlineUsers)
  -- Returns system response or command result
end
```

#### `lua_irc_format_time`
Formats Unix timestamps into human-readable 12-hour format.

```lua
function formatTime(timestamp)
  -- Returns formatted time string like "02:45 PM"
end
```

#### `lua_irc_user_join`
Generates join messages when users enter a channel.

```lua
function userJoin(channelId, username, userId)
  -- Returns a join-type message
end
```

#### `lua_irc_user_leave`
Generates leave messages when users exit a channel.

```lua
function userLeave(channelId, username, userId)
  -- Returns a leave-type message
end
```

### 5. Component Configuration

The package defines a declarative component structure using JSON:

```json
{
  "type": "IRCWebchat",
  "config": {
    "layout": "Card",
    "children": [
      {
        "id": "header",
        "type": "CardHeader",
        "children": [...]
      },
      {
        "id": "content",
        "type": "CardContent",
        "children": [
          {
            "id": "messages_area",
            "type": "ScrollArea",
            ...
          },
          {
            "id": "input_area",
            "type": "Container",
            ...
          }
        ]
      }
    ]
  }
}
```

### 6. Seed Data

Pre-configured chat channels:
- `general`: General discussion
- `random`: Random conversations

## How It Works

### Component Loading

1. **Package Initialization**: `initializePackageSystem()` is called in `App.tsx` on startup
2. **Script Registration**: All Lua scripts are registered with the `DeclarativeComponentRenderer`
3. **Component Registration**: Component configurations are registered for use in the builder

### Runtime Execution

When the IRC component is used:

1. **User Join**: Calls `lua_irc_user_join` to create a join message
2. **Send Message**: Calls `lua_irc_send_message` with user input
3. **Commands**: Calls `lua_irc_handle_command` when message starts with `/`
4. **Time Formatting**: Calls `lua_irc_format_time` for each message timestamp
5. **User Leave**: Calls `lua_irc_user_leave` on component unmount

### Data Flow

```
User Action → React Component (IRCWebchatDeclarative)
    ↓
getDeclarativeRenderer().executeLuaScript(scriptId, params)
    ↓
LuaEngine.execute(wrappedCode, context)
    ↓
Lua Function Execution (Fengari)
    ↓
Result Conversion (Lua table → JavaScript object)
    ↓
React State Update (useKV for persistence)
```

## Migration from TSX

### Before (IRCWebchat.tsx)
```typescript
const handleSendMessage = () => {
  const newMessage: ChatMessage = {
    id: `msg_${Date.now()}_${Math.random()}`,
    username: user.username,
    userId: user.id,
    message: trimmed,
    timestamp: Date.now(),
    type: 'message',
  }
  setMessages((current) => [...(current || []), newMessage])
}
```

### After (Declarative + Lua)
```typescript
const newMessage = await renderer.executeLuaScript('lua_irc_send_message', [
  `chat_${channelName}`,
  user.username,
  user.id,
  trimmed,
])
setMessages((current) => [...(current || []), newMessage])
```

## Benefits of Declarative Approach

### 1. **No Code Deployment**
- Changes to chat logic require only JSON/Lua updates
- No TypeScript compilation needed
- Hot-swappable functionality

### 2. **Package System Integration**
- IRC can be installed/uninstalled like any package
- Export/import as ZIP with all configurations
- Share with other MetaBuilder instances

### 3. **GUI Configuration**
- Chat commands can be modified in Level 4/5 panels
- Time format can be changed without code
- New message types can be added dynamically

### 4. **Multi-Tenancy Ready**
- Each tenant can customize chat behavior
- Lua scripts can be overridden per tenant
- Database schemas are tenant-isolated

### 5. **Security Sandboxing**
- Lua execution is sandboxed (can be enhanced)
- Scripts can be scanned for malicious code
- Limited API surface for Lua scripts

## File Structure

```
/src
  /components
    IRCWebchat.tsx              [DEPRECATED - Can be removed]
    IRCWebchatDeclarative.tsx   [NEW - Uses declarative system]
  /lib
    package-catalog.ts           [Contains irc-webchat package]
    declarative-component-renderer.ts  [Executes Lua scripts]
    lua-engine.ts                [Fengari Lua runtime]
    package-loader.ts            [Loads packages on init]
```

## Next Steps

### For Developers
1. Review the Lua scripts in `package-catalog.ts`
2. Test IRC functionality in Level 2 user area
3. Consider removing `IRCWebchat.tsx` (old component)
4. Add more Lua scripts for advanced features

### For Users (Level 4/5)
1. Navigate to Package Manager
2. View installed `irc-webchat` package
3. Modify Lua scripts to customize behavior
4. Add new commands via Lua Editor
5. Export package to share with others

## Testing the Conversion

1. **Login** as a regular user
2. Navigate to **Level 2** (User Area)
3. Go to the **Chat** tab
4. Test the following:
   - Send messages
   - Use `/help` command
   - Use `/users` command
   - Use `/me dances` command
   - Use `/clear` command
   - Open another window and see online users update

## Troubleshooting

### Lua Script Not Found
- Ensure `initializePackageSystem()` is called before component renders
- Check that `irc-webchat` package exists in `PACKAGE_CATALOG`

### Messages Not Sending
- Check browser console for Lua execution errors
- Verify parameter types match Lua script expectations
- Ensure `useKV` keys are correctly formatted

### Time Format Issues
- Review `lua_irc_format_time` script
- Check timestamp is in milliseconds (JavaScript format)
- Lua `os.time()` returns seconds, multiply by 1000

## Future Enhancements

1. **Channel Management**: Lua scripts for creating/deleting channels
2. **User Mentions**: Parse `@username` and notify users
3. **Message Reactions**: Add emoji reactions via Lua
4. **File Sharing**: Integrate with asset management
5. **Moderation**: Kick/ban users, message filtering
6. **Bots**: AI-powered chat bots using `spark.llm`
7. **Persistence**: Save message history to database schemas
8. **Notifications**: Browser notifications for new messages

## Conclusion

The IRC Webchat conversion demonstrates that even complex, interactive components can be fully defined using JSON and Lua. This approach enables:

- **Rapid iteration** without deployments
- **User customization** at the highest levels
- **Package sharing** across instances
- **Multi-tenant flexibility**
- **Security through sandboxing**

The declarative pattern can be extended to other components like forums, comments, notifications, and more.
