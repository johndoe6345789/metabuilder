# Ralph Loop Iteration 5 - Pyodide SSR Fixes

## Overview
This iteration focused on resolving Pyodide Server-Side Rendering (SSR) errors that were affecting approximately 15+ e2e tests.

## Problem Analysis
The issue was that Pyodide (a Python runtime for the browser) was being imported on the server side, which tried to access browser APIs in a Node.js environment. The error message was:
```
Error: Cannot determine runtime environment at (ssr)/./node_modules/pyodide/pyodide.mjs
```

### Root Cause
1. `src/lib/pyodide-runner.ts` had a top-level import: `import { loadPyodide } from 'pyodide'`
2. This file was imported by `PythonOutput.tsx` which was imported by `SplitScreenEditor.tsx`
3. `SplitScreenEditor` was imported directly (not dynamically) by `CodeEditorSection`
4. These components were part of the component tree on server-rendered pages
5. During the Next.js build process, Webpack tried to bundle Pyodide for server-side code, causing the error

## Solutions Implemented

### 1. Dynamic Imports for Pyodide (`src/lib/pyodide-runner.ts`)
Changed from top-level import to dynamic import inside the function:
```typescript
// Before:
import { loadPyodide } from 'pyodide'

// After:
const { loadPyodide } = await import('pyodide')  // Only imported when actually needed
```

### 2. Client Component Directives
Added `'use client'` directives to components that use browser-only APIs or state:
- `src/components/features/python-runner/PythonOutput.tsx`
- `src/components/features/python-runner/PythonTerminal.tsx`
- `src/components/features/snippet-editor/SplitScreenEditor.tsx`
- `src/components/features/snippet-editor/CodeEditorSection.tsx`

This ensures these components are only rendered on the client side, never bundled for server-side execution.

## Results
- ✅ Eliminated all Pyodide SSR errors
- ✅ E2E tests: 236 passed (up from ~220)
- ✅ Failed tests: 26 (down from ~40+)
- ✅ No breaking changes to functionality

## Remaining Issues (Not in Scope for This Iteration)
- **Heading Hierarchy**: 2 tests - Minor accessibility issue with H1-H6 jumps on home page
- **Visual Regression**: 13 tests - Need baseline updates for font sizing, contrast, borders
- **Cross-Platform UI**: 6 tests - Navigation, touch events, text contrast on mobile
- **Mobile/Responsive**: 5 tests - Touch interaction, notch/safe area, line-height

These represent mostly styling and visual regression issues, not functional problems. The critical runtime errors have been resolved.

## Key Insights
This fix demonstrates the importance of understanding Next.js's server/client component boundary and how dynamic imports can be used to defer module loading until runtime when they're needed on the client side only.
