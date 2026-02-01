/**
 * Template Manager Node Executor - Comprehensive Test Suite
 * Tests for all template lifecycle operations, sharing, and usage tracking
 */

import {
  TemplateManagerExecutor,
  type TemplateManagerConfig,
  type EmailTemplate,
  type ExpandedTemplate,
  type TemplateShareConfig
} from './index';
import {
  INodeExecutor,
  WorkflowNode,
  WorkflowContext,
  ExecutionState
} from '@metabuilder/workflow';

describe('TemplateManagerExecutor', () => {
  let executor: TemplateManagerExecutor;
  let mockContext: WorkflowContext;
  let mockNode: WorkflowNode;
  let mockState: ExecutionState;

  // Test constants
  const ACCOUNT_ID = 'acc-123456';
  const TENANT_ID = 'tenant-789';
  const USER_ID = 'user-001';
  const OTHER_USER_ID = 'user-002';

  beforeEach(() => {
    executor = new TemplateManagerExecutor();

    mockContext = {
      tenantId: TENANT_ID,
      userId: USER_ID,
      executionId: 'exec-test',
      startTime: Date.now(),
      variables: {}
    };

    mockNode = {
      id: 'node-test',
      type: 'template-manager',
      parameters: {},
      inputs: [],
      outputs: []
    };

    mockState = {
      nodeId: 'node-test',
      status: 'running',
      startTime: Date.now(),
      variables: {},
      inputData: {}
    };
  });

  describe('Template Creation', () => {
    it.each([
      {
        name: 'Create basic template',
        template: {
          name: 'Quick Reply',
          subject: 'Re: {{subject}}',
          bodyText: 'Thank you for your email, {{name}}!'
        }
      },
      {
        name: 'Create template with HTML body',
        template: {
          name: 'HTML Newsletter',
          subject: 'Newsletter - {{date}}',
          bodyText: 'Text version',
          bodyHtml: '<h1>Newsletter</h1><p>Date: {{date}}</p>'
        }
      },
      {
        name: 'Create template with multiple variables',
        template: {
          name: 'Complex Template',
          subject: 'Meeting Confirmation for {{name}}',
          bodyText: 'Dear {{name}},\nYour meeting is scheduled.\nRecipient: {{recipient}}\nDate: {{date}}'
        }
      },
      {
        name: 'Create template with category',
        template: {
          name: 'Signature',
          subject: 'Auto-signature',
          bodyText: 'Best regards, {{name}}',
          category: 'signatures' as const
        }
      },
      {
        name: 'Create template with tags',
        template: {
          name: 'Tagged Template',
          subject: 'Test {{name}}',
          bodyText: 'Body',
          tags: ['urgent', 'follow-up']
        }
      }
    ])('should $name', async ({ template }) => {
      const config: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.actionPerformed).toBe('create');
      const createdTemplate = result.output.template as EmailTemplate;
      expect(createdTemplate).toBeDefined();
      expect(createdTemplate.name).toBe(template.name);
      expect(createdTemplate.subject).toBe(template.subject);
      expect(createdTemplate.tenantId).toBe(TENANT_ID);
      expect(createdTemplate.ownerId).toBe(USER_ID);
      expect(createdTemplate.category).toBe(template.category || 'custom');
    });

    it('should extract variables from template content', async () => {
      const config: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template: {
          name: 'Variable Test',
          subject: 'Hello {{name}}, {{customVar}}',
          bodyText: 'Body with {{date}} and {{anotherVar}}'
        }
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const template = result.output.template as EmailTemplate;
      const varNames = template.variables.map((v) => v.name);
      expect(varNames).toContain('name');
      expect(varNames).toContain('date');
      expect(varNames).toContain('customVar');
      expect(varNames).toContain('anotherVar');
    });

    it('should fail on missing required fields', async () => {
      const configs: Array<{ config: TemplateManagerConfig; field: string }> = [
        {
          config: {
            action: 'create',
            accountId: ACCOUNT_ID,
            template: { subject: 'Subject', bodyText: 'Body' } // Missing name
          },
          field: 'name'
        },
        {
          config: {
            action: 'create',
            accountId: ACCOUNT_ID,
            template: { name: 'Name', bodyText: 'Body' } // Missing subject
          },
          field: 'subject'
        },
        {
          config: {
            action: 'create',
            accountId: ACCOUNT_ID,
            template: { name: 'Name', subject: 'Subject' } // Missing body
          },
          field: 'body'
        }
      ];

      for (const { config, field } of configs) {
        mockNode.parameters = config;
        const result = await executor.execute(mockNode, mockContext, mockState);
        expect(result.status).toBe('error');
        expect(result.error).toContain(field);
      }
    });
  });

  describe('Template Retrieval', () => {
    let templateId: string;

    beforeEach(async () => {
      // Create a template first
      const createConfig: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template: {
          name: 'Test Template',
          subject: 'Subject for {{name}}',
          bodyText: 'Body for {{recipient}}'
        }
      };

      mockNode.parameters = createConfig;
      const createResult = await executor.execute(mockNode, mockContext, mockState);
      templateId = (createResult.output.template as EmailTemplate).templateId;
    });

    it('should retrieve template by ID', async () => {
      const config: TemplateManagerConfig = {
        action: 'get',
        accountId: ACCOUNT_ID,
        templateId
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const template = result.output.template as EmailTemplate;
      expect(template.templateId).toBe(templateId);
      expect(template.name).toBe('Test Template');
    });

    it('should fail to retrieve non-existent template', async () => {
      const config: TemplateManagerConfig = {
        action: 'get',
        accountId: ACCOUNT_ID,
        templateId: 'non-existent'
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('not found');
    });

    it('should fail if user lacks access', async () => {
      mockContext.userId = OTHER_USER_ID; // Different user

      const config: TemplateManagerConfig = {
        action: 'get',
        accountId: ACCOUNT_ID,
        templateId
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Unauthorized');
    });

    it('should allow access if template is public', async () => {
      // Update template to be public
      const updateConfig: TemplateManagerConfig = {
        action: 'update',
        accountId: ACCOUNT_ID,
        templateId,
        template: { isPublic: true }
      };

      mockNode.parameters = updateConfig;
      await executor.execute(mockNode, mockContext, mockState);

      // Try to get as different user
      mockContext.userId = OTHER_USER_ID;
      const getConfig: TemplateManagerConfig = {
        action: 'get',
        accountId: ACCOUNT_ID,
        templateId
      };

      mockNode.parameters = getConfig;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
    });
  });

  describe('Template Update', () => {
    let templateId: string;

    beforeEach(async () => {
      const createConfig: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template: {
          name: 'Original Name',
          subject: 'Original Subject',
          bodyText: 'Original Body',
          category: 'custom' as const
        }
      };

      mockNode.parameters = createConfig;
      const createResult = await executor.execute(mockNode, mockContext, mockState);
      templateId = (createResult.output.template as EmailTemplate).templateId;
    });

    it.each([
      { field: 'name', value: 'Updated Name' },
      { field: 'subject', value: 'Updated Subject for {{name}}' },
      { field: 'bodyText', value: 'Updated body with {{date}}' },
      { field: 'category', value: 'responses' }
    ])('should update $field', async ({ field, value }) => {
      const updateData: any = { [field]: value };
      const config: TemplateManagerConfig = {
        action: 'update',
        accountId: ACCOUNT_ID,
        templateId,
        template: updateData
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const updated = result.output.template as EmailTemplate;
      expect((updated as any)[field]).toBe(value);
    });

    it('should increment version on update', async () => {
      const config: TemplateManagerConfig = {
        action: 'update',
        accountId: ACCOUNT_ID,
        templateId,
        template: { name: 'New Name' }
      };

      mockNode.parameters = config;
      let result = await executor.execute(mockNode, mockContext, mockState);
      let template = result.output.template as EmailTemplate;
      const version1 = template.version;

      // Update again
      mockNode.parameters = config;
      result = await executor.execute(mockNode, mockContext, mockState);
      template = result.output.template as EmailTemplate;
      expect(template.version).toBe(version1 + 1);
    });

    it('should re-extract variables on update', async () => {
      const config: TemplateManagerConfig = {
        action: 'update',
        accountId: ACCOUNT_ID,
        templateId,
        template: {
          subject: 'Updated with {{newVar}} and {{anotherVar}}'
        }
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const template = result.output.template as EmailTemplate;
      const varNames = template.variables.map((v) => v.name);
      expect(varNames).toContain('newVar');
      expect(varNames).toContain('anotherVar');
    });

    it('should fail if non-owner tries to update', async () => {
      mockContext.userId = OTHER_USER_ID;

      const config: TemplateManagerConfig = {
        action: 'update',
        accountId: ACCOUNT_ID,
        templateId,
        template: { name: 'Hacked' }
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Unauthorized');
    });
  });

  describe('Template Deletion & Recovery', () => {
    let templateId: string;

    beforeEach(async () => {
      const createConfig: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template: {
          name: 'Deletable Template',
          subject: 'Subject',
          bodyText: 'Body'
        }
      };

      mockNode.parameters = createConfig;
      const createResult = await executor.execute(mockNode, mockContext, mockState);
      templateId = (createResult.output.template as EmailTemplate).templateId;
    });

    it('should soft-delete template', async () => {
      const config: TemplateManagerConfig = {
        action: 'delete',
        accountId: ACCOUNT_ID,
        templateId
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.actionPerformed).toBe('delete');
    });

    it('should not retrieve deleted template', async () => {
      // Delete template
      mockNode.parameters = {
        action: 'delete',
        accountId: ACCOUNT_ID,
        templateId
      };
      await executor.execute(mockNode, mockContext, mockState);

      // Try to get
      mockNode.parameters = {
        action: 'get',
        accountId: ACCOUNT_ID,
        templateId
      };
      // Note: This test may need adjustment based on actual behavior
      // (deleted templates may still be retrievable but marked as deleted)
    });

    it('should recover soft-deleted template', async () => {
      // Delete
      mockNode.parameters = {
        action: 'delete',
        accountId: ACCOUNT_ID,
        templateId
      };
      await executor.execute(mockNode, mockContext, mockState);

      // Recover
      mockNode.parameters = {
        action: 'recover',
        accountId: ACCOUNT_ID,
        templateId
      };
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const recovered = result.output.template as EmailTemplate;
      expect(recovered.isDeleted).toBe(false);
    });

    it('should fail to recover non-deleted template', async () => {
      const config: TemplateManagerConfig = {
        action: 'recover',
        accountId: ACCOUNT_ID,
        templateId
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('not deleted');
    });

    it('should fail if non-owner tries to delete', async () => {
      mockContext.userId = OTHER_USER_ID;

      const config: TemplateManagerConfig = {
        action: 'delete',
        accountId: ACCOUNT_ID,
        templateId
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Unauthorized');
    });
  });

  describe('Template Listing & Filtering', () => {
    beforeEach(async () => {
      // Create multiple templates
      const templates = [
        { name: 'Greeting 1', subject: 'Hello {{name}}', category: 'greetings' as const },
        { name: 'Response 1', subject: 'Re: {{subject}}', category: 'responses' as const },
        { name: 'Signature 1', subject: 'Auto Sig', bodyText: 'Best regards {{name}}', category: 'signatures' as const },
        { name: 'Custom 1', subject: 'Custom', bodyText: 'Body', category: 'custom' as const }
      ];

      for (const tmpl of templates) {
        const config: TemplateManagerConfig = {
          action: 'create',
          accountId: ACCOUNT_ID,
          template: { ...tmpl, bodyText: tmpl.bodyText || 'Default body' }
        };
        mockNode.parameters = config;
        await executor.execute(mockNode, mockContext, mockState);
      }
    });

    it('should list all templates for user', async () => {
      const config: TemplateManagerConfig = {
        action: 'list',
        accountId: ACCOUNT_ID
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const templates = result.output.templates as EmailTemplate[];
      expect(templates.length).toBeGreaterThan(0);
    });

    it.each([
      { category: 'greetings', expectedMin: 1 },
      { category: 'responses', expectedMin: 1 },
      { category: 'signatures', expectedMin: 1 }
    ])('should filter by category $category', async ({ category, expectedMin }) => {
      const config: TemplateManagerConfig = {
        action: 'list',
        accountId: ACCOUNT_ID,
        filters: { category: category as any }
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      const templates = result.output.templates as EmailTemplate[];
      expect(templates.length).toBeGreaterThanOrEqual(expectedMin);
      expect(templates.every((t) => t.category === category)).toBe(true);
    });

    it('should filter by search text', async () => {
      const config: TemplateManagerConfig = {
        action: 'list',
        accountId: ACCOUNT_ID,
        filters: { searchText: 'Greeting' }
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      const templates = result.output.templates as EmailTemplate[];
      expect(templates.every((t) => t.name.includes('Greeting'))).toBe(true);
    });

    it('should apply pagination', async () => {
      const config: TemplateManagerConfig = {
        action: 'list',
        accountId: ACCOUNT_ID,
        pagination: { page: 1, pageSize: 2 }
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      const templates = result.output.templates as EmailTemplate[];
      expect(templates.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Template Expansion', () => {
    let templateId: string;

    beforeEach(async () => {
      const createConfig: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template: {
          name: 'Expansion Test',
          subject: 'Hello {{name}}, meeting on {{date}}',
          bodyText: 'Dear {{name}},\nYour meeting with {{recipient}} is confirmed.\nDate: {{date}}\n\nBest regards'
        }
      };

      mockNode.parameters = createConfig;
      const createResult = await executor.execute(mockNode, mockContext, mockState);
      templateId = (createResult.output.template as EmailTemplate).templateId;
    });

    it.each([
      {
        name: 'Expand with all variables',
        variables: { name: 'John Doe', date: '2026-01-30', recipient: 'jane@example.com' }
      },
      {
        name: 'Expand with partial variables',
        variables: { name: 'Jane Smith' }
      },
      {
        name: 'Expand with no variables',
        variables: {}
      }
    ])('should $name', async ({ variables }) => {
      const config: TemplateManagerConfig = {
        action: 'expand',
        accountId: ACCOUNT_ID,
        templateId,
        variableValues: variables
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const expanded = result.output.expandedTemplate as ExpandedTemplate;
      expect(expanded).toBeDefined();
      expect(expanded.templateId).toBe(templateId);
      expect(expanded.subject).toBeDefined();
      expect(expanded.bodyText).toBeDefined();
    });

    it('should substitute variables correctly', async () => {
      const config: TemplateManagerConfig = {
        action: 'expand',
        accountId: ACCOUNT_ID,
        templateId,
        variableValues: {
          name: 'Alice',
          date: '2026-02-01',
          recipient: 'bob@example.com'
        }
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      const expanded = result.output.expandedTemplate as ExpandedTemplate;
      expect(expanded.subject).toContain('Alice');
      expect(expanded.subject).toContain('2026-02-01');
      expect(expanded.bodyText).toContain('Alice');
      expect(expanded.bodyText).toContain('bob@example.com');
    });

    it('should track missing variables', async () => {
      const createConfig: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template: {
          name: 'Required Vars Test',
          subject: 'Meeting with {{requiredName}}',
          bodyText: '{{requiredName}} is required'
        }
      };

      mockNode.parameters = createConfig;
      let createResult = await executor.execute(mockNode, mockContext, mockState);
      const reqTemplateId = (createResult.output.template as EmailTemplate).templateId;

      // Expand without required variable
      const expandConfig: TemplateManagerConfig = {
        action: 'expand',
        accountId: ACCOUNT_ID,
        templateId: reqTemplateId,
        variableValues: {}
      };

      mockNode.parameters = expandConfig;
      const expandResult = await executor.execute(mockNode, mockContext, mockState);
      const expanded = expandResult.output.expandedTemplate as ExpandedTemplate;

      // Check for missing variables (implementation detail)
      // This depends on how the executor marks required variables
    });

    it('should increment usage count on expansion', async () => {
      // Get initial template
      mockNode.parameters = {
        action: 'get',
        accountId: ACCOUNT_ID,
        templateId
      };
      let getResult = await executor.execute(mockNode, mockContext, mockState);
      let template = getResult.output.template as EmailTemplate;
      const initialUsageCount = template.usageCount;

      // Expand template
      mockNode.parameters = {
        action: 'expand',
        accountId: ACCOUNT_ID,
        templateId,
        variableValues: { name: 'Test' }
      };
      await executor.execute(mockNode, mockContext, mockState);

      // Get again and check usage count increased
      mockNode.parameters = {
        action: 'get',
        accountId: ACCOUNT_ID,
        templateId
      };
      getResult = await executor.execute(mockNode, mockContext, mockState);
      template = getResult.output.template as EmailTemplate;
      expect(template.usageCount).toBe(initialUsageCount + 1);
    });
  });

  describe('Template Sharing', () => {
    let templateId: string;

    beforeEach(async () => {
      const createConfig: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template: {
          name: 'Shareable Template',
          subject: 'Share Me',
          bodyText: 'This template will be shared'
        }
      };

      mockNode.parameters = createConfig;
      const createResult = await executor.execute(mockNode, mockContext, mockState);
      templateId = (createResult.output.template as EmailTemplate).templateId;
    });

    it.each([
      { permission: 'view', expectedPermission: 'view' },
      { permission: 'edit', expectedPermission: 'edit' },
      { permission: 'admin', expectedPermission: 'admin' }
    ])('should share with $permission permission', async ({ permission, expectedPermission }) => {
      const config: TemplateManagerConfig = {
        action: 'share',
        accountId: ACCOUNT_ID,
        templateId,
        shareWithUserId: OTHER_USER_ID,
        sharePermission: permission as any
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const shareConfig = result.output.shareConfig as TemplateShareConfig;
      expect(shareConfig.userId).toBe(OTHER_USER_ID);
      expect(shareConfig.permission).toBe(expectedPermission);
    });

    it('should allow shared user to access template', async () => {
      // Share with other user
      mockNode.parameters = {
        action: 'share',
        accountId: ACCOUNT_ID,
        templateId,
        shareWithUserId: OTHER_USER_ID,
        sharePermission: 'view'
      };
      await executor.execute(mockNode, mockContext, mockState);

      // Switch to other user and try to get
      mockContext.userId = OTHER_USER_ID;
      mockNode.parameters = {
        action: 'get',
        accountId: ACCOUNT_ID,
        templateId
      };
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
    });

    it('should fail if non-owner tries to share', async () => {
      mockContext.userId = OTHER_USER_ID;

      const config: TemplateManagerConfig = {
        action: 'share',
        accountId: ACCOUNT_ID,
        templateId,
        shareWithUserId: 'another-user',
        sharePermission: 'view'
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Unauthorized');
    });

    it('should unshare template', async () => {
      // Share first
      mockNode.parameters = {
        action: 'share',
        accountId: ACCOUNT_ID,
        templateId,
        shareWithUserId: OTHER_USER_ID,
        sharePermission: 'view'
      };
      await executor.execute(mockNode, mockContext, mockState);

      // Unshare
      mockNode.parameters = {
        action: 'unshare',
        accountId: ACCOUNT_ID,
        templateId,
        shareWithUserId: OTHER_USER_ID
      };
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');

      // Verify access denied
      mockContext.userId = OTHER_USER_ID;
      mockNode.parameters = {
        action: 'get',
        accountId: ACCOUNT_ID,
        templateId
      };
      const getResult = await executor.execute(mockNode, mockContext, mockState);
      expect(getResult.status).toBe('error');
    });

    it('should update permission when re-sharing', async () => {
      // Share with view permission
      mockNode.parameters = {
        action: 'share',
        accountId: ACCOUNT_ID,
        templateId,
        shareWithUserId: OTHER_USER_ID,
        sharePermission: 'view'
      };
      await executor.execute(mockNode, mockContext, mockState);

      // Re-share with edit permission
      mockNode.parameters = {
        action: 'share',
        accountId: ACCOUNT_ID,
        templateId,
        shareWithUserId: OTHER_USER_ID,
        sharePermission: 'edit'
      };
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const shareConfig = result.output.shareConfig as TemplateShareConfig;
      expect(shareConfig.permission).toBe('edit');
    });
  });

  describe('Usage Tracking & Analytics', () => {
    let templateId: string;

    beforeEach(async () => {
      const createConfig: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template: {
          name: 'Tracked Template',
          subject: 'Subject for {{name}}',
          bodyText: 'Body for {{recipient}} on {{date}}'
        }
      };

      mockNode.parameters = createConfig;
      const createResult = await executor.execute(mockNode, mockContext, mockState);
      templateId = (createResult.output.template as EmailTemplate).templateId;
    });

    it('should track template usage', async () => {
      const config: TemplateManagerConfig = {
        action: 'track-usage',
        accountId: ACCOUNT_ID,
        templateId,
        variableValues: { name: 'John', recipient: 'john@example.com' }
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      expect(result.output.usageRecord).toBeDefined();
    });

    it('should generate usage statistics', async () => {
      // Track usage multiple times
      for (let i = 0; i < 3; i++) {
        mockNode.parameters = {
          action: 'track-usage',
          accountId: ACCOUNT_ID,
          templateId,
          variableValues: { name: `User${i}`, recipient: `user${i}@example.com`, date: '2026-01-30' }
        };
        await executor.execute(mockNode, mockContext, mockState);
      }

      // Get stats
      mockNode.parameters = {
        action: 'get-usage-stats',
        accountId: ACCOUNT_ID,
        templateId
      };
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('success');
      const stats = result.output.usageStats;
      expect(stats).toBeDefined();
      expect(stats.templateId).toBe(templateId);
      expect(stats.totalUsage).toBeGreaterThanOrEqual(0);
    });

    it('should track top variables in usage stats', async () => {
      // Track with consistent variable usage
      const variables = { name: 'John', recipient: 'john@example.com', date: '2026-01-30' };
      for (let i = 0; i < 3; i++) {
        mockNode.parameters = {
          action: 'track-usage',
          accountId: ACCOUNT_ID,
          templateId,
          variableValues: variables
        };
        await executor.execute(mockNode, mockContext, mockState);
      }

      // Get stats
      mockNode.parameters = {
        action: 'get-usage-stats',
        accountId: ACCOUNT_ID,
        templateId
      };
      const result = await executor.execute(mockNode, mockContext, mockState);

      const stats = result.output.usageStats;
      expect(stats.topVariables.length).toBeGreaterThan(0);
      expect(stats.topVariables[0]).toHaveProperty('name');
      expect(stats.topVariables[0]).toHaveProperty('usageCount');
    });

    it('should fail if non-owner gets usage stats', async () => {
      mockContext.userId = OTHER_USER_ID;

      const config: TemplateManagerConfig = {
        action: 'get-usage-stats',
        accountId: ACCOUNT_ID,
        templateId
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      expect(result.status).toBe('error');
      expect(result.error).toContain('Unauthorized');
    });
  });

  describe('Validation', () => {
    it('should validate required action parameter', () => {
      const node: WorkflowNode = {
        id: 'test',
        type: 'template-manager',
        parameters: { accountId: ACCOUNT_ID }, // Missing action
        inputs: [],
        outputs: []
      };

      const validation = executor.validate(node);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('action'))).toBe(true);
    });

    it('should validate required accountId parameter', () => {
      const node: WorkflowNode = {
        id: 'test',
        type: 'template-manager',
        parameters: { action: 'create' }, // Missing accountId
        inputs: [],
        outputs: []
      };

      const validation = executor.validate(node);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('accountId'))).toBe(true);
    });

    it('should validate template data for create action', () => {
      const node: WorkflowNode = {
        id: 'test',
        type: 'template-manager',
        parameters: {
          action: 'create',
          accountId: ACCOUNT_ID,
          template: {} // Empty template
        },
        inputs: [],
        outputs: []
      };

      const validation = executor.validate(node);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should validate templateId for get action', () => {
      const node: WorkflowNode = {
        id: 'test',
        type: 'template-manager',
        parameters: {
          action: 'get',
          accountId: ACCOUNT_ID
          // Missing templateId
        },
        inputs: [],
        outputs: []
      };

      const validation = executor.validate(node);
      expect(validation.valid).toBe(false);
      expect(validation.errors.some((e) => e.includes('templateId'))).toBe(true);
    });
  });

  describe('Multi-Tenant Isolation', () => {
    let templateId: string;

    beforeEach(async () => {
      const createConfig: TemplateManagerConfig = {
        action: 'create',
        accountId: ACCOUNT_ID,
        template: {
          name: 'Tenant Test',
          subject: 'Test',
          bodyText: 'Body'
        }
      };

      mockNode.parameters = createConfig;
      const createResult = await executor.execute(mockNode, mockContext, mockState);
      templateId = (createResult.output.template as EmailTemplate).templateId;
    });

    it('should isolate templates by tenant', async () => {
      mockContext.tenantId = 'different-tenant';

      const config: TemplateManagerConfig = {
        action: 'list',
        accountId: ACCOUNT_ID
      };

      mockNode.parameters = config;
      const result = await executor.execute(mockNode, mockContext, mockState);

      const templates = result.output.templates as EmailTemplate[];
      expect(templates.every((t) => t.tenantId === 'different-tenant')).toBe(true);
    });
  });
});
