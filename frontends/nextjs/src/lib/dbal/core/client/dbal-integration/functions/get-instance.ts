import { DBALClient, type DBALConfig } from '@/dbal'

export static getInstance(): DBALIntegration {
    if (!DBALIntegration.instance) {
      DBALIntegration.instance = new DBALIntegration()
    }
    return DBALIntegration.instance
  }
