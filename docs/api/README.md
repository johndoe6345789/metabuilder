# API Reference

Complete API documentation for integrating with MetaBuilder's core systems.

## Quick Navigation

- **[Platform Guide](./platform-guide.md)** - Full API reference
- **[Quick Reference](./quick-reference.md)** - Common patterns
- **[DBAL Integration](./DBAL_INTEGRATION.md)** - Database abstraction layer

## Core APIs

### Database Abstraction Layer (DBAL)
Access and manipulate data through a unified interface.

```typescript
import { Database } from '@/lib/database';

const db = Database.getInstance();
const users = await db.query('users').where('active', true).get();
```

[Learn more](./DBAL_INTEGRATION.md)

### Lua Scripting
Define business logic in Lua for flexibility and multi-tenancy.

```lua
function processPayment(amount, userId)
  if amount <= 0 then
    return {success = false, error = "Invalid amount"}
  end
  
  return {success = true, transactionId = "tx_" .. userId}
end
```

### Component System
Render dynamic components from JSON configuration.

```typescript
<RenderComponent 
  config={componentConfig}
  data={entityData}
/>
```

## API Categories

### Data Operations
- Query data with filtering, sorting, pagination
- Create, update, delete records
- Bulk operations
- Transaction support

### Authentication & Authorization
- User authentication
- Multi-level permission system
- Role-based access control
- Tenant isolation

### Workspace & Configuration
- Manage tenants and workspaces
- Configure features
- Define schemas
- Manage packages

### File Storage
- Upload and download files
- Manage blob storage
- Generate signed URLs
- Access control

## Common Patterns

### Querying Data
```typescript
const users = await db
  .query('users')
  .select('id', 'name', 'email')
  .where('tenantId', currentTenant.id)
  .where('status', 'active')
  .orderBy('name')
  .limit(50)
  .get();
```

### Updating Records
```typescript
await db
  .query('users')
  .where('id', userId)
  .update({
    lastLogin: new Date(),
    status: 'active',
  });
```

### Running Lua Scripts
```typescript
const result = await runLuaScript({
  script: luaCode,
  variables: {
    userId: 123,
    amount: 50.00,
  },
});
```

## Security Considerations

- ✅ Always validate user input
- ✅ Use parameterized queries (DBAL does this)
- ✅ Check permissions before operations
- ✅ Sanitize any user-provided Lua code
- ✅ Use HTTPS in production
- ✅ Follow multi-tenant isolation rules

## Error Handling

```typescript
try {
  const user = await db.query('users').where('id', userId).first();
} catch (error) {
  if (error.code === 'NOT_FOUND') {
    // Handle not found
  } else if (error.code === 'PERMISSION_DENIED') {
    // Handle permission denied
  } else {
    // Handle other errors
    console.error(error);
  }
}
```

## Rate Limiting

API endpoints have the following rate limits:
- **Read operations**: 1000 req/minute
- **Write operations**: 100 req/minute
- **File uploads**: 10 req/minute

## Pagination

For large result sets, use pagination:

```typescript
const page = 1;
const pageSize = 50;

const result = await db
  .query('users')
  .paginate(page, pageSize);

console.log(result.data);        // Array of records
console.log(result.total);       // Total count
console.log(result.hasMore);     // Has next page
```

## Webhooks

Register webhooks to be notified of data changes:

```typescript
await registerWebhook({
  event: 'users.created',
  url: 'https://example.com/webhook',
  secret: 'your-secret-key',
});
```

Webhook events:
- `entity.created`
- `entity.updated`
- `entity.deleted`
- `package.imported`
- `tenant.created`

## Next Steps

1. Choose what you need:
   - [Database operations](./DBAL_INTEGRATION.md)
   - [Scripting](./platform-guide.md)
   - [Components](./platform-guide.md)

2. Read the detailed guide
3. Check [Quick Reference](./quick-reference.md) for examples
4. Implement and test

## Support

- 📚 [Platform Guide](./platform-guide.md) - Full documentation
- 🔍 [Quick Reference](./quick-reference.md) - Code examples
- 🆘 [Troubleshooting](../troubleshooting/) - Common issues
- 💬 Contact the team

---

**Need more details?** Check the [full documentation index](../INDEX.md).
