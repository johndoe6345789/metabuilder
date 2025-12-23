# MetaBuilder Security Guide

## Overview

MetaBuilder now includes comprehensive security features to protect against malicious code injection, XSS attacks, SQL injection, and other vulnerabilities. This document outlines the security measures implemented and best practices for users.

## Security Features

### 1. Code Scanning

All user-generated code (JavaScript, Lua, JSON, HTML) is automatically scanned for security vulnerabilities before execution or saving.

#### Scan Levels

- **Safe**: No security issues detected
- **Low**: Minor warnings that don't pose significant risk
- **Medium**: Potential security concerns that should be reviewed
- **High**: Serious security issues that require immediate attention
- **Critical**: Severe vulnerabilities that block execution/saving

### 2. Sandboxed Lua Execution

Lua scripts are executed in a sandboxed environment with the following restrictions:

#### Disabled Functions & Modules

- **os module**: All operating system functions disabled
  - `os.execute`, `os.exit`, `os.remove`, `os.rename`, `os.tmpname`
  
- **io module**: All file I/O operations disabled
  - `io.popen`, `io.tmpfile`, `io.open`, `io.input`, `io.output`, `io.lines`
  
- **File loading**: Dynamic file loading disabled
  - `loadfile`, `dofile`
  
- **Package loading**: Dynamic library loading disabled
  - `package.loadlib`, `package.searchpath`, C library path cleared

#### Limited Functions

- **debug module**: Advanced debugging features limited
  - `debug.getfenv`, `debug.setfenv` disabled
  
- **Environment manipulation**: Global environment modifications restricted
  - Direct `_G` manipulation monitored

#### Safe Functions Available

The sandbox provides access to these safe functions:
- Basic: `assert`, `error`, `ipairs`, `next`, `pairs`, `pcall`, `select`, `tonumber`, `tostring`, `type`, `unpack`, `xpcall`
- Libraries: `string`, `table`, `math`, `bit32`
- Logging: `print`, `log`
- Context: `context.data`, `context.user`, `context.kv`

### 3. Execution Timeout

All Lua scripts have a maximum execution time of 5 seconds (configurable) to prevent infinite loops and resource exhaustion.

### 4. Pattern Detection

The security scanner detects the following malicious patterns:

#### JavaScript Threats

- **Code Execution**
  - `eval()`
  - Dynamic `Function()` constructor
  - `setTimeout/setInterval` with string arguments

- **XSS Vulnerabilities**
  - `innerHTML` assignments
  - `dangerouslySetInnerHTML`
  - `<script>` tag injection
  - `javascript:` protocol in URLs
  - Inline event handlers (`onclick`, `onerror`, etc.)

- **Prototype Pollution**
  - `__proto__` manipulation
  - `constructor.prototype` access

- **Remote Code Loading**
  - HTTP/HTTPS imports
  - Data URIs with executable content

#### Lua Threats

- **System Access**
  - OS module function calls
  - File I/O operations
  - Dynamic file loading
  - Package/library loading

- **Environment Manipulation**
  - Global environment modification
  - Metatable manipulation
  - Debug module advanced features

- **Infinite Loops**
  - `while true do` patterns without breaks
  - Recursive functions without termination

#### JSON Threats

- **Prototype Pollution**
  - `__proto__` in JSON keys
  - `constructor.prototype` manipulation

- **Script Injection**
  - `<script>` tags in JSON values
  - Executable content in data

#### SQL Injection (in strings)

- `DROP`, `DELETE`, `UPDATE`, `INSERT` commands
- `UNION SELECT` attacks
- Authentication bypass patterns (`OR '1'='1'`)
- SQL comment patterns (`--`)

## User Interface

### Security Dialogs

When security issues are detected, users see a detailed dialog showing:

1. **Severity Level**: Visual indicator of threat level
2. **Issue Count**: Number of security problems found
3. **Detailed Issues**: Each issue includes:
   - Type (malicious, dangerous, suspicious, warning)
   - Severity level
   - Description of the problem
   - Line number (if applicable)
   - Code pattern that triggered the alert
   - Recommendation for fixing

