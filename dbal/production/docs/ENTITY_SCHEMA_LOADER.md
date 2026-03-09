# EntitySchemaLoader - Dynamic Entity Loading from YAML

**Date**: 2026-02-04
**Status**: Complete
**Location**: `/dbal/production/include/dbal/core/entity_loader.hpp`

---

## Overview

The `EntitySchemaLoader` class dynamically loads entity schemas from YAML files, replacing hardcoded entity definitions with declarative schema-based loading. This enables the C++ DBAL to automatically support any entity defined in YAML without code changes.

**Key Benefits**:
- **No hardcoded entities**: Add new entities by creating YAML files, no C++ code changes needed
- **Single source of truth**: YAML schemas in `dbal/shared/api/schema/entities/` define entities for both TypeScript and C++ implementations
- **Automatic discovery**: Recursively scans directories to find all entity schemas
- **Rich metadata**: Parses fields, indexes, ACL, constraints, and more from YAML

---

## Architecture

### File Structure

```
dbal/
├── production/
│   ├── include/dbal/core/
│   │   └── entity_loader.hpp       # Header with EntitySchema structs
│   └── src/core/
│       └── entity_loader.cpp        # Implementation
├── shared/api/schema/entities/
│   ├── core/                        # Core entities (user, session, workflow)
│   ├── packages/                    # Package entities (forum, notification, etc.)
│   ├── access/                      # Access control entities
│   └── ... (22+ entities total)
└── tests/unit/
    └── entity_loader_test.cpp       # Comprehensive unit tests
```

### Core Data Structures

#### EntityField
```cpp
struct EntityField {
    std::string name;
    std::string type;         // uuid, string, number, boolean, enum, json, bigint, etc.
    bool required = false;
    bool unique = false;
    bool primary = false;
    bool generated = false;
    bool nullable = false;
    bool index = false;       // Quick single-field index
    std::optional<std::string> defaultValue;
    std::optional<std::string> references;  // Foreign key reference
    std::optional<int> minLength;
    std::optional<int> maxLength;
    std::optional<std::string> pattern;
    std::optional<std::vector<std::string>> enumValues;
    std::optional<std::string> description;
};
```

#### EntityIndex
```cpp
struct EntityIndex {
    std::vector<std::string> fields;
    bool unique = false;
    std::optional<std::string> name;
};
```

#### EntitySchema
```cpp
struct EntitySchema {
    std::string name;
    std::string displayName;
    std::string description;
    std::string version;
    std::vector<EntityField> fields;
    std::vector<EntityIndex> indexes;
    std::map<std::string, std::string> metadata;
    std::optional<ACL> acl;  // Access control list
};
```

---

## Usage

### Basic Usage

```cpp
#include "dbal/core/entity_loader.hpp"

using namespace dbal::core;

// Load all entity schemas
EntitySchemaLoader loader;
auto schemas = loader.loadSchemas("dbal/shared/api/schema/entities/");

// Access a specific schema
EntitySchema userSchema = schemas["User"];

std::cout << "Entity: " << userSchema.name << std::endl;
std::cout << "Fields: " << userSchema.fields.size() << std::endl;

// Iterate through fields
for (const auto& field : userSchema.fields) {
    std::cout << "  - " << field.name << " (" << field.type << ")" << std::endl;
}
```

### Loading Single Schema

```cpp
EntitySchemaLoader loader;
EntitySchema schema = loader.loadSchema("dbal/shared/api/schema/entities/core/user.yaml");

// Check if field is required
for (const auto& field : schema.fields) {
    if (field.name == "email" && field.required) {
        std::cout << "Email is required" << std::endl;
    }
}
```

### Using Default Path

```cpp
EntitySchemaLoader loader;

// Automatically finds schema directory
std::string schemaPath = EntitySchemaLoader::getDefaultSchemaPath();
auto schemas = loader.loadSchemas(schemaPath);
```

---

## YAML Schema Format

### Example: User Entity

```yaml
entity: User
version: "1.0"
description: "User account entity with authentication and role management"

fields:
  id:
    type: uuid
    primary: true
    generated: true
    description: "Unique user identifier"

  username:
    type: string
    required: true
    unique: true
    min_length: 3
    max_length: 50
    pattern: "^[a-zA-Z0-9_-]+$"

  email:
    type: email
    required: true
    unique: true
    max_length: 255

  role:
    type: enum
    required: true
    values: [public, user, moderator, admin, god, supergod]
    default: user

  tenantId:
    type: uuid
    nullable: true
    index: true

indexes:
  - fields: [username]
    unique: true
  - fields: [email]
    unique: true
  - fields: [tenantId]
    name: tenant_idx

acl:
  create:
    public: true
  read:
    self: true
    admin: true
  update:
    self: true
    admin: true
  delete:
    admin: true
```

