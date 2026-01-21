export const FLASK_BACKEND_URL = import.meta.env.VITE_FLASK_BACKEND_URL ||
  (typeof window !== 'undefined' && (window as any).FLASK_BACKEND_URL) ||
  ''

export const USE_FLASK_BACKEND = (import.meta.env.VITE_USE_FLASK_BACKEND === 'true' ||
  (typeof window !== 'undefined' && (window as any).USE_FLASK_BACKEND === 'true')) &&
  FLASK_BACKEND_URL !== ''
