/**
 * DBAL Status Response
 */
export function getStatusResponse() {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
    dbal: {
      mode: process.env.DBAL_MODE || 'development',
      version: '1.0.0',
    },
  }
}
