export function getBridgeSecret(): string {
  return process.env.DBAL_NATIVE_PRISMA_TOKEN?.trim() ?? ''
}
