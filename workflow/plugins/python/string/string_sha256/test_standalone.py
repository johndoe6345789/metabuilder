"""Standalone test for StringSha256 plugin."""

import sys
import os

# Add parent directories to path for imports
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../../..'))

from string.string_sha256.string_sha256 import StringSha256


def test_sha256_plugin():
    """Test the SHA256 plugin functionality."""
    plugin = StringSha256()

    print("Testing StringSha256 plugin...")
    print()

    # Test 1: String input without prefix
    print("Test 1: String input without prefix")
    inputs = {"input": "hello world", "prefix": False}
    result = plugin.execute(inputs)
    expected = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    print(f"  Input: {inputs['input']}")
    print(f"  Expected: {expected}")
    print(f"  Result:   {result['result']}")
    assert result["result"] == expected, "Test 1 failed!"
    print("  ✓ PASSED")
    print()

    # Test 2: String input with prefix
    print("Test 2: String input with prefix")
    inputs = {"input": "hello world", "prefix": True}
    result = plugin.execute(inputs)
    expected = "sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    print(f"  Input: {inputs['input']}")
    print(f"  Expected: {expected}")
    print(f"  Result:   {result['result']}")
    assert result["result"] == expected, "Test 2 failed!"
    print("  ✓ PASSED")
    print()

    # Test 3: Bytes input with prefix
    print("Test 3: Bytes input with prefix")
    inputs = {"input": b"hello world", "prefix": True}
    result = plugin.execute(inputs)
    expected = "sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
    print(f"  Input: {inputs['input']}")
    print(f"  Expected: {expected}")
    print(f"  Result:   {result['result']}")
    assert result["result"] == expected, "Test 3 failed!"
    print("  ✓ PASSED")
    print()

    # Test 4: Empty string
    print("Test 4: Empty string")
    inputs = {"input": "", "prefix": False}
    result = plugin.execute(inputs)
    expected = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
    print(f"  Input: (empty string)")
    print(f"  Expected: {expected}")
    print(f"  Result:   {result['result']}")
    assert result["result"] == expected, "Test 4 failed!"
    print("  ✓ PASSED")
    print()

    # Test 5: Default prefix behavior
    print("Test 5: Default prefix behavior (should be False)")
    inputs = {"input": "test"}
    result = plugin.execute(inputs)
    print(f"  Input: {inputs['input']}")
    print(f"  Result: {result['result']}")
    assert not result["result"].startswith("sha256:"), "Test 5 failed!"
    print("  ✓ PASSED (no prefix by default)")
    print()

    # Test 6: Unicode string
    print("Test 6: Unicode string")
    inputs = {"input": "Hello 世界 🌍", "prefix": False}
    result = plugin.execute(inputs)
    print(f"  Input: {inputs['input']}")
    print(f"  Result: {result['result']}")
    assert len(result["result"]) == 64, "Test 6 failed - invalid hash length!"
    # Verify it's valid hex
    int(result["result"], 16)
    print("  ✓ PASSED (valid hex hash)")
    print()

    print("=" * 50)
    print("All tests passed! ✓")
    print("=" * 50)


if __name__ == "__main__":
    test_sha256_plugin()
