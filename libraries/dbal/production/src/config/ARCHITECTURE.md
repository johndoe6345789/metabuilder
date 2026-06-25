# DBAL Configuration System Architecture

**Version**: 2.0 (Refactored)
**Date**: 2026-02-07

---

## Module Dependency Graph

```
                    ┌─────────────────────┐
                    │   EnvConfig.hpp     │
                    │   (Public API)      │
                    │   233 LOC           │
                    └──────────┬──────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
    │ EnvParser   │    │ DefaultCfg  │    │ Validator   │
    │ 76 LOC      │    │ 58 LOC      │    │ 130 LOC     │
    └─────────────┘    └─────────────┘    └─────────────┘
           │
           │ (optionally used by)
           │
           ▼
    ┌─────────────┐
    │ ConfigLoad  │
    │ 92 LOC      │
    └─────────────┘
```

---

## Module Responsibilities

### EnvConfig (High-Level API)
**Purpose**: Public interface for all configuration access

**Responsibilities**:
- Compose all lower-level modules
- Provide domain-specific getters (getSchemaDir, getDatabaseType, etc.)
- Expose validation and loading utilities
- Print configuration for debugging

**Usage**:
```cpp
#include "config/env_config.hpp"
std::string schema_dir = EnvConfig::getSchemaDir();
EnvConfig::validate();
EnvConfig::printConfig();
```

---

### EnvParser (Core Parsing)
**Purpose**: Low-level environment variable parsing

**Responsibilities**:
- Parse string environment variables
- Parse integer environment variables with validation
- Parse boolean environment variables (true/1/yes/on)
- Handle defaults and error cases
- Log all configuration reads

**API**:
```cpp
std::string getRequired(const char* name);  // Throws if not set
std::string get(const char* name, const std::string& default);
int getInt(const char* name, int default);
bool getBool(const char* name, bool default);
```

---

### DefaultConfig (Constants)
**Purpose**: Centralized default values

**Responsibilities**:
- Define all default configuration values
- Use constexpr for compile-time evaluation
- Single source of truth for defaults
- Easy to modify without touching parsing logic

**Structure**:
```cpp
struct DefaultConfig {
    static constexpr const char* DATABASE_TYPE = "sqlite";
    static constexpr int PORT = 8080;
    static constexpr bool AUTO_CREATE_TABLES = true;
    // ... 27 more constants
};
```

---

### ConfigValidator (Validation)
**Purpose**: Validate configuration values

**Responsibilities**:
- Validate port ranges (1-65535)
- Check directory existence
- Validate enum values (log levels, database types, modes)
- Check pool size consistency
- Validate timeout ranges
- Comprehensive validation method

**API**:
```cpp
bool isValidPort(int port);
bool directoryExists(const std::string& path);
bool isValidLogLevel(const std::string& level);
bool isValidDatabaseType(const std::string& type);
void validate(...);  // Comprehensive validation
```

---

### ConfigLoader (.env File Loading)
**Purpose**: Load configuration from .env files

**Responsibilities**:
- Parse .env file format
- Handle comments and empty lines
- Trim whitespace
- Remove quotes from values
- Set environment variables (without overwriting)
- Auto-discover from standard locations

**API**:
```cpp
bool loadEnvFile(const std::string& path);
bool loadEnvFileAuto();  // Tries: .env, /app/.env, /etc/dbal/.env
```

---

## Data Flow

```
┌─────────────┐
│  .env file  │
└──────┬──────┘
       │ (optional)
       ▼
┌─────────────┐      ┌──────────────┐
│ ConfigLoad  │─────>│  Environment │
└─────────────┘      │  Variables   │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐      ┌──────────────┐
                     │  EnvParser   │<─────│ DefaultCfg   │
                     └──────┬───────┘      └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  EnvConfig   │
                     │  (Typed API) │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Validator   │
                     └──────┬───────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Application  │
                     │  (Adapters)  │
                     └──────────────┘
```

---

## Usage Patterns

### Basic Usage (Most Common)
```cpp
#include "config/env_config.hpp"

// Just read configuration
std::string schema_dir = EnvConfig::getSchemaDir();  // Required
int port = EnvConfig::getPort();  // Optional with default
bool metrics = EnvConfig::getEnableMetrics();  // Boolean
```

### With Validation
```cpp
#include "config/env_config.hpp"

// Load and validate configuration
try {
    EnvConfig::validate();
    std::string schema_dir = EnvConfig::getSchemaDir();
    // ... use configuration
} catch (const std::exception& e) {
    spdlog::error("Configuration error: {}", e.what());
    return 1;
}
```