### Security Scan Button

All code editors include a "Security Scan" button that allows manual scanning without attempting to save or execute code.

### Save/Execute Behavior

- **Critical Issues**: Block execution/saving completely
- **High Issues**: Show warning dialog, require user confirmation to proceed
- **Medium Issues**: Show warning dialog, allow proceeding with caution
- **Low Issues**: Display toast notification but allow operation

## Best Practices

### For Administrators (God/SuperGod Users)

1. **Review All Code**: Always scan custom code before deploying
2. **Test in Isolation**: Use the test/preview features before going live
3. **Limit Permissions**: Grant minimal necessary permissions to users
4. **Regular Audits**: Periodically review all stored scripts and code
5. **Monitor Logs**: Check execution logs for suspicious patterns

### For Users

1. **Avoid Dangerous Patterns**: Don't use `eval()`, `innerHTML`, or other flagged patterns
2. **Use Safe Alternatives**: 
   - React JSX instead of string HTML
   - `textContent` instead of `innerHTML`
   - Function references instead of string code
3. **Validate Input**: Always validate and sanitize user input
4. **Use Context APIs**: Use provided `context.data`, `context.user` instead of global access

### For Lua Scripts

1. **Use Provided APIs**: Use `context.kv` for storage, not external methods
2. **Limit Complexity**: Keep scripts simple and focused
3. **Add Termination**: Ensure all loops have proper exit conditions
4. **Log Appropriately**: Use `log()` for debugging but avoid logging sensitive data
5. **Handle Errors**: Use `pcall()` for error handling

## Technical Implementation

### Security Scanner (`security-scanner.ts`)

The `SecurityScanner` class provides methods to scan different code types:

```typescript
const scanner = new SecurityScanner()

// Scan JavaScript
const jsResult = scanner.scanJavaScript(code)

// Scan Lua
const luaResult = scanner.scanLua(code)

// Scan JSON
const jsonResult = scanner.scanJSON(jsonString)

// Scan HTML
const htmlResult = scanner.scanHTML(htmlString)
```

### Sandboxed Lua Engine (`sandboxed-lua-engine.ts`)

The `SandboxedLuaEngine` wraps the standard Lua engine with security measures:

```typescript
const engine = createSandboxedLuaEngine(5000) // 5 second timeout

const result = await engine.executeWithSandbox(code, context)

// Result includes both execution result and security scan
console.log(result.execution.success)
console.log(result.security.severity)
```

### Workflow Engine Integration

The workflow engine automatically uses the sandboxed Lua execution and reports security warnings in workflow execution results.

## Security Limitations

### What We Protect Against

✅ Common XSS attacks  
✅ SQL injection patterns  
✅ Prototype pollution  
✅ Remote code loading  
✅ File system access attempts  
✅ Infinite loops (with timeout)  
✅ OS command execution  

### What We Don't Protect Against

❌ Logic bombs (code that appears safe but has malicious intent)  
❌ Social engineering attacks  
❌ Credential theft through legitimate-looking forms  
❌ Resource exhaustion within timeout limits  
❌ Obfuscated code (heavily encoded/encrypted patterns)  

## Reporting Security Issues

If you discover a security vulnerability in MetaBuilder:

1. **Do NOT** disclose it publicly
2. Document the vulnerability with:
   - Steps to reproduce
   - Expected vs actual behavior
   - Potential impact
   - Suggested fix (if applicable)
3. Report to the system administrator or security team
4. Allow reasonable time for patching before disclosure

## Future Enhancements

Planned security improvements:

- [ ] Rate limiting on code execution
- [ ] Code complexity analysis
- [ ] Machine learning-based anomaly detection
- [ ] Encrypted storage for sensitive scripts
- [ ] Audit logging for all code changes
- [ ] Whitelist/blacklist for specific patterns
- [ ] Content Security Policy (CSP) headers
- [ ] Subresource Integrity (SRI) for external resources

## Version History

- **v1.0** (Current): Initial security implementation with code scanning and sandboxed Lua execution

---

**Last Updated**: 2024  
**Security Contact**: System Administrator
