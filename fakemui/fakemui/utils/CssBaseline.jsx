import React from 'react'

/**
 * CssBaseline - Kickstart an elegant, consistent baseline to build upon.
 * Normalizes styles across browsers similar to normalize.css
 */
export function CssBaseline({ children }) {
  return <>{children}</>
}

/**
 * ScopedCssBaseline - Scopes the baseline styles to children only
 */
export function ScopedCssBaseline({ children, className, ...props }) {
  return (
    <div className={`fakemui-scoped-css-baseline ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

// CSS that would normally be injected - export for reference
export const cssBaselineStyles = `
  /* CssBaseline styles */
  *, *::before, *::after {
    box-sizing: border-box;
  }

  html {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-size-adjust: 100%;
  }

  body {
    margin: 0;
    color: rgba(0, 0, 0, 0.87);
    font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    font-weight: 400;
    font-size: 1rem;
    line-height: 1.5;
    letter-spacing: 0.00938em;
    background-color: #fff;
  }

  body::backdrop {
    background-color: #fff;
  }

  strong, b {
    font-weight: 700;
  }
`

export default CssBaseline
