import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from "react-error-boundary";
// Spark platform import removed - migrating to Next.js
// import "@github/spark/spark"

import App from './App.tsx'
import { ErrorFallback } from './ErrorFallback.tsx'

// Import main SCSS file (compiles all styles)
import "./main.scss"

createRoot(document.getElementById('root')!).render(
  <ErrorBoundary FallbackComponent={ErrorFallback}>
    <App />
   </ErrorBoundary>
)