### With .env File
```cpp
#include "config/env_config.hpp"

// Load from .env file
EnvConfig::loadEnvFileAuto();  // Try standard locations
EnvConfig::validate();  // Validate loaded configuration

// Use configuration
std::string schema_dir = EnvConfig::getSchemaDir();
```

### Full Initialization Pattern
```cpp
#include "config/env_config.hpp"

int main() {
    // 1. Load .env file
    EnvConfig::loadEnvFileAuto();
    
    // 2. Validate configuration
    try {
        EnvConfig::validate();
    } catch (const std::exception& e) {
        spdlog::error("Configuration validation failed: {}", e.what());
        return 1;
    }
    
    // 3. Print configuration for debugging
    EnvConfig::printConfig();
    
    // 4. Use configuration
    std::string schema_dir = EnvConfig::getSchemaDir();
    std::string template_dir = EnvConfig::getTemplateDir();
    
    // ... application logic
}
```

---

## Testing Strategy

### Unit Tests (Per Module)
```cpp
// Test EnvParser
assert(EnvParser::getInt("PORT", 8080) == 8080);
assert(EnvParser::getBool("ENABLED", true) == true);

// Test ConfigValidator
assert(ConfigValidator::isValidPort(8080) == true);
assert(ConfigValidator::isValidPort(99999) == false);

// Test ConfigLoader
ConfigLoader::loadEnvFile("test.env");
assert(std::getenv("TEST_VAR") == "test_value");
```

### Integration Tests
```cpp
// Test full configuration system
EnvConfig::loadEnvFileAuto();
EnvConfig::validate();
assert(EnvConfig::getPort() == 8080);
assert(EnvConfig::getSchemaDir() == "/app/schemas");
```

---

## Extension Points

### Adding New Configuration Section
```cpp
// 1. Add default to DefaultConfig
struct DefaultConfig {
    static constexpr const char* NEW_OPTION = "default_value";
};

// 2. Add getter to EnvConfig
static std::string getNewOption() {
    return EnvParser::get("DBAL_NEW_OPTION", DefaultConfig::NEW_OPTION);
}

// 3. Add validation (optional)
static bool isValidNewOption(const std::string& value) {
    return value == "valid1" || value == "valid2";
}
```

### Adding New Validation Rule
```cpp
// Add to ConfigValidator
static bool isValidCustomRule(const std::string& value) {
    // Custom validation logic
    return true;
}

// Use in validate()
if (!isValidCustomRule(value)) {
    throw std::runtime_error("Invalid custom value");
}
```

---

## Performance Considerations

### Header-Only Design
- ✓ Zero compilation overhead
- ✓ Inline optimization by compiler
- ✓ No linking complexity

### Static Methods
- ✓ No instance creation overhead
- ✓ Thread-safe (no shared state)
- ✓ Direct environment variable access

### Caching
- Current: No caching (reads environment every call)
- Future: Add optional caching layer if needed
- Trade-off: Dynamic updates vs performance

---

## Security Considerations

### Environment Variables
- Passwords and secrets in environment variables
- Not logged (except in debug mode)
- Cleared from memory after use (via OS)

### Validation
- All inputs validated before use
- Port ranges checked
- Directory existence verified
- Enum values validated

### .env Files
- Parsed securely (no command execution)
- Comments stripped
- Quotes removed safely
- No buffer overflows (C++ strings)

---

## Comparison with Original

| Aspect | Original | Refactored |
|--------|----------|------------|
| **LOC** | 191 | 589 (209% increase) |
| **Files** | 1 | 5 modules |
| **Concerns** | Mixed | Separated |
| **Validation** | None | Comprehensive |
| **.env Support** | No | Yes |
| **Defaults** | Inline | Centralized |
| **Testing** | Hard | Easy (per module) |
| **Extensibility** | Monolithic | Modular |
| **API Compat** | N/A | 100% |
| **Breaking Changes** | N/A | 0 |

---

## Conclusion

The refactored configuration system provides:

- ✅ **Clear separation of concerns** (5 focused modules)
- ✅ **100% API compatibility** (zero breaking changes)
- ✅ **New features** (validation, .env loading, centralized defaults)
- ✅ **Better maintainability** (easy to extend and test)
- ✅ **Production-ready** (comprehensive validation and error handling)

**Status**: Ready for deployment
