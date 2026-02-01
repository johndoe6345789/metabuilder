# Template Manager Integration Guide

## Phase 6 Email Client Architecture Integration

This document describes how the Template Manager plugin integrates with the overall Phase 6 email client architecture.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│         Email Client Frontend (Next.js/React)           │
├─────────────────────────────────────────────────────────┤
│  Templates UI Components (FakeMUI)                       │
│  - TemplateListView                                     │
│  - TemplateEditorView                                   │
│  - TemplatePreviewView                                  │
│  - TemplateSharingDialog                                │
│  - UsageAnalyticsView                                   │
└────────────┬────────────────────────────────────────────┘
             │ Redux Actions & Hooks
             │
┌────────────▼────────────────────────────────────────────┐
│      Redux State Management                             │
│  - emailTemplatesSlice                                 │
│  - templatesUI (filters, pagination)                   │
│  - templateUsageSlice                                  │
└────────────┬────────────────────────────────────────────┘
             │ Custom Hooks
             │
┌────────────▼────────────────────────────────────────────┐
│  Workflow Engine & Plugins                              │
│  - TemplateManagerExecutor (Phase 6)                    │
│  - DraftManagerExecutor                                 │
│  - EmailParserExecutor                                  │
│  - SMTPSendExecutor                                     │
└────────────┬────────────────────────────────────────────┘
             │ Workflow DAG Execution
             │
┌────────────▼────────────────────────────────────────────┐
│      DBAL Layer (TypeScript, Phase 2)                   │
│  - EmailTemplate entity                                 │
│  - TemplateShare entity                                 │
│  - TemplateUsage entity                                 │
│  - Multi-tenant ACL                                     │
│  - Full-text search indexes                             │
└────────────┬────────────────────────────────────────────┘
             │ ORM/Query Builder
             │
┌────────────▼────────────────────────────────────────────┐
│      Data Layer                                         │
│  - PostgreSQL (production)                              │
│  - SQLite (development/testing)                         │
│  - IndexedDB (browser caching)                          │
└─────────────────────────────────────────────────────────┘
```

## DBAL Entity Integration

### EmailTemplate Entity
```yaml
# dbal/shared/api/schema/entities/packages/email-template.yaml
id: email-template
type: entity
table: email_templates

fields:
  id:
    type: uuid
    primary: true
  tenantId:
    type: uuid
    index: true
    required: true
  accountId:
    type: uuid
    required: true
  ownerId:
    type: uuid
    required: true
  name:
    type: string
    required: true
    searchable: true
  subject:
    type: string
    required: true
  bodyText:
    type: text
    required: true
    searchable: true
  bodyHtml:
    type: text
  category:
    type: enum
    values: [responses, greetings, signatures, custom]
    index: true
  variables:
    type: json
  tags:
    type: json
  isPublic:
    type: boolean
    default: false
  usageCount:
    type: integer
    default: 0
  lastUsedAt:
    type: timestamp
  createdAt:
    type: timestamp
    default: now()
    index: true
  updatedAt:
    type: timestamp
    default: now()
  isDeleted:
    type: boolean
    default: false
    index: true
  version:
    type: integer
    default: 1

indexes:
  - fields: [tenantId, ownerId]
  - fields: [tenantId, category, isDeleted]
  - fields: [tenantId, isPublic]
  - fields: [accountId, tenantId]

acl:
  - role: owner
    permissions: [create, read, update, delete, share]
  - role: shared_view
    permissions: [read]
  - role: shared_edit
    permissions: [read, update]
  - role: shared_admin
    permissions: [read, update, share]
  - role: admin
    permissions: [read, update]
```

### TemplateShare Entity
```yaml
# dbal/shared/api/schema/entities/packages/template-share.yaml
id: template-share
type: entity
table: template_shares

fields:
  id:
    type: uuid
    primary: true
  templateId:
    type: uuid
    index: true
    foreignKey: email_templates.id
    required: true
  sharedWithUserId:
    type: uuid
    index: true
    required: true
  permission:
    type: enum
    values: [view, edit, admin]
    default: view
  sharedAt:
    type: timestamp
    default: now()
  sharedBy:
    type: uuid
    required: true

