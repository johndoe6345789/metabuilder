# Error Detection & Auto Repair Feature

## Overview

CodeForge includes an intelligent error detection and auto-repair system powered by AI that helps you identify and fix code issues automatically.

## Features

### 🔍 Error Detection

The system automatically scans your code files for various types of errors:

- **Syntax Errors**: Missing parentheses, unbalanced braces, malformed statements
- **Import Errors**: Unused imports that clutter your code
- **Type Errors**: Use of `any` types that reduce type safety
- **Lint Errors**: Code style issues like using `var` instead of `const`/`let`

### 🔧 Auto Repair Modes

1. **Single Error Repair**
   - Click the wrench icon next to any error
   - AI fixes just that specific issue
   - Get instant feedback with explanations

2. **Batch File Repair**
   - Repair all errors in a single file
   - Click "Repair" button at the file level
   - Fixes are applied all at once

3. **Context-Aware Repair**
   - Uses related files for better accuracy
   - Understands your project structure
   - Maintains consistency across files

4. **Full Project Repair**
   - Click "Repair All" to fix all files
   - Processes multiple files in parallel
   - Comprehensive project-wide fixes

## How to Use

### Quick Start

1. Open the **Error Repair** tab in the main navigation
2. Click **Scan** to detect errors in your project
3. Review the detected errors grouped by file
4. Choose your repair method:
   - Click wrench icon for single error fix
   - Click "Repair" for file-level fix
   - Click "Repair All" for project-wide fix

### Understanding Error Indicators

- **🔴 Error Badge**: Red badge shows critical errors that break functionality
- **⚠️ Warning Badge**: Yellow badge shows code quality issues
- **ℹ️ Info Badge**: Blue badge shows suggestions for improvement

### Error Panel Features

- **Grouped by File**: Errors are organized by the file they appear in
- **Line Numbers**: Jump directly to the problematic code
- **Code Snippets**: View the problematic code inline
- **Expandable Details**: Click to see more context
- **Quick Navigation**: Click "Open" to jump to the file in the editor

## Best Practices

1. **Regular Scans**: Run scans periodically as you code
2. **Review AI Fixes**: Always review what the AI changed
3. **Test After Repair**: Verify your code still works as expected
4. **Incremental Fixes**: Fix errors in small batches for easier verification

## Error Types Explained

### Syntax Errors
```typescript
// ❌ Before (missing parentheses)
function calculate { return 5 }

// ✅ After
function calculate() { return 5 }
```

### Import Errors
```typescript
// ❌ Before (unused import)
import { useState, useEffect, useMemo } from 'react'
// Only useState is used

// ✅ After
import { useState } from 'react'
```

### Type Errors
```typescript
// ❌ Before (any type)
function process(data: any) { }

// ✅ After
function process(data: string | number) { }
```

### Lint Errors
```typescript
// ❌ Before (var keyword)
var count = 0

// ✅ After
const count = 0
```

## Tips & Tricks

- **Badge Notification**: Look for the error count badge on the "Error Repair" tab
- **Header Alert**: When errors are detected, a button appears in the header
- **File Targeting**: Use file-level repair when errors are localized
- **Context Matters**: Complex errors benefit from context-aware repair

## Troubleshooting

**Q: The scan isn't finding errors I can see**
A: Some complex errors may require manual review. The scanner focuses on common, fixable issues.

**Q: A fix didn't work as expected**
A: You can undo changes in the editor. Try single-error repair for more control.

**Q: AI repair is taking too long**
A: Large files or complex errors may take time. Consider fixing smaller batches.

**Q: Some errors remain after repair**
A: Some errors may require manual intervention or additional context. Check the "remaining issues" explanation.

## Integration with CodeForge

The error repair system works seamlessly with other CodeForge features:

- **Code Editor**: Jump directly from errors to code
- **AI Generate**: AI-generated code is also scannable
- **Export**: Ensure clean code before project export
- **All Designers**: Errors in any file type are detected

## Technical Details

### Error Detection Algorithm

1. **Lexical Analysis**: Tokenize source code
2. **Pattern Matching**: Identify common error patterns
3. **Import Analysis**: Track import usage
4. **Type Checking**: Basic type validation for TypeScript

### AI Repair Process

1. **Context Gathering**: Collect error details and surrounding code
2. **Prompt Construction**: Build repair prompt with constraints
3. **LLM Processing**: Send to GPT-4o for intelligent fixes
4. **Validation**: Parse and validate the response
5. **Application**: Apply fixes to the codebase

### Supported Languages

- TypeScript (`.ts`, `.tsx`)
- JavaScript (`.js`, `.jsx`)
- CSS/SCSS (basic syntax checking)

## Future Enhancements

- Real-time error detection as you type
- Custom error rules
- Integration with ESLint
- TypeScript compiler integration
- Performance metrics
- Error history tracking
