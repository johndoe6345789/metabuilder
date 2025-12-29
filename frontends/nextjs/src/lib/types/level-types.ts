/**
 * UserRole - User permission levels in MetaBuilder
 * @description Six-level permission hierarchy
 * - 'public': Guest access (read-only)
 * - 'user': Regular user access
 * - 'moderator': Moderation workspace
 * - 'admin': Tenant administrator
 * - 'god': Power user with system configuration access
 * - 'supergod': System administrator with full access
 */
export type UserRole = 'public' | 'user' | 'moderator' | 'admin' | 'god' | 'supergod'

/** AppLevel - Numeric representation of permission levels (1-6) */
export type AppLevel = 1 | 2 | 3 | 4 | 5 | 6

/**
 * User - System user account
 * @property id - Unique user identifier
 * @property username - Display username
 * @property email - Email address for notifications
 * @property role - Permission level (public|user|moderator|admin|god|supergod)
 * @property tenantId - Tenant isolation identifier
 * @property isInstanceOwner - Owner of this MetaBuilder instance
 */
export interface User {
  id: string
  username: string
  email: string
  role: UserRole
  profilePicture?: string
  bio?: string
  createdAt: number
  tenantId?: string
  isInstanceOwner?: boolean
}

/**
 * Comment - User comment or annotation
 * @property userId - Author of the comment
 * @property parentId - For nested comments/threads
 */
export interface Comment {
  id: string
  userId: string
  content: string
  createdAt: number
  updatedAt?: number
  parentId?: string
}

/**
 * WorkflowNode - Individual step in a workflow
 * @property type - Node type: trigger (event), action (do something),
 *                  condition (if/then), lua (execute script), transform (map data)
 * @property position - X/Y coordinates for visual editor
 */
export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'lua' | 'transform'
  label: string
  config: Record<string, any>
  position: { x: number; y: number }
}

/** WorkflowEdge - Connection between workflow nodes */
export interface WorkflowEdge {
  id: string
  source: string // Source node ID
  target: string // Target node ID
  label?: string
}

/**
 * Workflow - Automation workflow definition
 * @description Consists of nodes (steps) connected by edges
 * @example
 * {
 *   id: "wf-1",
 *   name: "Send Welcome Email",
 *   nodes: [trigger, condition, action],
 *   edges: [...]
 * }
 */
export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  enabled: boolean
}

/**
 * LuaScript - Server-side business logic
 */
export interface LuaScript {
  id: string
  name: string
  description?: string
  code: string
  parameters: Array<{ name: string; type: string }>
  returnType?: string
  isSandboxed?: boolean
  allowedGlobals?: string[]
  timeoutMs?: number
}

export interface PageConfig {
  id: string
  path: string
  title: string
  level: AppLevel
  componentTree: any[]
  requiresAuth: boolean
  requiredRole?: UserRole
}

export interface Tenant {
  id: string
  name: string
  ownerId: string
  createdAt: number
  homepageConfig?: {
    pageId: string
    customContent?: any
  }
}

export interface AppConfiguration {
  id: string
  name: string
  schemas: any[]
  workflows: Workflow[]
  luaScripts: LuaScript[]
  pages: PageConfig[]
  theme: {
    colors: Record<string, string>
    fonts: Record<string, string>
  }
}

export interface PowerTransferRequest {
  id: string
  fromUserId: string
  toUserId: string
  status: 'pending' | 'accepted' | 'rejected'
  createdAt: number
  expiresAt: number
}