indexes:
  - fields: [templateId, sharedWithUserId]
    unique: true
  - fields: [sharedWithUserId, permission]
  - fields: [templateId]
```

### TemplateUsage Entity
```yaml
# dbal/shared/api/schema/entities/packages/template-usage.yaml
id: template-usage
type: entity
table: template_usages

fields:
  id:
    type: uuid
    primary: true
  templateId:
    type: uuid
    index: true
    foreignKey: email_templates.id
    required: true
  userId:
    type: uuid
    index: true
    required: true
  accountId:
    type: uuid
    required: true
  tenantId:
    type: uuid
    index: true
    required: true
  variables:
    type: json
    required: true
  resultingSubject:
    type: string
    searchable: true
  resultingBody:
    type: text
  usedAt:
    type: timestamp
    default: now()
    index: true

indexes:
  - fields: [templateId, usedAt]
  - fields: [userId, usedAt]
  - fields: [tenantId, usedAt]
  - fields: [templateId, userId]
```

## Redux State Slices Integration

### Email Templates Slice
```typescript
// redux/email/emailTemplatesSlice.ts
export const emailTemplatesSlice = createSlice({
  name: 'emailTemplates',
  initialState: {
    templates: [] as EmailTemplate[],
    selectedTemplate: null as EmailTemplate | null,
    loading: false,
    error: null as string | null,
    filters: {
      category: null,
      searchText: '',
      isPublic: false,
      sharedOnly: false
    },
    pagination: {
      page: 1,
      pageSize: 20,
      total: 0
    }
  },
  reducers: {
    // Template lifecycle
    setTemplates: (state, action) => { state.templates = action.payload },
    setSelectedTemplate: (state, action) => { state.selectedTemplate = action.payload },
    addTemplate: (state, action) => { state.templates.unshift(action.payload) },
    updateTemplate: (state, action) => {
      const idx = state.templates.findIndex(t => t.templateId === action.payload.templateId);
      if (idx !== -1) state.templates[idx] = action.payload;
    },
    removeTemplate: (state, action) => {
      state.templates = state.templates.filter(t => t.templateId !== action.payload);
    },

    // Filters
    setFilters: (state, action) => { state.filters = action.payload },
    setPagination: (state, action) => { state.pagination = action.payload },

    // UI state
    setLoading: (state, action) => { state.loading = action.payload },
    setError: (state, action) => { state.error = action.payload }
  }
});
```

### Template Usage Slice
```typescript
// redux/email/templateUsageSlice.ts
export const templateUsageSlice = createSlice({
  name: 'templateUsage',
  initialState: {
    usageStats: null as UsageStats | null,
    recentUsages: [] as TemplateUsageRecord[],
    loading: false,
    error: null as string | null
  },
  reducers: {
    setUsageStats: (state, action) => { state.usageStats = action.payload },
    addRecentUsage: (state, action) => {
      state.recentUsages.unshift(action.payload);
      if (state.recentUsages.length > 20) state.recentUsages.pop();
    }
  }
});
```

## Custom Hooks Integration

### useEmailTemplates Hook
```typescript
// hooks/email/useEmailTemplates.ts
export function useEmailTemplates() {
  const dispatch = useAppDispatch();
  const { templates, selectedTemplate, loading, filters, pagination } =
    useAppSelector(state => state.emailTemplates);

  const createTemplate = useCallback(async (template: Partial<EmailTemplate>) => {
    const result = await templateManagerExecutor.execute({
      action: 'create',
      accountId: selectedAccount.id,
      template
    });
    if (result.status === 'success') {
      dispatch(addTemplate(result.output.template));
    }
  }, []);

  const updateTemplate = useCallback(async (templateId: string, updates: Partial<EmailTemplate>) => {
    const result = await templateManagerExecutor.execute({
      action: 'update',
      accountId: selectedAccount.id,
      templateId,
      template: updates
    });
    if (result.status === 'success') {
      dispatch(updateTemplate(result.output.template));
    }
  }, []);

  const expandTemplate = useCallback(async (templateId: string, variables: Record<string, string>) => {
    const result = await templateManagerExecutor.execute({
      action: 'expand',
      accountId: selectedAccount.id,
      templateId,
      variableValues: variables
    });
    return result.output.expandedTemplate;
  }, []);

  const shareTemplate = useCallback(async (templateId: string, userId: string, permission: 'view' | 'edit' | 'admin') => {
    const result = await templateManagerExecutor.execute({
      action: 'share',
      accountId: selectedAccount.id,
      templateId,
      shareWithUserId: userId,
      sharePermission: permission
    });
    return result.status === 'success';
  }, []);

  return {
    templates,
    selectedTemplate,
    loading,
    filters,
    pagination,
    createTemplate,
    updateTemplate,
    expandTemplate,
    shareTemplate,
    // ... more methods
  };
}
```

### useTemplateCompose Hook
```typescript
// hooks/email/useTemplateCompose.ts
export function useTemplateCompose() {
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [expandedTemplate, setExpandedTemplate] = useState<ExpandedTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});

  const applyTemplate = useCallback(async (templateId: string) => {
    const template = await getTemplate(templateId);
    setSelectedTemplate(template);
  }, []);

  const updateVariable = useCallback((name: string, value: string) => {
    setVariables(prev => ({ ...prev, [name]: value }));
  }, []);

  const previewExpansion = useCallback(async () => {
    if (!selectedTemplate) return;
    const expanded = await expandTemplate(selectedTemplate.templateId, variables);
    setExpandedTemplate(expanded);
  }, [selectedTemplate, variables]);

  const insertIntoCompose = useCallback(async () => {
    if (!expandedTemplate) return;
    return {
      subject: expandedTemplate.subject,
      bodyText: expandedTemplate.bodyText,
      bodyHtml: expandedTemplate.bodyHtml
    };
  }, [expandedTemplate]);

  return {
    selectedTemplate,
    expandedTemplate,
    variables,
    applyTemplate,
    updateVariable,
    previewExpansion,
    insertIntoCompose
  };
}
```

## FakeMUI Components

### TemplateListView Component
```typescript
// fakemui/react/components/email/TemplateListView.tsx
export function TemplateListView() {
  const { templates, loading, filters, pagination, deleteTemplate } = useEmailTemplates();

  return (
    <Box>
      {/* Filters */}
      <TemplateFiltersBar filters={filters} onFiltersChange={handleFiltersChange} />

      {/* List */}
      <DataGrid
        rows={templates}
        columns={[
          { field: 'name', headerName: 'Name', flex: 1 },
          { field: 'category', headerName: 'Category', width: 120 },
          { field: 'usageCount', headerName: 'Uses', width: 80 },
          {
            field: 'actions',
            headerName: 'Actions',
            width: 150,
            renderCell: (template) => (
              <Box>
                <IconButton onClick={() => editTemplate(template)}>
                  <EditIcon />
                </IconButton>
                <IconButton onClick={() => shareTemplate(template)}>
                  <ShareIcon />
                </IconButton>
                <IconButton onClick={() => deleteTemplate(template.templateId)}>
                  <DeleteIcon />
                </IconButton>
              </Box>
            )
          }
        ]}
        pagination={pagination}
        loading={loading}
      />
    </Box>
  );
}
```

### TemplateEditorView Component
```typescript
// fakemui/react/components/email/TemplateEditorView.tsx
export function TemplateEditorView({ template }: { template: EmailTemplate }) {
  const [formData, setFormData] = useState(template);
  const [preview, setPreview] = useState<ExpandedTemplate | null>(null);

  const handleSubjectChange = (subject: string) => {
    setFormData(prev => ({ ...prev, subject }));
  };

  const handleBodyChange = (bodyText: string, bodyHtml?: string) => {
    setFormData(prev => ({ ...prev, bodyText, bodyHtml }));
  };

  const handlePreview = async () => {
    const expanded = await expandTemplate(template.templateId, {
      name: 'John Doe',
      date: new Date().toISOString().split('T')[0],
      recipient: 'john@example.com'
    });
    setPreview(expanded);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        {/* Form inputs */}
        <TextField
          label="Template Name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          fullWidth
        />
        <TextField
          label="Subject"
          value={formData.subject}
          onChange={e => handleSubjectChange(e.target.value)}
          fullWidth
          multiline
        />
        <TextField
          label="Body (Text)"
          value={formData.bodyText}
          onChange={e => handleBodyChange(e.target.value)}
          fullWidth
          multiline
          minRows={6}
        />
        <Button onClick={handlePreview}>Preview</Button>
      </Grid>
      <Grid item xs={6}>
        {/* Preview */}
        {preview && (
          <Box sx={{ border: '1px solid #ccc', p: 2 }}>
            <Typography variant="h6">{preview.subject}</Typography>
            <Typography>{preview.bodyText}</Typography>
          </Box>
        )}
        {/* Variables list */}
        <Box mt={2}>
          <Typography variant="subtitle2">Variables</Typography>
          {formData.variables.map(v => (
            <Chip key={v.name} label={v.placeholder} />
          ))}
        </Box>
      </Grid>
    </Grid>
  );
}
```

### TemplateSharingDialog Component
```typescript
// fakemui/react/components/email/TemplateSharingDialog.tsx
export function TemplateSharingDialog({
  template,
  open,
  onClose
}: {
  template: EmailTemplate;
  open: boolean;
  onClose: () => void;
}) {
  const [shareEmail, setShareEmail] = useState('');
  const [permission, setPermission] = useState<'view' | 'edit' | 'admin'>('view');

  const handleShare = async () => {
    await shareTemplate(template.templateId, shareEmail, permission);
    setShareEmail('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Share Template</DialogTitle>
      <DialogContent>
        <TextField
          label="Email Address"
          value={shareEmail}
          onChange={e => setShareEmail(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Select
          value={permission}
          onChange={e => setPermission(e.target.value as any)}
          fullWidth
        >
          <MenuItem value="view">View Only</MenuItem>
          <MenuItem value="edit">Edit</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </Select>

        <Typography variant="subtitle2" sx={{ mt: 2 }}>Shared With</Typography>
        {template.sharedWith.map(share => (
          <Box key={share.userId} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography>{share.email}</Typography>
            <Chip label={share.permission} size="small" />
            <IconButton onClick={() => unshareTemplate(template.templateId, share.userId)}>
              <DeleteIcon />
            </IconButton>
          </Box>
        ))}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleShare} variant="contained">Share</Button>
      </DialogActions>
    </Dialog>
  );
}
```

## Workflow Integration

### Template Management Workflow
```typescript
// packages/email_client/workflows/template-management.jsonscript
{
  "version": "2.2.0",
  "name": "email-template-management",
  "description": "Email template management workflow",
  "nodes": [
    {
      "id": "create-template",
      "type": "template-manager",
      "parameters": {
        "action": "create",
        "accountId": "{{ $context.accountId }}",
        "template": {
          "name": "{{ $input.name }}",
          "subject": "{{ $input.subject }}",
          "bodyText": "{{ $input.bodyText }}",
          "bodyHtml": "{{ $input.bodyHtml }}",
          "category": "{{ $input.category }}",
          "tags": "{{ $input.tags }}"
        }
      }
    },
    {
      "id": "expand-template",
      "type": "template-manager",
      "parameters": {
        "action": "expand",
        "accountId": "{{ $context.accountId }}",
        "templateId": "{{ $input.templateId }}",
        "variableValues": "{{ $input.variables }}"
      }
    }
  ]
}
```

### Compose Workflow
```typescript
// packages/email_client/workflows/compose-with-template.jsonscript
{
  "version": "2.2.0",
  "name": "compose-with-template",
  "description": "Compose email with template expansion",
  "nodes": [
    {
      "id": "expand-template",
      "type": "template-manager",
      "parameters": {
        "action": "expand",
        "accountId": "{{ $context.accountId }}",
        "templateId": "{{ $input.templateId }}",
        "variableValues": "{{ $input.variables }}"
      }
    },
    {
      "id": "track-usage",
      "type": "template-manager",
      "parameters": {
        "action": "track-usage",
        "accountId": "{{ $context.accountId }}",
        "templateId": "{{ $input.templateId }}",
        "variableValues": "{{ $input.variables }}"
      }
    },
    {
      "id": "send-email",
      "type": "smtp-send",
      "parameters": {
        "from": "{{ $context.userEmail }}",
        "to": "{{ $nodes.expand-template.output.variables.recipient }}",
        "subject": "{{ $nodes.expand-template.output.expandedTemplate.subject }}",
        "htmlBody": "{{ $nodes.expand-template.output.expandedTemplate.bodyHtml }}",
        "textBody": "{{ $nodes.expand-template.output.expandedTemplate.bodyText }}"
      }
    }
  ]
}
```

## Workflow Plugin Registration

Register the template manager in the email plugins index:

```typescript
// workflow/plugins/ts/email-plugins.ts
import {
  templateManagerExecutor,
  TemplateManagerExecutor
} from './integration/email/template-manager/src/index';

export const EMAIL_PLUGINS = {
  'template-manager': templateManagerExecutor,
  // ... other plugins
};
```

## Development Workflow

### 1. Create Template
```
User → FakeMUI TemplateEditorView → Redux → useEmailTemplates Hook →
TemplateManagerExecutor (create) → DBAL → Database → Success
```

### 2. Apply Template in Compose
```
User → ComposerLayout → useTemplateCompose Hook → TemplateManagerExecutor (expand) →
Redux (emailComposeSlice) → ComposeWindow (auto-filled) → SMTP Send
```

### 3. Share Template
```
User → TemplateSharingDialog → Redux → useEmailTemplates Hook →
TemplateManagerExecutor (share) → DBAL → Database → Template Share Entity
```

### 4. Track Usage
```
Template Expansion → useTemplateCompose Hook → TemplateManagerExecutor (track-usage) →
DBAL → Database → Template Usage Entity → Analytics
```

## Testing Strategy

### Unit Tests
- Template CRUD operations
- Variable extraction and expansion
- Permission checks
- Error handling

### Integration Tests
- Redux integration
- Hook functionality
- DBAL entity operations
- Multi-tenant isolation

### E2E Tests
- Create template → Share → Expand → Send
- Template list filtering and pagination
- Usage tracking and analytics

## Performance Optimization

1. **Template Caching**: In-memory cache for frequently accessed templates
2. **Lazy Loading**: Load templates on-demand for list views
3. **Pagination**: Limit list results to 20 per page
4. **Usage Batch**: Aggregate usage tracking into hourly batches
5. **Indexing**: Database indexes on tenantId, category, isPublic

## Security Considerations

1. **Multi-Tenant Isolation**: All queries filter by tenantId
2. **ACL Enforcement**: Permission checks on every operation
3. **Soft Delete**: Preserve data without hard deletion
4. **Audit Logging**: Track all sharing changes
5. **Variable Sanitization**: No code injection in variable values

## Monitoring & Observability

### Metrics
- Templates created/updated/deleted
- Template expansion count
- Sharing operations
- Usage statistics trends
- Error rates by operation

### Logging
- Template lifecycle events
- Permission denials
- Performance metrics
- Integration issues

## Related Documentation

- [Template Manager README](./README.md)
- [Phase 6 Email Client Plan](../../../../docs/plans/2026-01-23-email-client-implementation.md)
- [DBAL Entity Schemas](../../../../dbal/shared/api/schema/entities/packages/)
- [Redux Email Slices](../../../../redux/email/)
- [FakeMUI Components](../../../../fakemui/react/components/email/)

---

**Phase 6 - Architecture Integration Complete**
**Last Updated**: 2026-01-24
