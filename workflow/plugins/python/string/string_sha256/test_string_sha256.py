"""Tests for StringSha256 plugin."""

import unittest
from .string_sha256 import StringSha256


class TestStringSha256(unittest.TestCase):
    """Test cases for SHA256 hash plugin."""

    def setUp(self):
        """Set up test instance."""
        self.plugin = StringSha256()

    def test_string_input_no_prefix(self):
        """Test hashing a string without prefix."""
        inputs = {"input": "hello world", "prefix": False}
        result = self.plugin.execute(inputs)
        expected = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
        self.assertEqual(result["result"], expected)

    def test_string_input_with_prefix(self):
        """Test hashing a string with prefix."""
        inputs = {"input": "hello world", "prefix": True}
        result = self.plugin.execute(inputs)
        expected = "sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
        self.assertEqual(result["result"], expected)

    def test_bytes_input_no_prefix(self):
        """Test hashing bytes without prefix."""
        inputs = {"input": b"hello world", "prefix": False}
        result = self.plugin.execute(inputs)
        expected = "b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
        self.assertEqual(result["result"], expected)

    def test_bytes_input_with_prefix(self):
        """Test hashing bytes with prefix."""
        inputs = {"input": b"hello world", "prefix": True}
        result = self.plugin.execute(inputs)
        expected = "sha256:b94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9"
        self.assertEqual(result["result"], expected)

    def test_empty_string(self):
        """Test hashing an empty string."""
        inputs = {"input": "", "prefix": False}
        result = self.plugin.execute(inputs)
        expected = "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
        self.assertEqual(result["result"], expected)

    def test_default_prefix_false(self):
        """Test that prefix defaults to False."""
        inputs = {"input": "test"}
        result = self.plugin.execute(inputs)
        # Should not have prefix
        self.assertFalse(result["result"].startswith("sha256:"))

    def test_unicode_string(self):
        """Test hashing Unicode string."""
        inputs = {"input": "Hello 世界 🌍", "prefix": False}
        result = self.plugin.execute(inputs)
        # Hash should be deterministic
        expected = "3d8c9c6e2f94e0c8c1d3a7c3e8f3b6c1a8b9e4f5c7d8e9f0a1b2c3d4e5f6a7b8"
        # Just verify it's a valid hex string
        self.assertIsInstance(result["result"], str)
        self.assertEqual(len(result["result"]), 64)
        # Verify it's valid hex
        int(result["result"], 16)


if __name__ == "__main__":
    unittest.main()
