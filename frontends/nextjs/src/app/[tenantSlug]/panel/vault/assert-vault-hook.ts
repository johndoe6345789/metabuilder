/** The one contract check on the declarative view: it must name this hook. */

export function assertVaultHookDeclared(
  hooks: readonly { id: string; hook: string }[]
): void {
  const declaration = hooks.find(hook => hook.id === 'vault')
  if (declaration?.hook !== 'useVaultController') {
    throw new Error('Vault view must declare the useVaultController hook')
  }
}
