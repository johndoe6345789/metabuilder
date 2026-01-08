 

declare module '@/dbal/development/src/core/types' {
  export interface User {
    id: string
    email: string
    name?: string
    level: number
    tenantId: string
  }
}
