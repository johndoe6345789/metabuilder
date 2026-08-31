declare module '@metabuilder/workflow' {
  export interface CredentialRef {
    id: string
    name?: string
    type?: string
  }

  export interface CredentialBinding {
    nodeId: string
    credentialId: string
    credentialName?: string
    credentialType?: string
    [key: string]: unknown
  }
}
