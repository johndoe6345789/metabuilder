import { randomUUID } from 'crypto'
import type { LuaScript, Package, PageView, Session, User, Workflow } from '../types'

export class InMemoryStore {
  users = new Map<string, User>()
  usersByEmail = new Map<string, string>()
  usersByUsername = new Map<string, string>()

  pages = new Map<string, PageView>()
  pageSlugs = new Map<string, string>()

  workflows = new Map<string, Workflow>()
  workflowNames = new Map<string, string>()

  sessions = new Map<string, Session>()
  sessionTokens = new Map<string, string>()

  luaScripts = new Map<string, LuaScript>()
  luaScriptNames = new Map<string, string>()

  packages = new Map<string, Package>()
  packageKeys = new Map<string, string>()

  generateId(_prefix?: string): string {
    return randomUUID()
  }

  clear(): void {
    this.users.clear()
    this.usersByEmail.clear()
    this.usersByUsername.clear()

    this.pages.clear()
    this.pageSlugs.clear()

    this.workflows.clear()
    this.workflowNames.clear()

    this.sessions.clear()
    this.sessionTokens.clear()

    this.luaScripts.clear()
    this.luaScriptNames.clear()

    this.packages.clear()
    this.packageKeys.clear()
  }
}

export const createInMemoryStore = (): InMemoryStore => new InMemoryStore()
