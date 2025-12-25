import { Database } from '@/lib/database'
import type { Workflow, WorkflowNode, WorkflowEdge } from '@/lib/level-types'

export async function initializeWorkflows() {
  const existingWorkflows = await Database.getWorkflows()
  if (existingWorkflows.length > 0) {
    return
  }

  const workflows: Workflow[] = [
    {
      id: 'workflow_user_registration',
      name: 'User Registration Flow',
      description: 'Handles new user registration process',
      enabled: true,
      nodes: [
        {
          id: 'node_validate',
          type: 'condition',
          label: 'Validate Input',
          config: { action: 'validate_email' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node_create',
          type: 'action',
          label: 'Create User',
          config: { action: 'create_user' },
          position: { x: 100, y: 200 }
        },
        {
          id: 'node_notify',
          type: 'action',
          label: 'Send Welcome Email',
          config: { action: 'send_email' },
          position: { x: 100, y: 300 }
        }
      ],
      edges: [
        { id: 'edge_1', source: 'node_validate', target: 'node_create', label: 'valid' },
        { id: 'edge_2', source: 'node_create', target: 'node_notify', label: 'success' }
      ]
    },
    {
      id: 'workflow_page_access',
      name: 'Page Access Control',
      description: 'Checks user permissions before allowing page access',
      enabled: true,
      nodes: [
        {
          id: 'node_auth_check',
          type: 'condition',
          label: 'Check Authentication',
          config: { action: 'check_auth' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node_perm_check',
          type: 'lua',
          label: 'Check Permission',
          config: { scriptId: 'script_permission_check' },
          position: { x: 100, y: 200 }
        },
        {
          id: 'node_log',
          type: 'action',
          label: 'Log Access',
          config: { action: 'log_page_view' },
          position: { x: 100, y: 300 }
        }
      ],
      edges: [
        { id: 'edge_1', source: 'node_auth_check', target: 'node_perm_check', label: 'authorized' },
        { id: 'edge_2', source: 'node_perm_check', target: 'node_log', label: 'allowed' }
      ]
    },
    {
      id: 'workflow_comment_submission',
      name: 'Comment Submission',
      description: 'Processes user comment submissions',
      enabled: true,
      nodes: [
        {
          id: 'node_validate_comment',
          type: 'condition',
          label: 'Validate Comment',
          config: { action: 'validate_content' },
          position: { x: 100, y: 100 }
        },
        {
          id: 'node_save_comment',
          type: 'action',
          label: 'Save to Database',
          config: { action: 'create_comment' },
          position: { x: 100, y: 200 }
        },
        {
          id: 'node_notify_success',
          type: 'action',
          label: 'Show Success',
          config: { action: 'show_toast' },
          position: { x: 100, y: 300 }
        }
      ],
      edges: [
        { id: 'edge_1', source: 'node_validate_comment', target: 'node_save_comment', label: 'valid' },
        { id: 'edge_2', source: 'node_save_comment', target: 'node_notify_success', label: 'saved' }
      ]
    }
  ]

  for (const workflow of workflows) {
    await Database.addWorkflow(workflow)
  }
}
