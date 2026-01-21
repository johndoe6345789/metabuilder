import type { StorageAdapter } from './types'

export class SQLiteAdapter implements StorageAdapter {
  private db: any = null
  private SQL: any = null
  private initPromise: Promise<void> | null = null

  private async loadSQLiteWASM(): Promise<any> {
    const moduleName = 'sql.js'
    try {
      return await import(/* @vite-ignore */ moduleName)
    } catch {
      throw new Error(`${moduleName} not installed. Run: npm install ${moduleName}`)
    }
  }

  private async init(): Promise<void> {
    if (this.db) return
    if (this.initPromise) return this.initPromise

    this.initPromise = (async () => {
      try {
        const sqlJsModule = await this.loadSQLiteWASM()
        const initSqlJs = sqlJsModule.default

        this.SQL = await initSqlJs({
          locateFile: (file: string) => `https://sql.js.org/dist/${file}`
        })

        const data = localStorage.getItem('codeforge-sqlite-db')
        if (data) {
          const buffer = new Uint8Array(JSON.parse(data))
          this.db = new this.SQL.Database(buffer)
        } else {
          this.db = new this.SQL.Database()
        }

        this.db.run(`
          CREATE TABLE IF NOT EXISTS keyvalue (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL
          )
        `)
      } catch (error) {
        console.error('SQLite initialization failed:', error)
        throw error
      }
    })()

    return this.initPromise
  }

  private persist(): void {
    if (!this.db) return
    try {
      const data = this.db.export()
      const buffer = Array.from(data)
      localStorage.setItem('codeforge-sqlite-db', JSON.stringify(buffer))
    } catch (error) {
      console.error('Failed to persist SQLite database:', error)
    }
  }

  async get<T>(key: string): Promise<T | undefined> {
    await this.init()
    const stmt = this.db.prepare('SELECT value FROM keyvalue WHERE key = ?')
    stmt.bind([key])

    if (stmt.step()) {
      const row = stmt.getAsObject()
      stmt.free()
      return JSON.parse(row.value as string) as T
    }

    stmt.free()
    return undefined
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.init()
    this.db.run(
      'INSERT OR REPLACE INTO keyvalue (key, value) VALUES (?, ?)',
      [key, JSON.stringify(value)]
    )
    this.persist()
  }

  async delete(key: string): Promise<void> {
    await this.init()
    this.db.run('DELETE FROM keyvalue WHERE key = ?', [key])
    this.persist()
  }

  async keys(): Promise<string[]> {
    await this.init()
    const stmt = this.db.prepare('SELECT key FROM keyvalue')
    const keys: string[] = []

    while (stmt.step()) {
      const row = stmt.getAsObject()
      keys.push(row.key as string)
    }

    stmt.free()
    return keys
  }

  async clear(): Promise<void> {
    await this.init()
    this.db.run('DELETE FROM keyvalue')
    this.persist()
  }

  async close(): Promise<void> {
    if (this.db) {
      this.persist()
      this.db.close()
      this.db = null
      this.SQL = null
      this.initPromise = null
    }
  }
}
