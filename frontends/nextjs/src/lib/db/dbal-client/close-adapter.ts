import { prismaAdapter } from './create-prisma-adapter'

/**
 * Close the DBAL adapter connection
 */
export const closeAdapter = async (): Promise<void> => {
  await prismaAdapter.close()
}
