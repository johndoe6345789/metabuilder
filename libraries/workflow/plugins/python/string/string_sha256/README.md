# String SHA256 Plugin

Computes the SHA256 hash of input strings or bytes.

## Plugin Information

- **Type**: `string.sha256`
- **Category**: `string`
- **Class**: `StringSha256`
- **Version**: 1.0.0

## Description

This plugin computes the SHA256 cryptographic hash of the input data and returns it as a hexadecimal string. Optionally, the result can include a `sha256:` prefix for clarity.

## Inputs

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `input` | `string \| bytes` | Yes | `""` | The data to hash |
| `prefix` | `boolean` | No | `false` | Whether to prepend "sha256:" to the result |

## Output

| Field | Type | Description |
|-------|------|-------------|
| `result` | `string` | The SHA256 hash as a hexadecimal string (optionally prefixed) |

## Examples

### Basic Usage (String Input)

```python
inputs = {
    "input": "hello world",
    "prefix": False
}

# Output:
{
    "result": "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
}
```

### With Prefix

```python
inputs = {
    "input": "hello world",
    "prefix": True
}

# Output:
{
    "result": "sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
}
```

### Bytes Input

```python
inputs = {
    "input": b"hello world",
    "prefix": True
}

# Output:
{
    "result": "sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
}
```

### Empty String

```python
inputs = {
    "input": "",
    "prefix": False
}

# Output:
{
    "result": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
}
```

## Use Cases

- **Data Integrity**: Verify file or message integrity
- **Checksums**: Generate checksums for content validation
- **Content Addressing**: Create content-based identifiers
- **Security**: Hash passwords or sensitive data (note: use dedicated password hashing for production)
- **Deduplication**: Identify duplicate content

## Implementation Details

- Uses Python's built-in `hashlib.sha256()` function
- Automatically converts string inputs to UTF-8 bytes
- Accepts both string and bytes inputs
- Returns lowercase hexadecimal string
- Hash length is always 64 characters (256 bits)

## Testing

Run the test suite:

```bash
python3 test_direct.py
```

## Related Plugins

- `string.md5` - MD5 hash (less secure, faster)
- `string.sha1` - SHA1 hash (deprecated for security)
- `string.sha512` - SHA512 hash (more secure, slower)

## Notes

- SHA256 is part of the SHA-2 family of cryptographic hash functions
- Produces a 256-bit (32-byte) hash value
- Collision-resistant and suitable for security applications
- For password hashing, consider dedicated algorithms like bcrypt or Argon2
