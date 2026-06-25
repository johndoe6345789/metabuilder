export const FLASK_BACKEND_URL = process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ||
  (typeof window !== 'undefined' && (window as any).FLASK_BACKEND_URL) ||
  ''

const envFlag =
  process.env.NEXT_PUBLIC_USE_FLASK_BACKEND === 'true'
const windowFlag =
  typeof window !== 'undefined' &&
  (window as any).USE_FLASK_BACKEND === 'true'
export const USE_FLASK_BACKEND =
  (envFlag || windowFlag) && FLASK_BACKEND_URL !== ''
