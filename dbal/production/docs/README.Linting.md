# C++ Code Quality and Linting Guide

## Overview

The DBAL C++ project uses industry-standard tools for maintaining code quality:

- **clang-tidy**: Static analysis and linting
- **clang-format**: Code formatting
- **cppcheck**: Additional static analysis
- **Doxygen**: Documentation generation

## Quick Start

### Run All Checks

```bash
cd dbal/production
./lint.sh
```

### Apply Automatic Fixes

```bash
./lint.sh --fix
```

## Tools

### 1. clang-tidy

**Purpose**: Static analysis, best practices enforcement, modern C++ suggestions

**Configuration**: `.clang-tidy`

**Enabled Checks**:
- `bugprone-*` - Potential bugs
- `cert-*` - CERT secure coding guidelines
- `clang-analyzer-*` - Clang static analyzer
- `cppcoreguidelines-*` - C++ Core Guidelines
- `google-*` - Google C++ Style Guide
- `modernize-*` - Modern C++ suggestions
- `performance-*` - Performance improvements
- `readability-*` - Code readability

**Usage**:
```bash
# Single file
clang-tidy src/daemon/server.cpp -p build/

# All files
find src -name "*.cpp" | xargs clang-tidy -p build/
```

### 2. clang-format

**Purpose**: Automatic code formatting

**Configuration**: `.clang-format`

**Style**: Based on Google C++ Style Guide with customizations:
- 4-space indentation
- 100 character line limit
- Attach braces
- Pointer/reference alignment: left

**Usage**:
```bash
# Check formatting
clang-format --dry-run --Werror src/daemon/server.cpp

# Apply formatting
clang-format -i src/daemon/server.cpp

# Format all files
find src include -name "*.cpp" -o -name "*.hpp" | xargs clang-format -i
```

### 3. cppcheck

**Purpose**: Additional static analysis for potential bugs

**Usage**:
```bash
cppcheck --enable=all \
         --suppress=missingIncludeSystem \
         --std=c++17 \
         -I include \
         src/
```

### 4. Doxygen

**Purpose**: Generate HTML documentation from code comments

**Style**: Javadoc-style comments

**Example**:
```cpp
/**
 * @brief Brief description
 *
 * Detailed description of the function or class.
 *
 * @param param1 Description of parameter
 * @param param2 Description of parameter
 * @return Description of return value
 * @throws Error Description of when error is thrown
 *
 * @example
 * @code
 * auto result = myFunction(42, "test");
 * if (result.isOk()) {
 *     std::cout << result.value();
 * }
 * @endcode
 */
Result<int> myFunction(int param1, const std::string& param2);
```

**Generate docs**:
```bash
doxygen Doxyfile
```

## Documentation Standards

### File Headers

Every source file should have a file-level docstring:

```cpp
/**
 * @file filename.cpp
 * @brief Brief description of file purpose
 *
 * Detailed description of what this file contains,
 * its role in the system, and any important notes.
 */
```

### Class Documentation

```cpp
/**
 * @class ClassName
 * @brief Brief description of class purpose
 *
 * Detailed description of the class, its responsibilities,
 * and how it should be used.
 *
 * @example
 * @code
 * ClassName obj(param1, param2);
 * obj.doSomething();
 * @endcode
 */
class ClassName {
    // ...
};
```

### Function Documentation

```cpp
/**
 * @brief Brief description of what function does
 *
 * Detailed description including algorithm details,
 * preconditions, postconditions, and side effects.
 *
 * @param param1 Description of first parameter
 * @param param2 Description of second parameter
 * @return Description of return value
 * @throws ErrorType When this error occurs
 *
 * @note Special notes or caveats
 * @warning Important warnings
 * @see Related functions or classes
 */
Result<ReturnType> functionName(Type1 param1, Type2 param2);
```

### Member Variables

```cpp
class MyClass {
private:
    int counter_;         ///< Brief description of member
    std::string name_;    ///< Brief description of member
};
```

## Naming Conventions

Enforced by clang-tidy configuration:

- **Classes/Structs**: `CamelCase`
- **Functions**: `camelCase`
- **Variables**: `lower_case`
- **Constants**: `UPPER_CASE`
- **Member variables**: `lower_case_` (trailing underscore)
- **Namespaces**: `lower_case`

## Pre-commit Hooks

To automatically run linting before commits:

```bash
# Create pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
cd dbal/production
./lint.sh
if [ $? -ne 0 ]; then
    echo "Linting failed. Fix issues or use git commit --no-verify to skip."
    exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

## IDE Integration

### VSCode

Install extensions:
- **C/C++** (Microsoft)
- **clangd**
- **Clang-Format**

Settings (`.vscode/settings.json`):
```json
{
    "clang-format.executable": "/usr/bin/clang-format",
    "clang-format.style": "file",
    "editor.formatOnSave": true,
    "C_Cpp.codeAnalysis.clangTidy.enabled": true,
    "C_Cpp.codeAnalysis.clangTidy.path": "/usr/bin/clang-tidy"
}
```

### CLion

Settings → Editor → Code Style → C/C++:
- Scheme: Set from file (.clang-format)

Settings → Editor → Inspections → C/C++:
- Enable "Clang-Tidy"
- Configuration file: .clang-tidy

## Continuous Integration

Add to GitHub Actions workflow:

```yaml
- name: Lint C++ Code
  run: |
    cd dbal/production
    ./lint.sh
```

## Common Issues and Fixes

### Issue: "Use of old-style cast"
```cpp
// Bad
int x = (int)value;

// Good
int x = static_cast<int>(value);
```

### Issue: "Variable never read"
```cpp
// Bad
int unused = 42;

// Good
[[maybe_unused]] int for_future_use = 42;
```

### Issue: "Missing const"
```cpp
// Bad
std::string getName() { return name_; }

// Good
std::string getName() const { return name_; }
```

### Issue: "Pass by value instead of const reference"
```cpp
// Bad
void setName(std::string name) { name_ = name; }

// Good
void setName(const std::string& name) { name_ = name; }
```

## Metrics

The lint script reports:
- Formatting violations
- Static analysis warnings
- TODO/FIXME comments count
- Long functions (>100 lines)

Aim for zero warnings before committing.

## Resources

- [C++ Core Guidelines](https://isocpp.github.io/CppCoreGuidelines/CppCoreGuidelines)
- [Google C++ Style Guide](https://google.github.io/styleguide/cppguide.html)
- [clang-tidy checks](https://clang.llvm.org/extra/clang-tidy/checks/list.html)
- [Doxygen manual](https://www.doxygen.nl/manual/)
