# Template Manager - Usage Examples

Practical examples for using the Template Manager plugin in various scenarios.

## Table of Contents

1. [Basic Operations](#basic-operations)
2. [Variable Usage](#variable-usage)
3. [Sharing & Permissions](#sharing--permissions)
4. [Compose Integration](#compose-integration)
5. [Analytics & Tracking](#analytics--tracking)
6. [Advanced Workflows](#advanced-workflows)

## Basic Operations

### Example 1: Create a Simple Template

```typescript
import { TemplateManagerExecutor, type TemplateManagerConfig } from '@metabuilder/plugin-template-manager';

const executor = new TemplateManagerExecutor();

const config: TemplateManagerConfig = {
  action: 'create',
  accountId: 'acc-user-123',
  template: {
    name: 'Quick Reply',
    description: 'Quick response to common inquiries',
    subject: 'Re: {{subject}}',
    bodyText: 'Thank you for reaching out!\n\nI appreciate your interest.\n\nBest regards',
    category: 'responses',
    tags: ['quick', 'reply'],
    isPublic: false
  }
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  const template = result.output.template;
  console.log(`Template created: ${template.templateId}`);
  console.log(`Variables found: ${template.variables.map(v => v.placeholder).join(', ')}`);
}
```

### Example 2: Update a Template

```typescript
const updateConfig: TemplateManagerConfig = {
  action: 'update',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123',
  template: {
    subject: 'Updated Subject: {{subject}}',
    bodyText: 'Updated body text with {{name}}',
    tags: ['updated', 'improved']
  }
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  const updated = result.output.template;
  console.log(`Template version: ${updated.version}`);
  console.log(`Variables: ${updated.variables.length}`);
}
```

### Example 3: List Templates by Category

```typescript
const listConfig: TemplateManagerConfig = {
  action: 'list',
  accountId: 'acc-user-123',
  filters: {
    category: 'greetings',
    isPublic: false
  },
  pagination: {
    page: 1,
    pageSize: 10
  }
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  const templates = result.output.templates;
  console.log(`Found ${templates.length} greeting templates`);
  templates.forEach(t => {
    console.log(`- ${t.name} (${t.usageCount} uses)`);
  });
}
```

### Example 4: Delete and Recover

```typescript
// Soft delete
const deleteConfig: TemplateManagerConfig = {
  action: 'delete',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123'
};

await executor.execute(mockNode, context, state);

// Later, recover it
const recoverConfig: TemplateManagerConfig = {
  action: 'recover',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123'
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  console.log('Template recovered');
}
```

## Variable Usage

### Example 5: Template with Multiple Variables

```typescript
const config: TemplateManagerConfig = {
  action: 'create',
  accountId: 'acc-user-123',
  template: {
    name: 'Meeting Confirmation',
    subject: 'Meeting Confirmation: {{meetingTitle}} - {{date}}',
    bodyText: `Dear {{attendeeName}},

This is to confirm your participation in:

Meeting: {{meetingTitle}}
Date: {{meetingDate}}
Time: {{meetingTime}}
Location: {{location}}
Organizer: {{organizerName}}

Please come prepared with the following materials:
- {{material1}}
- {{material2}}
- {{material3}}

If you have any questions, please contact {{organizerName}} at {{organizerEmail}}.

Best regards,
{{senderName}}`,
    category: 'responses'
  }
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  const template = result.output.template;
  const varList = template.variables.map(v => v.name).join(', ');
  console.log(`Variables: ${varList}`);
  // Output: Variables: name, date, recipient, attendeeName, meetingTitle,
  //                   meetingDate, meetingTime, location, organizerName,
  //                   material1, material2, material3, senderName, organizerEmail
}
```

### Example 6: Expand Template with Variables

```typescript
const expandConfig: TemplateManagerConfig = {
  action: 'expand',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123',
  variableValues: {
    attendeeName: 'John Smith',
    meetingTitle: 'Q1 Planning Session',
    meetingDate: '2026-02-15',
    meetingTime: '2:00 PM EST',
    location: 'Conference Room A',
    organizerName: 'Jane Doe',
    material1: 'Budget Spreadsheet',
    material2: 'Project Timeline',
    material3: 'Risk Assessment',
    senderName: 'John Smith',
    organizerEmail: 'jane.doe@company.com'
  }
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  const expanded = result.output.expandedTemplate;
  console.log('Subject:', expanded.subject);
  // Output: Subject: Meeting Confirmation: Q1 Planning Session - 2026-02-15
  console.log('Body preview:', expanded.bodyText.substring(0, 100) + '...');
}
```

### Example 7: Partial Variable Substitution

```typescript
const expandConfig: TemplateManagerConfig = {
  action: 'expand',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123',
  variableValues: {
    attendeeName: 'John Smith',
    organizerName: 'Jane Doe'
    // Other variables will use defaults or remain as placeholders
  }
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  const expanded = result.output.expandedTemplate;
  console.log('Missing variables:', expanded.missingVariables);
  // User can fill in missing variables in compose form
}
```

## Sharing & Permissions

### Example 8: Share Template with Team

```typescript
// Share with view permission
const shareConfig: TemplateManagerConfig = {
  action: 'share',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123',
  shareWithUserId: 'user-456',
  sharePermission: 'view'
};

let result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  console.log('Template shared for view only');
}

// Later, upgrade to edit permission
const shareConfig2: TemplateManagerConfig = {
  action: 'share',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123',
  shareWithUserId: 'user-456',
  sharePermission: 'edit'
};

result = await executor.execute(mockNode, context, state);
if (result.status === 'success') {
  console.log('Permission upgraded to edit');
}
```

### Example 9: Share Multiple Templates

```typescript
const teamMemberIds = ['user-456', 'user-789', 'user-012'];
const templateIds = ['tmpl-abc123', 'tmpl-def456', 'tmpl-ghi789'];

for (const templateId of templateIds) {
  for (const userId of teamMemberIds) {
    const config: TemplateManagerConfig = {
      action: 'share',
      accountId: 'acc-user-123',
      templateId,
      shareWithUserId: userId,
      sharePermission: 'view'
    };

    await executor.execute(mockNode, context, state);
  }
}

console.log('Shared 3 templates with 3 team members');
```

### Example 10: Unshare and Manage Access

```typescript
// Get template to see who it's shared with
const getConfig: TemplateManagerConfig = {
  action: 'get',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123'
};

let result = await executor.execute(mockNode, context, state);
const template = result.output.template;

console.log('Shared with:');
template.sharedWith.forEach(share => {
  console.log(`- ${share.email}: ${share.permission}`);
});

// Unshare with specific user
const unshareConfig: TemplateManagerConfig = {
  action: 'unshare',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123',
  shareWithUserId: 'user-456'
};

result = await executor.execute(mockNode, context, state);
if (result.status === 'success') {
  console.log('Template unshared from user-456');
}
```

## Compose Integration

### Example 11: Apply Template in Compose

```typescript
// User selects template in compose
const templateId = 'tmpl-welcome-123';

// Step 1: Get template
const getConfig: TemplateManagerConfig = {
  action: 'get',
  accountId: 'acc-user-123',
  templateId
};

let result = await executor.execute(mockNode, context, state);
const template = result.output.template;

// Step 2: Show variable input form
console.log('Required variables:');
template.variables.forEach(v => {
  if (v.required) {
    console.log(`- ${v.name}: ${v.description}`);
  }
});

// Step 3: User fills in variables and clicks "Insert"
const userVariables = {
  name: 'Alice Johnson',
  company: 'TechCorp',
  date: '2026-02-01'
};

// Step 4: Expand template
const expandConfig: TemplateManagerConfig = {
  action: 'expand',
  accountId: 'acc-user-123',
  templateId,
  variableValues: userVariables
};

result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  const expanded = result.output.expandedTemplate;

  // Step 5: Insert into compose
  composeForm.subject = expanded.subject;
  composeForm.bodyText = expanded.bodyText;
  composeForm.bodyHtml = expanded.bodyHtml;

  console.log('Template applied to compose');
}
```

### Example 12: Template Preview Before Applying

```typescript
const templateId = 'tmpl-abc123';

// Get template with sample data for preview
const sampleVariables = {
  name: '[Recipient Name]',
  company: '[Company Name]',
  date: new Date().toISOString().split('T')[0]
};

const expandConfig: TemplateManagerConfig = {
  action: 'expand',
  accountId: 'acc-user-123',
  templateId,
  variableValues: sampleVariables
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  const expanded = result.output.expandedTemplate;

  // Show preview in modal
  showPreviewModal({
    title: 'Template Preview',
    subject: expanded.subject,
    body: expanded.bodyText,
    onConfirm: () => {
      // Apply to compose
    }
  });
}
```

## Analytics & Tracking

### Example 13: Track Template Usage

```typescript
// Automatically called when template is expanded
const trackConfig: TemplateManagerConfig = {
  action: 'track-usage',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123',
  variableValues: {
    name: 'John Smith',
    date: '2026-01-30',
    recipient: 'john@example.com'
  }
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  console.log('Usage tracked');
}
```

### Example 14: Get Usage Statistics

```typescript
const statsConfig: TemplateManagerConfig = {
  action: 'get-usage-stats',
  accountId: 'acc-user-123',
  templateId: 'tmpl-abc123'
};

const result = await executor.execute(mockNode, context, state);

if (result.status === 'success') {
  const stats = result.output.usageStats;

  console.log(`Total uses: ${stats.totalUsage}`);
  console.log(`Last used: ${new Date(stats.lastUsedAt).toLocaleDateString()}`);
  console.log(`Average variables: ${stats.averageVariableCount.toFixed(1)}`);

  console.log('Top variables:');
  stats.topVariables.forEach((v, idx) => {
    console.log(`${idx + 1}. {{${v.name}}}: ${v.usageCount} times`);
  });
}
```

### Example 15: Identify Popular Templates

```typescript
// List all templates
const listConfig: TemplateManagerConfig = {
  action: 'list',
  accountId: 'acc-user-123',
  pagination: { page: 1, pageSize: 100 }
};

let result = await executor.execute(mockNode, context, state);
let allTemplates = result.output.templates;

// Get stats for each
const templateStats = await Promise.all(
  allTemplates.map(async t => {
    const statsConfig: TemplateManagerConfig = {
      action: 'get-usage-stats',
      accountId: 'acc-user-123',
      templateId: t.templateId
    };

    const statsResult = await executor.execute(mockNode, context, state);
    return {
      name: t.name,
      usageCount: statsResult.output.usageStats.totalUsage,
      lastUsed: statsResult.output.usageStats.lastUsedAt
    };
  })
);

// Sort by usage
templateStats.sort((a, b) => b.usageCount - a.usageCount);

console.log('Top templates:');
templateStats.slice(0, 5).forEach((t, idx) => {
  console.log(`${idx + 1}. ${t.name}: ${t.usageCount} uses`);
});
```

## Advanced Workflows

### Example 16: Template Workflow in JSON Script

```typescript
// packages/email_client/workflows/template-compose-send.jsonscript
{
  "version": "2.2.0",
  "name": "compose-with-template-and-send",
  "description": "Complete workflow: expand template, track usage, and send email",

  "nodes": [
    {
      "id": "expand_template",
      "type": "template-manager",
      "parameters": {
        "action": "expand",
        "accountId": "{{ $context.accountId }}",
        "templateId": "{{ $input.templateId }}",
        "variableValues": "{{ $input.variables }}"
      }
    },
    {
      "id": "track_usage",
      "type": "template-manager",
      "parameters": {
        "action": "track-usage",
        "accountId": "{{ $context.accountId }}",
        "templateId": "{{ $input.templateId }}",
        "variableValues": "{{ $input.variables }}"
      },
      "dependsOn": ["expand_template"]
    },
    {
      "id": "send_email",
      "type": "smtp-send",
      "parameters": {
        "from": "{{ $context.userEmail }}",
        "to": ["{{ $input.recipientEmail }}"],
        "subject": "{{ $nodes.expand_template.output.expandedTemplate.subject }}",
        "htmlBody": "{{ $nodes.expand_template.output.expandedTemplate.bodyHtml }}",
        "textBody": "{{ $nodes.expand_template.output.expandedTemplate.bodyText }}"
      },
      "dependsOn": ["expand_template"]
    }
  ]
}
```

### Example 17: Batch Template Operations

```typescript
async function batchUpdateTemplates(
  templateIds: string[],
  updates: Partial<EmailTemplate>
) {
  const results = await Promise.all(
    templateIds.map(templateId => {
      const config: TemplateManagerConfig = {
        action: 'update',
        accountId: 'acc-user-123',
        templateId,
        template: updates
      };
      return executor.execute(mockNode, context, state);
    })
  );

  const successful = results.filter(r => r.status === 'success').length;
  const failed = results.filter(r => r.status === 'error').length;

  console.log(`Updated ${successful} templates, ${failed} failed`);

  return results;
}

// Usage
await batchUpdateTemplates(
  ['tmpl-1', 'tmpl-2', 'tmpl-3'],
  {
    category: 'responses',
    tags: ['updated', 'q1-2026']
  }
);
```

### Example 18: Search and Migrate Templates

```typescript
// Find all templates with old variable format
const listConfig: TemplateManagerConfig = {
  action: 'list',
  accountId: 'acc-user-123',
  filters: {
    searchText: '<%'  // Old format
  }
};

let result = await executor.execute(mockNode, context, state);
const oldTemplates = result.output.templates;

// Migrate to new format
for (const template of oldTemplates) {
  const newBodyText = template.bodyText
    .replace(/<%(\w+)%>/g, '{{$1}}');  // Convert <% var %> to {{ var }}

  const updateConfig: TemplateManagerConfig = {
    action: 'update',
    accountId: 'acc-user-123',
    templateId: template.templateId,
    template: { bodyText: newBodyText }
  };

  await executor.execute(mockNode, context, state);
}

console.log(`Migrated ${oldTemplates.length} templates`);
```

### Example 19: Template Duplication

```typescript
async function duplicateTemplate(
  sourceTemplateId: string,
  newName: string
) {
  // Get source
  const getConfig: TemplateManagerConfig = {
    action: 'get',
    accountId: 'acc-user-123',
    templateId: sourceTemplateId
  };

  let result = await executor.execute(mockNode, context, state);
  const source = result.output.template;

  // Create copy
  const createConfig: TemplateManagerConfig = {
    action: 'create',
    accountId: 'acc-user-123',
    template: {
      name: newName,
      subject: source.subject,
      bodyText: source.bodyText,
      bodyHtml: source.bodyHtml,
      category: source.category,
      tags: [...(source.tags || []), 'duplicate']
    }
  };

  result = await executor.execute(mockNode, context, state);
  return result.output.template;
}

// Usage
const copy = await duplicateTemplate(
  'tmpl-original',
  'Original (Copy)'
);
console.log(`Created copy: ${copy.templateId}`);
```

### Example 20: Generate Report

```typescript
async function generateTemplateReport(accountId: string) {
  // Get all templates
  const listConfig: TemplateManagerConfig = {
    action: 'list',
    accountId,
    pagination: { page: 1, pageSize: 1000 }
  };

  let result = await executor.execute(mockNode, context, state);
  const templates = result.output.templates;

  // Build report
  const report = {
    generatedAt: new Date().toISOString(),
    totalTemplates: templates.length,
    byCategory: {} as Record<string, number>,
    byOwner: {} as Record<string, number>,
    usageStats: {
      totalUses: 0,
      averageUsage: 0,
      mostUsed: null as EmailTemplate | null
    }
  };

  for (const template of templates) {
    // Count by category
    report.byCategory[template.category] = (report.byCategory[template.category] || 0) + 1;

    // Count by owner
    report.byOwner[template.ownerId] = (report.byOwner[template.ownerId] || 0) + 1;

    // Track most used
    report.usageStats.totalUses += template.usageCount;
    if (!report.usageStats.mostUsed || template.usageCount > report.usageStats.mostUsed.usageCount) {
      report.usageStats.mostUsed = template;
    }
  }

  report.usageStats.averageUsage = Math.round(report.usageStats.totalUses / templates.length);

  return report;
}

// Usage
const report = await generateTemplateReport('acc-user-123');
console.log(JSON.stringify(report, null, 2));
```

---

**Phase 6 - Complete Examples**
**Last Updated**: 2026-01-24