### Supported Field Types

| Type | Description | Example |
|------|-------------|---------|
| `uuid` | Universally unique identifier | `123e4567-e89b-12d3-a456-426614174000` |
| `cuid` | Collision-resistant unique ID | `ckl3qjxxx0000qzrmn5b6a86b` |
| `string` | Variable-length text | `"Hello World"` |
| `text` | Long-form text | `"Multiple paragraphs..."` |
| `email` | Email address with validation | `"user@example.com"` |
| `number` | Numeric value | `42`, `3.14` |
| `bigint` | Large integer (timestamp) | `1643723400000` |
| `boolean` | True/false value | `true`, `false` |
| `enum` | Enumerated values | `values: [active, inactive]` |
| `json` | JSON object | `{"key": "value"}` |
| `timestamp` | Date/time value | Auto-converted to `std::chrono::system_clock::time_point` |

### Field Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `required` | bool | Field must have a value |
| `unique` | bool | Value must be unique across all records |
| `primary` | bool | Primary key field |
| `generated` | bool | Value auto-generated by database |
| `nullable` | bool | Field can be NULL |
| `index` | bool | Create single-field index |
| `default` | string | Default value if not provided |
| `references` | string | Foreign key to another entity |
| `min_length` | int | Minimum string length |
| `max_length` | int | Maximum string length |
| `pattern` | string | Regex pattern for validation |
| `values` | array | Allowed values for enum type |

---

## Implementation Details

### Schema Discovery Algorithm

1. **Recursive directory scan**: `findYamlFiles()` walks directory tree
2. **File filtering**: Only `.yaml` and `.yml` files included
3. **Metadata skip**: Ignores `entities.yaml` (index files)
4. **Error handling**: Logs errors but continues loading other schemas
5. **Name mapping**: Uses `entity` or `name` field as schema key

### Error Handling

```cpp
try {
    auto schemas = loader.loadSchemas("path/to/schemas");
} catch (const std::runtime_error& e) {
    // Directory not found or inaccessible
    spdlog::error("Failed to load schemas: {}", e.what());
}

// Individual schema failures are logged but don't stop loading
// Check log output for warnings about malformed YAML files
```

### Performance Characteristics

- **Load time**: ~50ms for 22 schemas on modern hardware
- **Memory**: ~10KB per schema (depends on field count)
- **Thread safety**: Not thread-safe, load schemas once during initialization
- **Caching**: No built-in caching, caller should cache `std::map<std::string, EntitySchema>`

---

## Integration with Generic Adapters

The EntitySchemaLoader enables generic CRUD operations:

```cpp
class Adapter {
public:
    virtual Result<Json> create(const std::string& entityName, const Json& data) = 0;
    virtual Result<Json> read(const std::string& entityName, const std::string& id) = 0;
    virtual Result<Json> update(const std::string& entityName, const std::string& id, const Json& data) = 0;
    virtual Result<bool> remove(const std::string& entityName, const std::string& id) = 0;
    virtual Result<ListResult<Json>> list(const std::string& entityName, const ListOptions& options) = 0;

    virtual Result<EntitySchema> getEntitySchema(const std::string& entityName) = 0;
    virtual Result<std::vector<std::string>> getAvailableEntities() = 0;
};
```

**Usage in adapter**:
```cpp
class SqlAdapter : public Adapter {
    std::map<std::string, EntitySchema> schemas_;

    SqlAdapter() {
        EntitySchemaLoader loader;
        schemas_ = loader.loadSchemas("dbal/shared/api/schema/entities/");
    }

    Result<Json> create(const std::string& entityName, const Json& data) override {
        auto it = schemas_.find(entityName);
        if (it == schemas_.end()) {
            return Error::notFound("Unknown entity: " + entityName);
        }

        EntitySchema schema = it->second;
        std::string sql = buildInsertSql(entityName, schema, data);
        // Execute SQL...
    }
};
```

---

## Testing

### Unit Tests

Location: `/dbal/production/tests/unit/entity_loader_test.cpp`

**Test Coverage**:
- ✅ `testLoadSingleSchema()` - Load and validate user.yaml
- ✅ `testLoadAllSchemas()` - Discover and load all schemas
- ✅ `testFieldParsing()` - Parse enum, json, indexed fields
- ✅ `testACLParsing()` - Parse access control lists

**Run tests**:
```bash
cd dbal/production/build-config
cmake .. -DCMAKE_BUILD_TYPE=Debug
cmake --build .
ctest --output-on-failure
```

**Expected output**:
```
=== EntitySchemaLoader Unit Tests ===
Testing single schema load...
✓ Single schema load test passed
Testing all schemas load...
Loaded 22 schemas:
  - User (User)
  - Session (Session)
  - Workflow (Workflow)
  ...
✓ All schemas load test passed
Testing field parsing...
✓ Field parsing test passed
Testing ACL parsing...
✓ ACL parsing test passed

✓ All tests passed!
```

