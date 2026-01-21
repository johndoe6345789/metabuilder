# Transform Node Plugin

Transform data using template expressions and mappings.

## Installation

```bash
npm install @metabuilder/workflow-plugin-transform
```

## Usage

```json
{
  "id": "transform-users",
  "type": "operation",
  "nodeType": "transform",
  "parameters": {
    "mapping": {
      "id": "{{ $json.user_id }}",
      "name": "{{ $json.first_name }} {{ $json.last_name }}",
      "email": "{{ $json.email_address }}",
      "status": "{{ $json.is_active ? 'active' : 'inactive' }}"
    },
    "flatten": false,
    "format": "json"
  }
}
```

## Operations

### Basic Mapping
Transform data by mapping input fields to output structure:

```json
{
  "mapping": {
    "userId": "{{ $json.id }}",
    "userName": "{{ $json.name }}"
  }
}
```

### Nested Mapping
Create nested output structures:

```json
{
  "mapping": {
    "user": {
      "id": "{{ $json.id }}",
      "profile": {
        "name": "{{ $json.name }}",
        "email": "{{ $json.email }}"
      }
    }
  }
}
```

### Array Mapping
Transform array of objects:

```json
{
  "mapping": [
    {
      "id": "{{ $json.id }}",
      "name": "{{ $json.name }}"
    }
  ]
}
```

### Flatten Nested Data
Convert nested objects to flat structure:

```json
{
  "mapping": "{{ $json }}",
  "flatten": true
}
```

### Group by Field
Group array items by a specific field:

```json
{
  "mapping": "{{ $json }}",
  "groupBy": "status"
}
```

### Format Output
Convert result to different formats:

```json
{
  "mapping": "{{ $json }}",
  "format": "csv"
}
```

## Parameters

- `mapping` (required): Field mappings with template expressions
  - Can be an object for field-by-field mapping
  - Can be an array for transforming arrays
  - Can be a string template for direct transformation
- `flatten` (optional): Flatten nested objects to dot notation (default: false)
- `groupBy` (optional): Group array items by field name
- `format` (optional): Output format - json, csv, xml, yaml (default: json)

## Template Expressions

Mapping values support full template syntax:

- `{{ $json.fieldName }}` - Access input field
- `{{ $json.field1 + $json.field2 }}` - Math operations
- `{{ $json.status === 'active' ? 'yes' : 'no' }}` - Conditionals
- `{{ $json.name.toUpperCase() }}` - String methods
- `{{ $utils.flatten($json) }}` - Utility functions

## Output Formats

### JSON (default)
Returns structured JavaScript object/array

### CSV
Converts array of objects to CSV format:
```
name,email,status
John Doe,john@example.com,active
Jane Smith,jane@example.com,inactive
```

### XML
Converts to XML structure:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<root>
  <user>
    <id>123</id>
    <name>John</name>
  </user>
</root>
```

### YAML
Converts to YAML format:
```yaml
- id: 123
  name: John
  email: john@example.com
```

## Features

- Template expression interpolation in mappings
- Nested object transformation
- Array mapping and transformation
- Object flattening to dot notation
- Array grouping by field
- Multiple output formats (JSON, CSV, XML, YAML)
- Flexible mapping syntax (object, array, or template string)
- Type-safe transformation

## Examples

### Simple Field Mapping

```json
{
  "id": "transform-rename",
  "nodeType": "transform",
  "parameters": {
    "mapping": {
      "firstName": "{{ $json.first_name }}",
      "lastName": "{{ $json.last_name }}",
      "emailAddress": "{{ $json.email }}"
    }
  }
}
```

### Computed Fields

```json
{
  "id": "transform-computed",
  "nodeType": "transform",
  "parameters": {
    "mapping": {
      "id": "{{ $json.id }}",
      "fullName": "{{ $json.firstName + ' ' + $json.lastName }}",
      "initials": "{{ $json.firstName.charAt(0) + $json.lastName.charAt(0) }}",
      "isActive": "{{ $json.status === 'active' }}"
    }
  }
}
```

### Array to CSV

```json
{
  "id": "transform-to-csv",
  "nodeType": "transform",
  "parameters": {
    "mapping": "{{ $json }}",
    "format": "csv"
  }
}
```

### Flatten and Group

```json
{
  "id": "transform-flatten-group",
  "nodeType": "transform",
  "parameters": {
    "mapping": "{{ $json }}",
    "flatten": true,
    "groupBy": "department"
  }
}
```

## License

MIT
