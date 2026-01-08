export type UserRole = 'public' | 'user' | 'admin' | 'god' | 'supergod'

export type AppLevel = 1 | 2 | 3 | 4 | 5

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

export interface Comment {
  id: string
  userId: string
  content: string
  createdAt: number
  updatedAt?: number
  parentId?: string
}

export interface WorkflowNode {
  id: string
  type: 'trigger' | 'action' | 'condition' | 'lua' | 'transform'
  label: string
  config: Record<string, any>
  position: { x: number; y: number }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  label?: string
}

export interface Workflow {
  id: string
  name: string
  description?: string
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  enabled: boolean
}

export interface LuaScript {
  id: string
  name: string
  description?: string
  code: string
  parameters: Array<{ name: string; type: string }>
  returnType?: string
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
