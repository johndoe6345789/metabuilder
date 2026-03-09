export const FLASK_BACKEND_URL = process.env.NEXT_PUBLIC_FLASK_BACKEND_URL ||
  (typeof window !== 'undefined' && (window as any).FLASK_BACKEND_URL) ||
  ''

export const USE_FLASK_BACKEND = (process.env.NEXT_PUBLIC_USE_FLASK_BACKEND === 'true' ||
  (typeof window !== 'undefined' && (window as any).USE_FLASK_BACKEND === 'true')) &&
  FLASK_BACKEND_URL !== ''
