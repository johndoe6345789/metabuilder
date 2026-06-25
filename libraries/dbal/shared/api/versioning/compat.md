version: "1.0"

compatibility:
  description: "Compatibility rules for API versioning across TypeScript and C++ implementations"
  
  semver:
    major: "Breaking changes - requires migration"
    minor: "New features - backward compatible"
    patch: "Bug fixes - backward compatible"
    
  breaking_changes:
    - "Removing entity fields"
    - "Removing operations"
    - "Changing field types incompatibly"
    - "Changing operation signatures"
    - "Removing enum values"
    
  non_breaking_changes:
    - "Adding new entities"
    - "Adding new operations"
    - "Adding optional fields"
    - "Adding new enum values"
    - "Adding indexes"
    
  deprecation_policy:
    duration: "2 major versions"
    process:
      - "Mark as deprecated in API schema"
      - "Add deprecation warnings in both implementations"
      - "Document migration path"
      - "Remove in next major version"

language_compatibility:
  typescript:
    min_version: "5.0"
    target: "ES2022"
    module: "ES2022"
    notes:
      - "Uses async/await for all operations"
      - "Errors thrown as DBALError instances"
      - "Optional fields use TypeScript ? syntax"
      
  cpp:
    min_version: "C++17"
    compiler: "GCC 9+, Clang 10+, MSVC 2019+"
    notes:
      - "Uses std::optional for optional fields"
      - "Errors returned via Result<T> type"
      - "Thread-safe by default"

type_mapping:
  uuid:
    typescript: "string"
    cpp: "std::string"
    notes: "UUID v4 format"
    
  string:
    typescript: "string"
    cpp: "std::string"
    
  text:
    typescript: "string"
    cpp: "std::string"
    notes: "Large text, no length limit"
    
  integer:
    typescript: "number"
    cpp: "int"
    notes: "32-bit signed integer"
    
  bigint:
    typescript: "bigint"
    cpp: "int64_t"
    notes: "64-bit integer"
    
  boolean:
    typescript: "boolean"
    cpp: "bool"
    
  datetime:
    typescript: "Date"
    cpp: "std::chrono::system_clock::time_point"
    notes: "ISO 8601 format in JSON"
    
  json:
    typescript: "Record<string, unknown>"
    cpp: "Json (map<string, string>)"
    notes: "Serialized as JSON string in storage"
    
  enum:
    typescript: "string union type"
    cpp: "enum class"
    notes: "Values must be defined in schema"

error_handling:
  typescript:
    pattern: "Throw DBALError"
    example: |
      throw DBALError.notFound('User not found')
      
  cpp:
    pattern: "Return Result<T>"
    example: |
      return Error::notFound("User not found");
      
  compatibility:
    - "Error codes must match exactly"
    - "Error messages should be identical"
    - "Additional fields in details are allowed"

async_patterns:
  typescript:
    pattern: "async/await with Promises"
    example: |
      const user = await client.users.read(id)
      
  cpp:
    pattern: "Synchronous (blocking)"
    example: |
      auto result = client.createUser(input);
      if (result.isOk()) {
          User user = result.value();
      }
    notes:
      - "C++ daemon handles async I/O internally"
      - "Client calls are synchronous for simplicity"
      - "Future: Consider coroutines (C++20)"

serialization:
  json:
    format: "Standard JSON"
    date_format: "ISO 8601"
    null_handling: "Optional fields may be omitted or null"
    
  wire_protocol:
    development: "JSON over WebSocket"
    production: "Protobuf over gRPC"
    fallback: "JSON over HTTP"

testing_compatibility:
  conformance_tests:
    format: "YAML test vectors"
    runner: "Python script"
    execution: "Parallel (TS and C++)"
    comparison: "Output must match exactly"
    
  test_structure:
    input: "Operation + parameters"
    expected: "Status + output or error"
    variables: "Support $prev, $steps[n]"
    
  tolerance:
    timestamps: "Within 1 second"
    float_precision: "6 decimal places"
    uuid_format: "Any valid v4"

migration_guide:
  v1_to_v2:
    - "Review CHANGELOG.md"
    - "Run migration script: scripts/migrate_v1_to_v2.py"
    - "Update entity schemas"
    - "Regenerate types: python tools/codegen/gen_types.py"
    - "Rebuild both implementations"
    - "Run conformance tests"
    
  rollback:
    - "Restore from backup"
    - "Downgrade DBAL version"
    - "Revert schema changes"
    - "Rebuild"

versioning_in_production:
  strategy: "Side-by-side versions"
  example: |
    /usr/local/lib/dbal/v1/
    /usr/local/lib/dbal/v2/
    
  client_selection:
    - "Client specifies API version in config"
    - "Daemon routes to appropriate handler"
    - "Multiple versions supported simultaneously"
    
  sunset_policy:
    - "Support N-2 versions"
    - "6 month deprecation period"
    - "Email notifications before removal"
