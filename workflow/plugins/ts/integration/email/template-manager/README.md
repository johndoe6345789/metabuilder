# Email Template Manager Plugin - Phase 6

Comprehensive email template management workflow plugin for MetaBuilder email client. Provides template creation, variable interpolation, team sharing, and usage analytics.

## Features

### Template Lifecycle Management
- **Create**: Save email templates with rich content (plain text + HTML)
- **Update**: Modify templates with version tracking
- **Delete**: Soft-delete templates for recovery
- **Recover**: Restore accidentally deleted templates
- **Get**: Retrieve single template by ID
- **List**: Browse templates with filtering and pagination

### Template Variables & Interpolation
- **Standard Variables**: `{{name}}`, `{{date}}`, `{{recipient}}`
- **Custom Variables**: Auto-detected from template content
- **Auto-Expansion**: Substitute variables on template usage
- **Defaults & Fallbacks**: Use default values for missing variables
- **Type System**: Support for text, date, number, email types

### Template Categories
- `responses` - Standard reply templates
- `greetings` - Opening lines and salutations
- `signatures` - Email signatures
- `custom` - User-defined templates

### Team Sharing & Collaboration
- **Share Templates**: Grant view/edit/admin permissions
- **Access Control**: Fine-grained permission levels
- **Audit Logging**: Track all sharing changes
- **Public Templates**: Make templates available to all users

### Usage Analytics
- **Track Usage**: Record template expansions with variable values
- **Usage Statistics**: Count total uses and last used timestamp
- **Variable Analytics**: Identify most frequently used variables
- **Performance Insights**: Analyze template effectiveness

### Data Isolation
- **Multi-Tenant**: Full tenant isolation with ACL
- **Soft Delete**: Preserve data for recovery without hard deletion
- **Version Control**: Track template changes over time

## Configuration

### Create Template
```typescript
const config: TemplateManagerConfig = {
  action: 'create',
  accountId: 'acc-123456',
  template: {
    name: 'Welcome Message',
    subject: 'Welcome to {{company}}, {{name}}!',
    bodyText: 'Dear {{name}},\n\nWelcome to {{company}}...',
    bodyHtml: '<p>Dear {{name}},</p><p>Welcome to {{company}}...</p>',
    category: 'greetings',
    tags: ['welcome', 'new-users'],
    isPublic: false
  }
};
```

### Expand Template
```typescript
const config: TemplateManagerConfig = {
  action: 'expand',
  accountId: 'acc-123456',
  templateId: 'tmpl-abc123',
  variableValues: {
    name: 'John Doe',
    company: 'Acme Corp',
    date: '2026-01-30'
  }
};
```

### Share Template
```typescript
const config: TemplateManagerConfig = {
  action: 'share',
  accountId: 'acc-123456',
  templateId: 'tmpl-abc123',
  shareWithUserId: 'user-002',
  sharePermission: 'edit' // 'view' | 'edit' | 'admin'
};
```

### List Templates with Filtering
```typescript
const config: TemplateManagerConfig = {
  action: 'list',
  accountId: 'acc-123456',
  filters: {
    category: 'greetings',
    searchText: 'welcome',
    isPublic: false,
    sharedOnly: false,
    includeDeleted: false
  },
  pagination: {
    page: 1,
    pageSize: 20
  }
};
```

### Get Usage Statistics
```typescript
const config: TemplateManagerConfig = {
  action: 'get-usage-stats',
  accountId: 'acc-123456',
  templateId: 'tmpl-abc123'
};
```

## Response Structure

### Template Creation Response
```typescript
{
  status: 'success',
  output: {
    action: 'create',
    template: {
      templateId: 'tmpl-xyz789',
      accountId: 'acc-123456',
      tenantId: 'tenant-001',
      ownerId: 'user-001',
      name: 'Welcome Message',
      subject: 'Welcome to {{company}}, {{name}}!',
      bodyText: 'Dear {{name}},...',
      bodyHtml: '<p>Dear {{name}},...</p>',
      category: 'greetings',
      variables: [
        {
          name: 'name',
          placeholder: '{{name}}',
          description: 'Recipient full name',
          type: 'text',
          required: false,
          examples: ['John Smith', 'Jane Doe']
        },
        {
          name: 'company',
          placeholder: '{{company}}',
          description: 'Custom variable: company',
          type: 'text',
          required: false
        }
      ],
      tags: ['welcome', 'new-users'],
      isPublic: false,
      sharedWith: [],
      usageCount: 0,
      createdAt: 1704067200000,
      updatedAt: 1704067200000,
      isDeleted: false,
      version: 1
    },
    success: true,
    message: 'Template "Welcome Message" created successfully',
    stats: {
      operationDuration: 15,
      itemsAffected: 1,
      storageUsed: 1248
    }
  }
}
```

### Template Expansion Response
```typescript
{
  status: 'success',
  output: {
    action: 'expand',
    expandedTemplate: {
      templateId: 'tmpl-xyz789',
      subject: 'Welcome to Acme Corp, John Doe!',
      bodyText: 'Dear John Doe,\n\nWelcome to Acme Corp...',
      bodyHtml: '<p>Dear John Doe,</p><p>Welcome to Acme Corp...</p>',
      variables: {
        name: 'John Doe',
        company: 'Acme Corp',
        date: '2026-01-30'
      },
      missingVariables: [],
      errors: []
    },
    success: true,
    message: 'Template "Welcome Message" expanded successfully',
    stats: {
      operationDuration: 8,
      itemsAffected: 1,
      storageUsed: 892
    }
  }
}
```