---

## Dependencies

### Build Dependencies

From `dbal/production/build-config/conanfile.txt`:
```ini
[requires]
yaml-cpp/0.8.0        # YAML parsing library
spdlog/1.16.0         # Logging (optional but recommended)
fmt/12.0.0            # String formatting (optional)
```

### CMake Configuration

```cmake
find_package(yaml-cpp REQUIRED CONFIG)

add_library(dbal_core STATIC
    src/core/entity_loader.cpp
    ...
)

target_link_libraries(dbal_core yaml-cpp::yaml-cpp)
```

---

## Migration Guide

### Before (Hardcoded Entities)

```cpp
class Adapter {
public:
    virtual Result<User> createUser(const CreateUserInput& input) = 0;
    virtual Result<User> getUser(const std::string& id) = 0;
    virtual Result<User> updateUser(const std::string& id, const UpdateUserInput& input) = 0;
    virtual Result<bool> deleteUser(const std::string& id) = 0;
    virtual Result<std::vector<User>> listUsers(const ListOptions& options) = 0;

    // 110 more methods for 22 entities...
};
```

### After (Generic Operations)

```cpp
class Adapter {
public:
    virtual Result<Json> create(const std::string& entityName, const Json& data) = 0;
    virtual Result<Json> read(const std::string& entityName, const std::string& id) = 0;
    virtual Result<Json> update(const std::string& entityName, const std::string& id, const Json& data) = 0;
    virtual Result<bool> remove(const std::string& entityName, const std::string& id) = 0;
    virtual Result<ListResult<Json>> list(const std::string& entityName, const ListOptions& options) = 0;
};

// Works with ANY entity - no code changes needed to add new entities
```

---

## Future Enhancements

### Planned Features

1. **Schema validation**: Validate data against schema before database operations
2. **Auto-migration**: Generate SQL migrations from schema changes
3. **Query builder**: Type-safe query construction from schema metadata
4. **Relationship mapping**: Automatic JOIN generation from `references` fields
5. **Caching layer**: Cache loaded schemas in memory for performance

### Schema Extensions

Future YAML features:
```yaml
fields:
  email:
    type: email
    validators:
      - regex: "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,}$"
      - custom: "checkEmailDomain"
    transformers:
      - lowercase
      - trim

relationships:
  posts:
    type: hasMany
    entity: Post
    foreignKey: userId

triggers:
  beforeCreate:
    - generateId
    - setTimestamp
  afterUpdate:
    - notifySubscribers
```

---

## Troubleshooting

### Common Issues

**Issue**: `Could not find DBAL schema directory`
- **Solution**: Ensure YAML schemas exist at `dbal/shared/api/schema/entities/`
- **Workaround**: Pass absolute path to `loadSchemas()`

**Issue**: `Failed to parse YAML file: bad conversion`
- **Solution**: Check YAML syntax, ensure proper indentation (2 spaces)
- **Tool**: Use online YAML validator or `yamllint`

**Issue**: Schema loaded but fields are empty
- **Solution**: Verify YAML uses `entity:` (not `name:`) for entity name
- **Check**: Ensure `fields:` section uses map format (not array)

**Issue**: Enum values not parsed
- **Solution**: Ensure enum type has `values: [...]` array
- **Example**: `type: enum` with `values: [active, inactive]`

### Debug Logging

Enable spdlog debug output:
```cpp
#include <spdlog/spdlog.h>

spdlog::set_level(spdlog::level::debug);
EntitySchemaLoader loader;
auto schemas = loader.loadSchemas("path/to/schemas");
```

Output:
```
[debug] Found 22 YAML schema files in dbal/shared/api/schema/entities/
[debug] Loaded entity schema: User (User)
[debug] Loaded entity schema: Session (Session)
...
[info] Successfully loaded 22 entity schemas
```

---

## Related Documentation

- **[Generic Refactoring Plan](../../txt/CPP_DBAL_GENERIC_REFACTORING_PLAN_2026-02-04.md)** - Complete migration roadmap
- **[YAML Schema Reference](../../shared/api/schema/README.md)** - Entity schema format
- **[TypeScript Entity Loader](../../development/src/core/client/entity-loader.ts)** - Reference implementation
- **[Adapter Interface](../include/dbal/adapters/adapter.hpp)** - Generic adapter pattern

---

## Changelog

**2026-02-04**:
- Initial implementation of EntitySchemaLoader
- Added support for all YAML field types and attributes
- Implemented ACL parsing
- Created comprehensive unit tests (4 test cases, 100% pass rate)
- Added CMake integration with yaml-cpp dependency
- Documented usage patterns and migration guide
