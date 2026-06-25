#!/bin/bash
# Schema validation wrapper using jsonschema-cli
# Install: cargo install jsonschema-cli
# Documentation: https://crates.io/crates/jsonschema-cli

set -e

# Try to find jsonschema-cli in multiple locations
if command -v jsonschema-cli &> /dev/null; then
    VALIDATOR="jsonschema-cli"
elif [ -f ~/.cargo/bin/jsonschema-cli ]; then
    VALIDATOR=~/.cargo/bin/jsonschema-cli
elif [ -f /usr/local/bin/jsonschema-cli ]; then
    VALIDATOR=/usr/local/bin/jsonschema-cli
else
    echo "Error: jsonschema-cli not found" >&2
    echo "" >&2
    echo "Install with:" >&2
    echo "  cargo install jsonschema-cli" >&2
    echo "" >&2
    echo "Or download from: https://crates.io/crates/jsonschema-cli" >&2
    exit 1
fi

# Execute validator with all arguments
exec "$VALIDATOR" "$@"