### Usage Statistics Response
```typescript
{
  status: 'success',
  output: {
    action: 'get-usage-stats',
    usageStats: {
      templateId: 'tmpl-xyz789',
      totalUsage: 156,
      lastUsedAt: 1704153600000,
      averageVariableCount: 3.2,
      topVariables: [
        { name: 'name', usageCount: 156 },
        { name: 'company', usageCount: 145 },
        { name: 'date', usageCount: 98 },
        { name: 'recipient', usageCount: 67 },
        { name: 'customVar', usageCount: 23 }
      ]
    },
    success: true,
    stats: {
      operationDuration: 12,
      itemsAffected: 1,
      storageUsed: 0
    }
  }
}
```

## Variable Reference

### Standard Variables

| Variable | Placeholder | Type | Description | Example |
|----------|-------------|------|-------------|---------|
| name | `{{name}}` | text | Recipient full name | John Smith |
| date | `{{date}}` | date | Current date (ISO format) | 2026-01-30 |
| recipient | `{{recipient}}` | email | Recipient email address | john@example.com |

### Custom Variables
Extract automatically from template content. Examples:
- `{{company}}` - Organization name
- `{{department}}` - Department identifier
- `{{projectName}}` - Project identifier
- `{{deadline}}` - Deadline date
- Any custom placeholder in format `{{varName}}`

## Actions

### Template Lifecycle
- `create` - Create new template
- `update` - Update existing template
- `delete` - Soft-delete template
- `recover` - Restore deleted template
- `get` - Retrieve single template
- `list` - List templates with filters

### Template Operations
- `expand` - Expand template with variable substitution
- `share` - Share template with another user
- `unshare` - Remove sharing from user
- `track-usage` - Record template expansion
- `get-usage-stats` - Get usage analytics

## Permission Model

### Ownership
- **Owner**: User who created the template
- **Actions**: Full control (create, read, update, delete, share)

### Sharing Permissions
- `view` - Read-only access, can expand but not edit
- `edit` - Can modify template content and expand
- `admin` - Full control including sharing with others

### Access Control
- Public templates available to all authenticated users
- Private templates only to owner and explicitly shared users
- Multi-tenant isolation enforced on all queries

## Best Practices

### Template Design
1. Use descriptive template names
2. Add variables for frequently changing content
3. Provide HTML alternative for better rendering
4. Include tags for easier discovery

### Variable Naming
1. Use camelCase for custom variables: `{{firstName}}`
2. Use clear, self-documenting names
3. Avoid special characters in variable names

### Sharing Strategy
1. Start with 'view' permission for discovery
2. Upgrade to 'edit' for trusted collaborators
3. Use 'admin' only for team leads
4. Audit sharing changes regularly

### Usage Tracking
1. Analyze `topVariables` to understand usage patterns
2. Review `lastUsedAt` to identify outdated templates
3. Monitor `usageCount` to measure effectiveness

## Error Handling

Common errors and resolution:

| Error | Cause | Resolution |
|-------|-------|-----------|
| Template not found | Invalid templateId | Verify ID, use list to find templates |
| Unauthorized | Permission denied | Check ownership or sharing permissions |
| Missing variables | Required variables not provided | Supply values for all required variables |
| Invalid category | Unknown category | Use: responses, greetings, signatures, custom |
| Storage exceeded | Template too large | Reduce content size or use simpler HTML |

## Performance Notes

- Templates are cached in-memory for fast access
- List operations support pagination for large result sets
- Variable substitution is O(n) where n = template size
- Usage tracking is asynchronous (non-blocking)
- Soft-delete preserves data without reclaim delay

## Testing

Run tests with:
```bash
npm test
```

Coverage includes:
- ✓ Template CRUD operations
- ✓ Variable extraction and expansion
- ✓ Template sharing and permissions
- ✓ Usage tracking and analytics
- ✓ Multi-tenant isolation
- ✓ Error handling
- ✓ Validation

## Integration with Email Client

### Typical Workflow
1. Create template with variables
2. Share with team members
3. Expand template when composing email
4. Track usage for analytics
5. Monitor statistics and refine templates

### Compose Integration
```typescript
// In compose flow
const expanded = await templateManager.execute({
  action: 'expand',
  templateId: selectedTemplate.id,
  variableValues: {
    name: recipientName,
    recipient: recipientEmail,
    date: today
  }
});

// Populate compose fields
composeForm.subject = expanded.expandedTemplate.subject;
composeForm.body = expanded.expandedTemplate.bodyText;
composeForm.bodyHtml = expanded.expandedTemplate.bodyHtml;
```

## Future Enhancements

- Template preview with mock variables
- Template templates (nested templates)
- Conditional sections based on variables
- Template branching logic
- Import/export in multiple formats
- Template versioning and rollback
- Collaborative template editing
- Template rating and recommendations

## Related Plugins

- `draft-manager` - Draft auto-save and recovery
- `smtp-send` - Email sending
- `email-parser` - Message parsing
- `attachment-handler` - Attachment management
- `message-threading` - Message threading
- `spam-detector` - Spam detection

## Support

For issues, questions, or contributions:
1. Check existing templates and examples
2. Review error messages and resolution steps
3. File issues in the MetaBuilder repository
4. Contact the email client team

---

**Phase 6 - Phase Status**: Complete
**Last Updated**: 2026-01-24
**Maintainer**: MetaBuilder Email Team
